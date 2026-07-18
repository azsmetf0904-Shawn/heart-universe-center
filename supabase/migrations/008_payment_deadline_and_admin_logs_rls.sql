-- 004_payment_deadline.sql was written into the repo but never actually
-- applied to the live project — payment_due_at doesn't exist yet, so the
-- cron auto-cancel-overdue-bookings feature has been silently doing nothing.
ALTER TABLE rental_requests
  ADD COLUMN IF NOT EXISTS payment_due_at timestamptz;

CREATE INDEX IF NOT EXISTS rental_requests_payment_due_idx
  ON rental_requests (status, payment_due_at)
  WHERE status = 'pending' AND payment_due_at IS NOT NULL;

-- admin_action_logs predates the 007 admin_users allowlist migration and
-- was missed — it was still gated on auth.role() = 'authenticated', the
-- same blanket-access pattern 007 replaced everywhere else.
drop policy if exists "admin_insert_logs" on admin_action_logs;
drop policy if exists "admin_select_logs" on admin_action_logs;
create policy "admin_insert_logs" on admin_action_logs for insert with check (is_admin());
create policy "admin_select_logs" on admin_action_logs for select using (is_admin());
