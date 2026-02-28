create or replace function public.get_chat_sessions_for_viewer()
returns table (
	id uuid,
	other_user_id uuid,
	display_name text,
	avatar_url text,
	is_public boolean,
	session_type text,
	is_revealed boolean,
	status text,
	created_at timestamptz
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

	return query
	select
		m.id,
		case
			when m.user1_id = current_user_id then m.user2_id
			else m.user1_id
		end as other_user_id,
		case
			when m.type = 'match' and coalesce(m.is_revealed, false) = false
				then 'Người ghép đôi ẩn danh'
			else coalesce(p.display_name, 'Người dùng')
		end as display_name,
		case
			when m.type = 'match' and coalesce(m.is_revealed, false) = false
				then null
			else p.avatar_url
		end as avatar_url,
		case
			when m.type = 'match' and coalesce(m.is_revealed, false) = false
				then null
			else p.is_public
		end as is_public,
		m.type as session_type,
		coalesce(m.is_revealed, false) as is_revealed,
		m.status,
		m.created_at
	from public.matches as m
	left join public.profiles as p
		on p.id = case
			when m.user1_id = current_user_id then m.user2_id
			else m.user1_id
		end
	where current_user_id in (m.user1_id, m.user2_id)
	order by m.created_at desc;
end;
$$;

create or replace function public.get_chat_session_for_viewer(target_session_id uuid)
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

	return query
	select
		m.id,
		case
			when m.user1_id = current_user_id then m.user2_id
			else m.user1_id
		end as other_user_id,
		case
			when m.type = 'match' and coalesce(m.is_revealed, false) = false
				then 'Người ghép đôi ẩn danh'
			else coalesce(p.display_name, 'Người dùng')
		end as display_name,
		case
			when m.type = 'match' and coalesce(m.is_revealed, false) = false
				then null
			else p.avatar_url
		end as avatar_url,
		case
			when m.type = 'match' and coalesce(m.is_revealed, false) = false
				then null
			else p.is_public
		end as is_public,
		m.type as session_type,
		coalesce(m.is_revealed, false) as is_revealed,
		m.status,
		m.created_at,
		m.user1_id,
		m.user2_id,
		coalesce(m.user1_liked, false) as user1_liked,
		coalesce(m.user2_liked, false) as user2_liked
	from public.matches as m
	left join public.profiles as p
		on p.id = case
			when m.user1_id = current_user_id then m.user2_id
			else m.user1_id
		end
	where m.id = target_session_id
		and current_user_id in (m.user1_id, m.user2_id)
	limit 1;
end;
$$;
