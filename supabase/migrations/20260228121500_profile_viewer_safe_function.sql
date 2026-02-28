-- RLS can only filter rows, not individual columns.
-- To let private profiles expose only display_name + avatar_url (+ role/is_public for UI),
-- expose a masked projection through a SECURITY DEFINER function.

create or replace function public.get_profile_for_viewer(target_profile_id uuid)
returns table (
	id uuid,
	avatar_url text,
	bio text,
	birth_date date,
	birth_visibility text,
	created_at timestamptz,
	display_name text,
	gender public.gender,
	is_public boolean,
	location text,
	relationship text,
	role public.role,
	updated_at timestamptz,
	zodiac text
)
language sql
stable
security definer
set search_path = public
as $$
	select
		p.id,
		p.avatar_url,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.bio
			else null
		end as bio,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.birth_date
			else null
		end as birth_date,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.birth_visibility
			else null
		end as birth_visibility,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.created_at
			else null
		end as created_at,
		p.display_name,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.gender
			else null
		end as gender,
		p.is_public,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.location
			else null
		end as location,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.relationship
			else null
		end as relationship,
		p.role,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.updated_at
			else null
		end as updated_at,
		case
			when p.is_public = true or p.id = auth.uid() or public.is_admin_or_moder()
				then p.zodiac
			else null
		end as zodiac
	from public.profiles as p
	where p.id = target_profile_id;
$$;

revoke all on function public.get_profile_for_viewer(uuid) from public;
grant execute on function public.get_profile_for_viewer(uuid) to anon;
grant execute on function public.get_profile_for_viewer(uuid) to authenticated;
