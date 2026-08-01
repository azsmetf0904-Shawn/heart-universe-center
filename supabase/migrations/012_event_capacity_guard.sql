-- 名額判斷跟網站前台對齊：registered + payment_pending 都算佔用名額
-- （付費課程回報匯款中不該被當作空位讓別人搶走）
-- 原本只有 LIFF 課程報名 API 有伺服器端檢查，網站 /events/[slug]/register
-- 是前端直接 insert，沒有任何伺服器端名額檢查，靠 trigger 統一堵住兩邊。
CREATE OR REPLACE FUNCTION enforce_event_capacity() RETURNS trigger AS $$
DECLARE
  event_capacity int;
  current_count int;
  was_occupied boolean;
BEGIN
  was_occupied := (TG_OP = 'UPDATE' AND OLD.status IN ('registered', 'payment_pending'));
  IF NEW.status NOT IN ('registered', 'payment_pending') OR was_occupied THEN
    RETURN NEW;
  END IF;

  SELECT capacity INTO event_capacity FROM events WHERE id = NEW.event_id FOR UPDATE;
  IF event_capacity IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO current_count
  FROM event_registrations
  WHERE event_id = NEW.event_id
    AND status IN ('registered', 'payment_pending')
    AND id IS DISTINCT FROM NEW.id;

  IF current_count >= event_capacity THEN
    RAISE EXCEPTION 'event_full';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_registrations_capacity_guard ON event_registrations;
CREATE TRIGGER event_registrations_capacity_guard
  BEFORE INSERT OR UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION enforce_event_capacity();
