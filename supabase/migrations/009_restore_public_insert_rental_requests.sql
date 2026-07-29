-- Live DB was missing (or lost) the public INSERT policy on
-- rental_requests documented in schema.sql -- confirmed by a live
-- test submission on production returning:
--   42501 "new row violates row-level security policy for table rental_requests"
-- Same failure mode 008's own comment already documented for
-- payment_due_at (repo migration never actually applied to prod).
-- This made the /rent booking form 100% unable to insert, for anyone,
-- regardless of LINE login status.
DROP POLICY IF EXISTS "public insert rental_requests" ON rental_requests;
CREATE POLICY "public insert rental_requests" ON rental_requests
  FOR INSERT WITH CHECK (true);
