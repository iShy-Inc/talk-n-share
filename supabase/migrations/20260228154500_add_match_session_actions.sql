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
	is_match_ended boolean := false;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_session_id is null then
		raise exception 'Target session is required';
	end if;

	select m.*
	into target_match
	from public.matches as m
	where m.id = target_session_id
		and m.type = 'match'
		and current_user_id in (m.user1_id, m.user2_id)
	limit 1;

	if not found then
		raise exception 'Match session not found';
	end if;

	select exists(
		select 1
		from public.ended_match_sessions as ems
		where ems.session_id = target_session_id
	)
	into is_match_ended;

	if is_match_ended or coalesce(target_match.status, 'active') <> 'active' then
		return query
		select * from public.get_chat_session_for_viewer(target_session_id);
		return;
	end if;

	if current_user_id = target_match.user1_id then
		update public.matches as m
		set user1_liked = true
		where m.id = target_session_id;
	else
		update public.matches as m
		set user2_liked = true
		where m.id = target_session_id;
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
	target_match_exists boolean := false;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_session_id is null then
		raise exception 'Target session is required';
	end if;

	select exists(
		select 1
		from public.matches as m
		where m.id = target_session_id
			and m.type = 'match'
			and current_user_id in (m.user1_id, m.user2_id)
	)
	into target_match_exists;

	if not target_match_exists then
		raise exception 'Match session not found';
	end if;

	insert into public.ended_match_sessions (
		session_id,
		ended_by_user_id
	)
	values (
		target_session_id,
		current_user_id
	)
	on conflict (session_id) do update
	set
		ended_by_user_id = excluded.ended_by_user_id,
		ended_at = now();

	return query
	select * from public.get_chat_session_for_viewer(target_session_id);
end;
$$;
