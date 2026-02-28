drop function if exists public.find_match_v2(uuid, text, text, text);

create or replace function public.find_match_v2(
	current_user_id uuid,
	p_gender text default null,
	p_region text default null,
	p_zodiac text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
	viewer_id uuid := coalesce(auth.uid(), current_user_id);
	normalized_gender text := nullif(btrim(coalesce(p_gender, '')), '');
	normalized_region text := nullif(btrim(coalesce(p_region, '')), '');
	normalized_zodiac text := nullif(btrim(coalesce(p_zodiac, '')), '');
	current_profile public.profiles%rowtype;
	existing_queue public.matching_queue%rowtype;
	existing_session_id uuid;
	candidate_user_id uuid;
	new_session_id uuid;
begin
	if viewer_id is null then
		raise exception 'Not authenticated';
	end if;

	if auth.uid() is not null and current_user_id is not null and auth.uid() <> current_user_id then
		raise exception 'User mismatch';
	end if;

	if normalized_gender is not null and lower(normalized_gender) = 'any' then
		normalized_gender := null;
	end if;

	if normalized_region is not null and lower(normalized_region) = 'any' then
		normalized_region := null;
	end if;

	if normalized_zodiac is not null and lower(normalized_zodiac) = 'any' then
		normalized_zodiac := null;
	end if;

	select p.*
	into current_profile
	from public.profiles as p
	where p.id = viewer_id
	limit 1;

	if not found then
		raise exception 'Profile not found';
	end if;

	select m.id
	into existing_session_id
	from public.matches as m
	where m.type = 'match'
		and coalesce(m.status, 'active') = 'active'
		and viewer_id in (m.user1_id, m.user2_id)
	order by m.created_at asc
	limit 1;

	if existing_session_id is not null then
		return existing_session_id;
	end if;

	select q.*
	into existing_queue
	from public.matching_queue as q
	where q.user_id = viewer_id
	limit 1;

	if found then
		normalized_gender := coalesce(normalized_gender, existing_queue.target_gender);
		normalized_region := coalesce(normalized_region, existing_queue.target_region);
		normalized_zodiac := coalesce(normalized_zodiac, existing_queue.target_zodiac);

		if existing_queue.target_gender is distinct from normalized_gender
			or existing_queue.target_region is distinct from normalized_region
			or existing_queue.target_zodiac is distinct from normalized_zodiac then
			update public.matching_queue
			set
				target_gender = normalized_gender,
				target_region = normalized_region,
				target_zodiac = normalized_zodiac
			where user_id = viewer_id;
		end if;
	else
		insert into public.matching_queue (
			user_id,
			target_gender,
			target_region,
			target_zodiac
		)
		values (
			viewer_id,
			normalized_gender,
			normalized_region,
			normalized_zodiac
		)
		on conflict (user_id) do update
		set
			target_gender = excluded.target_gender,
			target_region = excluded.target_region,
			target_zodiac = excluded.target_zodiac;
	end if;

	select q.user_id
	into candidate_user_id
	from public.matching_queue as q
	join public.profiles as candidate_profile
		on candidate_profile.id = q.user_id
	where q.user_id <> viewer_id
		and not exists (
			select 1
			from public.matches as m
			where m.type = 'match'
				and coalesce(m.status, 'active') = 'active'
				and q.user_id in (m.user1_id, m.user2_id)
		)
		and (
			normalized_gender is null
			or candidate_profile.gender::text = normalized_gender
		)
		and (
			(normalized_gender is null and normalized_region is null and normalized_zodiac is null)
			or (
				(normalized_gender is not null and candidate_profile.gender::text = normalized_gender)
				or (normalized_region is not null and candidate_profile.location = normalized_region)
				or (normalized_zodiac is not null and candidate_profile.zodiac = normalized_zodiac)
			)
		)
		and (
			q.target_gender is null
			or current_profile.gender::text = q.target_gender
		)
		and (
			(q.target_gender is null and q.target_region is null and q.target_zodiac is null)
			or (
				(q.target_gender is not null and current_profile.gender::text = q.target_gender)
				or (q.target_region is not null and current_profile.location = q.target_region)
				or (q.target_zodiac is not null and current_profile.zodiac = q.target_zodiac)
			)
		)
	order by
		(
			case
				when normalized_gender is not null and candidate_profile.gender::text = normalized_gender then 1
				else 0
			end
			+ case
				when normalized_region is not null and candidate_profile.location = normalized_region then 1
				else 0
			end
			+ case
				when normalized_zodiac is not null and candidate_profile.zodiac = normalized_zodiac then 1
				else 0
			end
		) desc,
		(
			case
				when q.target_gender is not null and current_profile.gender::text = q.target_gender then 1
				else 0
			end
			+ case
				when q.target_region is not null and current_profile.location = q.target_region then 1
				else 0
			end
			+ case
				when q.target_zodiac is not null and current_profile.zodiac = q.target_zodiac then 1
				else 0
			end
		) desc,
		(
			case
				when normalized_gender is not null and candidate_profile.gender::text = normalized_gender then 1
				else 0
			end
			+ case
				when normalized_region is not null and candidate_profile.location = normalized_region then 1
				else 0
			end
			+ case
				when normalized_zodiac is not null and candidate_profile.zodiac = normalized_zodiac then 1
				else 0
			end
			+ case
				when q.target_gender is not null and current_profile.gender::text = q.target_gender then 1
				else 0
			end
			+ case
				when q.target_region is not null and current_profile.location = q.target_region then 1
				else 0
			end
			+ case
				when q.target_zodiac is not null and current_profile.zodiac = q.target_zodiac then 1
				else 0
			end
		) desc,
		q.created_at asc nulls first,
		q.user_id asc
	limit 1
	for update skip locked;

	if candidate_user_id is null then
		return null;
	end if;

	select m.id
	into existing_session_id
	from public.matches as m
	where m.type = 'match'
		and coalesce(m.status, 'active') = 'active'
		and (
			(m.user1_id = viewer_id and m.user2_id = candidate_user_id)
			or (m.user1_id = candidate_user_id and m.user2_id = viewer_id)
		)
	order by m.created_at asc
	limit 1;

	if existing_session_id is not null then
		delete from public.matching_queue
		where user_id in (viewer_id, candidate_user_id);
		return existing_session_id;
	end if;

	insert into public.matches (
		user1_id,
		user2_id,
		type,
		status,
		is_revealed,
		user1_liked,
		user2_liked
	)
	values (
		viewer_id,
		candidate_user_id,
		'match',
		'active',
		false,
		false,
		false
	)
	returning id into new_session_id;

	delete from public.matching_queue
	where user_id in (viewer_id, candidate_user_id);

	return new_session_id;
end;
$$;
