-- 付款流程：核可後建立付款期限，供 LINE 與管理後台顯示。
ALTER TABLE rental_requests
  ADD COLUMN IF NOT EXISTS payment_due_at timestamptz;

CREATE INDEX IF NOT EXISTS rental_requests_payment_due_idx
  ON rental_requests (status, payment_due_at)
  WHERE status = 'pending' AND payment_due_at IS NOT NULL;
