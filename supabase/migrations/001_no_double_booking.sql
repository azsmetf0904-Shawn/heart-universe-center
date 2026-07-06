-- 防止同場地同日期同時段重複預約
-- 排除 cancelled 狀態（取消後可再被預約）
CREATE UNIQUE INDEX IF NOT EXISTS rental_no_double_booking
  ON rental_requests (venue_id, booking_date, time_slot)
  WHERE status NOT IN ('cancelled');
