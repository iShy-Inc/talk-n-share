create or replace function public.like_match_for_viewer(target_session_id uuid)
returns table (
	id uuid,
	other_user_id uuid,
	display_name text,
	avatar_url text,
	is_public boolean,
	session_type text,
	is_revealed boolean,
	status text,
	created_at timestamptz,
	user1_id uuid,
	user2_id uuid,
	user1_liked boolean,
	user2_liked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
	target_match public.matches%rowtype;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_session_id is null then
		raise exception 'Target session is required';
	end if;

	select *
	into target_match
	from public.matches
	where id = target_session_id
		and type = 'match'
		and current_user_id in (user1_id, user2_id)
	limit 1;

	if not found then
		raise exception 'Match session not found';
	end if;

	if coalesce(target_match.status, 'active') <> 'active' then
		return query
		select * from public.get_chat_session_for_viewer(target_session_id);
		return;
	end if;

	if current_user_id = target_match.user1_id then
		update public.matches
		set user1_liked = true
		where id = target_session_id;
	else
		update public.matches
		set user2_liked = true
		where id = target_session_id;
	end if;

	return query
	select * from public.get_chat_session_for_viewer(target_session_id);
end;
$$;

create or replace function public.end_match_for_viewer(target_session_id uuid)
returns table (
	id uuid,
	other_user_id uuid,
	display_name text,
	avatar_url text,
	is_public boolean,
	session_type text,
	is_revealed boolean,
	status text,
	created_at timestamptz,
	user1_id uuid,
	user2_id uuid,
	user1_liked boolean,
	user2_liked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_session_id is null then
		raise exception 'Target session is required';
	end if;

	update public.matches
	set status = 'ended'
	where id = target_session_id
		and type = 'match'
		and current_user_id in (user1_id, user2_id);

	return query
	select * from public.get_chat_session_for_viewer(target_session_id);
end;
$$;
