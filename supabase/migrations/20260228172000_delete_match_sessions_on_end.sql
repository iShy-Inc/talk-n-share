drop function if exists public.end_match_for_viewer(uuid);

create or replace function public.end_match_for_viewer(target_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
	deleted_rows integer := 0;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if target_session_id is null then
		raise exception 'Target session is required';
	end if;

	delete from public.matches as m
	where m.id = target_session_id
		and m.type = 'match'
		and current_user_id in (m.user1_id, m.user2_id);

	get diagnostics deleted_rows = row_count;

	if deleted_rows = 0 then
		raise exception 'Match session not found';
	end if;

	return true;
end;
$$;

drop table if exists public.ended_match_sessions cascade;
