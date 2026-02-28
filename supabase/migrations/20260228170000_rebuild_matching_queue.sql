create table if not exists public.matching_queue (
	user_id uuid not null references public.profiles(id) on delete cascade,
	target_gender text null,
	target_region text null,
	target_zodiac text null,
	created_at timestamptz null default now()
);

do $$
begin
	if not exists (
		select 1
		from pg_indexes
		where schemaname = 'public'
			and indexname = 'matching_queue_user_id_key'
	) then
		create unique index matching_queue_user_id_key
			on public.matching_queue(user_id);
	end if;
end
$$;

alter table public.matching_queue
	alter column user_id set not null,
	alter column created_at set default now();

do $$
declare
	policy_record record;
	trigger_record record;
begin
	for policy_record in
		select p.policyname
		from pg_policies as p
		where p.schemaname = 'public'
			and p.tablename = 'matching_queue'
	loop
		execute format(
			'drop policy if exists %I on public.matching_queue',
			policy_record.policyname
		);
	end loop;

	for trigger_record in
		select t.tgname
		from pg_trigger as t
		where t.tgrelid = 'public.matching_queue'::regclass
			and not t.tgisinternal
	loop
		execute format(
			'drop trigger if exists %I on public.matching_queue',
			trigger_record.tgname
		);
	end loop;
end
$$;

drop function if exists public.enqueue_matching_queue_for_viewer(text, text, text);
drop function if exists public.sync_matching_queue_for_viewer(text, text, text);
drop function if exists public.upsert_matching_queue_for_viewer(text, text, text);
drop function if exists public.remove_matching_queue_for_viewer();
drop function if exists public.clear_matching_queue_for_viewer();
drop function if exists public.touch_matching_queue_updated_at();
drop function if exists public.matching_queue_touch_updated_at();

alter table public.matching_queue enable row level security;

create policy "Users can view own matching queue"
on public.matching_queue
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own matching queue"
on public.matching_queue
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own matching queue"
on public.matching_queue
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own matching queue"
on public.matching_queue
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.upsert_matching_queue_for_viewer(
	p_gender text default null,
	p_region text default null,
	p_zodiac text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
	current_user_id uuid := auth.uid();
	normalized_gender text;
	normalized_region text;
	normalized_zodiac text;
begin
	if current_user_id is null then
		raise exception 'Not authenticated';
	end if;

	normalized_gender := nullif(btrim(coalesce(p_gender, '')), '');
	normalized_region := nullif(btrim(coalesce(p_region, '')), '');
	normalized_zodiac := nullif(btrim(coalesce(p_zodiac, '')), '');

	if normalized_gender is not null and lower(normalized_gender) = 'any' then
		normalized_gender := null;
	end if;

	if normalized_region is not null and lower(normalized_region) = 'any' then
		normalized_region := null;
	end if;

	if normalized_zodiac is not null and lower(normalized_zodiac) = 'any' then
		normalized_zodiac := null;
	end if;

	insert into public.matching_queue (
		user_id,
		target_gender,
		target_region,
		target_zodiac
	)
	values (
		current_user_id,
		normalized_gender,
		normalized_region,
		normalized_zodiac
	)
	on conflict (user_id) do update
	set
		target_gender = excluded.target_gender,
		target_region = excluded.target_region,
		target_zodiac = excluded.target_zodiac;

	return true;
end;
$$;

create or replace function public.remove_matching_queue_for_viewer()
returns boolean
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

	delete from public.matching_queue
	where user_id = current_user_id;

	return true;
end;
$$;
