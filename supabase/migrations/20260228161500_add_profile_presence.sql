alter table public.profiles
add column if not exists last_seen_at timestamptz;

update public.profiles
set last_seen_at = coalesce(last_seen_at, updated_at, created_at);

create or replace function public.heartbeat_presence()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
	next_seen_at timestamptz := now();
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	update public.profiles
	set last_seen_at = next_seen_at
	where id = current_user_id;

	return next_seen_at;
end;
$$;
