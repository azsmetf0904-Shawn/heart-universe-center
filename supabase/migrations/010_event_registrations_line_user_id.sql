-- LINE OA 課程報名（LIFF）需要能推播確認訊息給報名者，
-- event_registrations 目前沒有 line_user_id，比照 rental_requests 補上。
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS line_user_id text;
CREATE INDEX IF NOT EXISTS event_registrations_line_user_id_idx
  ON event_registrations (line_user_id) WHERE line_user_id IS NOT NULL;
