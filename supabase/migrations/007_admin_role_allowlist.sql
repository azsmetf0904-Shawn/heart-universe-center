-- Replace the blanket "any authenticated Supabase user = admin" policies with
-- an explicit allowlist. Today every Supabase Auth account in this project is
-- an admin, so this migration grandfathers all existing auth.users in — it
-- changes nothing about who currently has access, only makes "who is an
-- admin" an explicit, queryable fact instead of "has a session at all".
create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

insert into admin_users (user_id)
select id from auth.users
on conflict (user_id) do nothing;

alter table admin_users enable row level security;
-- Deny all direct client access (anon and authenticated). The only way to
-- read/write this table is via the SQL editor / service role, or through
-- is_admin() below, which runs as the function owner and bypasses RLS.
-- No policies are created on purpose: RLS enabled + zero policies = deny all.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Swap every "admin full access" policy from auth.role() = 'authenticated'
-- to the allowlist check.
drop policy if exists "admin full access venue_pricing" on venue_pricing;
create policy "admin full access venue_pricing" on venue_pricing for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access venues" on venues;
create policy "admin full access venues" on venues for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access venue_photos" on venue_photos;
create policy "admin full access venue_photos" on venue_photos for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access venue_addons" on venue_addons;
create policy "admin full access venue_addons" on venue_addons for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access rental_requests" on rental_requests;
create policy "admin full access rental_requests" on rental_requests for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access rental_addons" on rental_addons;
create policy "admin full access rental_addons" on rental_addons for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access events" on events;
create policy "admin full access events" on events for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access event_registrations" on event_registrations;
create policy "admin full access event_registrations" on event_registrations for all using (is_admin()) with check (is_admin());

drop policy if exists "admin full access event_photos" on event_photos;
create policy "admin full access event_photos" on event_photos for all using (is_admin()) with check (is_admin());

-- check_in_registration (005) also gated on auth.role() = 'authenticated';
-- tighten it to the same allowlist.
create or replace function public.check_in_registration(p_registration_id uuid, p_checked_in boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  update event_registrations
  set checked_in = p_checked_in,
      checked_in_at = case when p_checked_in then coalesce(checked_in_at, now()) else null end
  where id = p_registration_id
    and status = 'registered';

  return found;
end;
$$;
