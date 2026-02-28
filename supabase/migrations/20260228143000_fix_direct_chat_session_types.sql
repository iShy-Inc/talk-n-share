with direct_sessions as (
	select distinct n.reference_id as session_id
	from public.notifications as n
	join public.matches as m
		on m.id = n.reference_id
	where n.reference_id is not null
		and n.link like '/messages?sessionId=%'
		and n.content like '% started a conversation with you.'
		and m.type = 'match'
)
update public.matches as m
set
	type = 'direct',
	status = coalesce(m.status, 'active'),
	is_revealed = true
from direct_sessions as ds
where m.id = ds.session_id;

create or replace function public.create_or_get_direct_chat(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
	existing_session_id uuid;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_user_id is null then
		raise exception 'Target user is required';
	end if;

	if target_user_id = current_user_id then
		raise exception 'Cannot create direct chat with yourself';
	end if;

	select m.id
	into existing_session_id
	from public.matches as m
	where (
		(m.user1_id = current_user_id and m.user2_id = target_user_id)
		or (m.user1_id = target_user_id and m.user2_id = current_user_id)
	)
		and m.type = 'direct'
	order by m.created_at asc
	limit 1;

	if existing_session_id is not null then
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
		current_user_id,
		target_user_id,
		'direct',
		'active',
		true,
		false,
		false
	)
	returning id into existing_session_id;

	return existing_session_id;
end;
$$;
