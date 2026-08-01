-- 付費課程比照 rental_requests 走匯款回報流程：
-- registered（免費或已確認付款）/ payment_pending（付費課程待回報或待審核）/ cancelled。
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_last5 varchar;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_date date;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_amount int;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_reported_at timestamptz;
CREATE INDEX IF NOT EXISTS event_registrations_status_idx ON event_registrations (status);
