-- Prevent anonymous clients from rewriting arbitrary registration fields.
drop policy if exists "public update checkin" on event_registrations;

create or replace function public.check_in_registration(p_registration_id uuid, p_checked_in boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'authenticated' then
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

revoke all on function public.check_in_registration(uuid, boolean) from public;
grant execute on function public.check_in_registration(uuid, boolean) to authenticated;
