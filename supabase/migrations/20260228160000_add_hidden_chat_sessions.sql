create table if not exists public.hidden_chat_sessions (
	user_id uuid not null references public.profiles(id) on delete cascade,
	session_id uuid not null references public.matches(id) on delete cascade,
	hidden_at timestamptz not null default now(),
	primary key (user_id, session_id)
);

create index if not exists idx_hidden_chat_sessions_session_id
	on public.hidden_chat_sessions(session_id);

alter table public.hidden_chat_sessions enable row level security;

drop policy if exists "Users can view their hidden sessions" on public.hidden_chat_sessions;
create policy "Users can view their hidden sessions"
on public.hidden_chat_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can hide their own sessions" on public.hidden_chat_sessions;
create policy "Users can hide their own sessions"
on public.hidden_chat_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

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
		and not exists (
			select 1
			from public.hidden_chat_sessions as h
			where h.user_id = current_user_id
				and h.session_id = m.id
		)
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
		and not exists (
			select 1
			from public.hidden_chat_sessions as h
			where h.user_id = current_user_id
				and h.session_id = m.id
		)
	limit 1;
end;
$$;

create or replace function public.hide_chat_session_for_viewer(target_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
	target_match_type text;
	target_match_status text;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_session_id is null then
		raise exception 'Target session is required';
	end if;

	select m.type, coalesce(m.status, 'active')
	into target_match_type, target_match_status
	from public.matches as m
	where m.id = target_session_id
		and current_user_id in (m.user1_id, m.user2_id)
	limit 1;

	if target_match_type is null then
		raise exception 'Chat session not found';
	end if;

	if target_match_type = 'match' and target_match_status = 'active' then
		raise exception 'Active match sessions cannot be removed from history';
	end if;

	if target_match_type <> 'match' and target_match_type <> 'direct' then
		raise exception 'Only match or direct sessions can be removed from history';
	end if;

	insert into public.hidden_chat_sessions (user_id, session_id)
	values (current_user_id, target_session_id)
	on conflict (user_id, session_id) do update
	set hidden_at = now();

	return true;
end;
$$;
