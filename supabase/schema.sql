-- 心宇宙商務中心 — Supabase Schema
-- 在 Supabase SQL Editor 中執行此檔案（全新專案時使用）
--
-- 這份檔案追蹤的是「從零重建應該長怎樣」，內容需與 supabase/migrations/*.sql
-- 套用後的正式環境保持一致。上一次同步：2026-07-19（含 001~008）。

-- 場地
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  capacity int,
  area_ping numeric,                  -- 坪數
  layout_capacities jsonb,            -- {"教室型":38,"蜈蚣型":35,"分組型":44,"講座型":60,"U型":35}
  equipment text[],
  cover_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 場地照片
CREATE TABLE IF NOT EXISTS venue_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 加購品項
CREATE TABLE IF NOT EXISTS venue_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,        -- equipment / setup / fb / staff / time
  description text,
  price numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'per_session',   -- per_session / per_hour / per_person / per_unit
  quantity int,         -- null = 不限量
  is_available boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 場地定價（每個時段 × 平日/假日）
CREATE TABLE IF NOT EXISTS venue_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  day_type text NOT NULL,             -- weekday / holiday
  time_slot text NOT NULL,            -- morning / afternoon / evening
  price numeric NOT NULL,
  overtime_per_30min numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(venue_id, day_type, time_slot)
);

-- 租借申請
CREATE TABLE IF NOT EXISTS rental_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  event_title text NOT NULL,
  event_type text,
  guest_count int,
  booking_date date,                  -- 租借日期
  time_slot text,                     -- morning / afternoon / evening（單一時段，舊資料相容用）
  time_slots text[],                  -- 多時段連租
  session_count int DEFAULT 1,        -- 幾個時段（連租）
  layout_config text,                 -- 座位配置：教室型/蜈蚣型/分組型/講座型/U型
  is_holiday boolean DEFAULT false,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  note text,
  status text DEFAULT 'pending',      -- pending / payment_pending / confirmed / waitlist / completed / cancelled
  admin_note text,
  line_user_id text,                  -- 綁定的 LINE userId（推播通知用）
  line_code text,                     -- 一次性驗證碼，客戶用來在 LINE OA 綁定此筆申請
  payment_last5 varchar,              -- 客戶回報的匯款帳號末五碼
  payment_date date,                  -- 客戶回報的匯款日期
  payment_amount int,                 -- 客戶回報的匯款金額
  payment_reported_at timestamptz,    -- 客戶回報匯款的時間
  payment_due_at timestamptz,         -- 核可後的付款期限，逾期由 cron 自動取消
  created_at timestamptz DEFAULT now()
);

-- 租借加購選擇
CREATE TABLE IF NOT EXISTS rental_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_request_id uuid REFERENCES rental_requests(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES venue_addons(id),
  quantity int DEFAULT 1,
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 活動課程
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  venue_id uuid REFERENCES venues(id),
  organizer_name text,
  cover_image_url text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  price numeric DEFAULT 0,
  is_paid boolean DEFAULT false,
  capacity int,
  status text DEFAULT 'draft',       -- draft / published / ended
  category text,
  external_url text,
  created_at timestamptz DEFAULT now()
);

-- 活動報名
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  note text,
  status text DEFAULT 'registered',  -- registered / cancelled
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  check_in_token uuid DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- 活動回顧照片
CREATE TABLE IF NOT EXISTS event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 活動回顧評論（結束後的活動才顯示）
CREATE TABLE IF NOT EXISTS event_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_reviews_event_id_idx ON event_reviews (event_id);
CREATE INDEX IF NOT EXISTS event_reviews_created_at_idx ON event_reviews (created_at DESC);

-- 管理員操作日誌（RentalRequestsClient 核可/候補/取消時寫入）
CREATE TABLE IF NOT EXISTS admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  old_value text,
  new_value text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 管理員身分白名單。取代舊版「任何 Supabase Auth 帳號 = 管理員」的作法
-- （auth.role() = 'authenticated' 對所有 authenticated session 一視同仁，
-- 任何未來新增的非管理員帳號都會意外拿到全站權限）。
-- RLS 全部關閉、不開任何 policy，只能透過下面的 is_admin() 讀取。
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 活動簽到：只能透過這支 RPC 更新 checked_in / checked_in_at，
-- 不開放前端直接 UPDATE event_registrations（見下方 RLS）。
CREATE OR REPLACE FUNCTION public.check_in_registration(p_registration_id uuid, p_checked_in boolean DEFAULT true)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'not_authorized' USING errcode = '42501';
  END IF;

  UPDATE event_registrations
  SET checked_in = p_checked_in,
      checked_in_at = CASE WHEN p_checked_in THEN COALESCE(checked_in_at, now()) ELSE NULL END
  WHERE id = p_registration_id
    AND status = 'registered';

  RETURN FOUND;
END;
$$;

-- 索引：my-booking（phone/email）、admin-calendar（booking_date 區間）、
-- LIFF 付款查詢（line_user_id）、cron 提醒與逾期取消（status + booking_date /
-- payment_due_at）、LINE OA 綁定驗證碼（line_code）。
CREATE UNIQUE INDEX IF NOT EXISTS rental_no_double_booking
  ON rental_requests (venue_id, booking_date, time_slot)
  WHERE status NOT IN ('cancelled');
CREATE INDEX IF NOT EXISTS rental_requests_phone_idx ON rental_requests (phone);
CREATE INDEX IF NOT EXISTS rental_requests_email_idx ON rental_requests (lower(email));
CREATE INDEX IF NOT EXISTS rental_requests_line_user_id_idx ON rental_requests (line_user_id) WHERE line_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS rental_requests_booking_date_idx ON rental_requests (booking_date);
CREATE INDEX IF NOT EXISTS rental_requests_status_idx ON rental_requests (status);
CREATE INDEX IF NOT EXISTS idx_rental_requests_line_code ON rental_requests (line_code);
CREATE INDEX IF NOT EXISTS rental_requests_payment_due_idx
  ON rental_requests (status, payment_due_at)
  WHERE status = 'pending' AND payment_due_at IS NOT NULL;

-- RLS (Row Level Security)
ALTER TABLE venue_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- 前台：公開讀取場地、定價、活動、加購、回顧照片、回顧評論
CREATE POLICY "public read venue_pricing" ON venue_pricing FOR SELECT USING (true);
CREATE POLICY "public read venues" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "public read venue_photos" ON venue_photos FOR SELECT USING (true);
CREATE POLICY "public read venue_addons" ON venue_addons FOR SELECT USING (is_available = true);
CREATE POLICY "public read published events" ON events FOR SELECT USING (status IN ('published', 'ended'));
CREATE POLICY "public read event_photos" ON event_photos FOR SELECT USING (true);
CREATE POLICY "anyone can read" ON event_reviews FOR SELECT USING (true);
CREATE POLICY "anyone can insert" ON event_reviews FOR INSERT WITH CHECK (true);

-- 前台：允許送出租借申請、活動報名（僅 INSERT，不可直接 UPDATE/DELETE）
CREATE POLICY "public insert rental_requests" ON rental_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert rental_addons" ON rental_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert registrations" ON event_registrations FOR INSERT WITH CHECK (true);
-- 簽到只能透過 check_in_registration() 這支 SECURITY DEFINER RPC，
-- 刻意不開放任何 public UPDATE policy（避免任意改寫報名資料）。

-- 後台：僅 admin_users 白名單內的帳號可以做所有操作
CREATE POLICY "admin full access venues" ON venues FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access venue_photos" ON venue_photos FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access venue_addons" ON venue_addons FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access venue_pricing" ON venue_pricing FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access rental_requests" ON rental_requests FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access rental_addons" ON rental_addons FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access events" ON events FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access event_registrations" ON event_registrations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin full access event_photos" ON event_photos FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_select_logs" ON admin_action_logs FOR SELECT USING (is_admin());
CREATE POLICY "admin_insert_logs" ON admin_action_logs FOR INSERT WITH CHECK (is_admin());

-- Storage Buckets（在 Supabase Storage 手動建立或執行以下）
-- INSERT INTO storage.buckets (id, name, public) VALUES ('venues-photos', 'venues-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-gallery', 'event-gallery', true);

-- 加購種子資料
INSERT INTO venue_addons (name, category, description, price, unit, quantity, is_available, sort_order) VALUES
('投影機',            'equipment', '含遙控器與 HDMI 線',                    500,  'per_session', null, true,  1),
('麥克風（手持）',    'equipment', '無線手持麥克風',                         200,  'per_unit',    null, true,  2),
('麥克風（領夾）',    'equipment', '無線領夾麥克風，適合演講/課程',          200,  'per_unit',    null, true,  3),
('音響系統',          'equipment', '喇叭 + 擴大機，支援藍牙/AUX',           800,  'per_session', null, true,  4),
('移動白板',          'equipment', '雙面磁性白板，附白板筆與板擦',           150,  'per_session', null, true,  5),
('視訊會議設備',      'equipment', '大型螢幕 + 鏡頭 + 麥克風陣列',          600,  'per_session', null, true,  6),
('延長線組',          'equipment', '6孔延長線，適合多人用電',                 80,  'per_unit',    null, true,  7),
('筆電轉接器',        'equipment', 'HDMI/USB-C/VGA 多合一轉接器',             50,  'per_unit',    null, true,  8),
('桌椅配置調整',      'setup',     'U型/課桌/劇場/圓桌任選，提前30分鐘完成', 300, 'per_session', null, true, 10),
('氛圍燈光',          'setup',     '暖色氛圍燈條，適合小型聚會或課程',        400, 'per_session', null, true, 11),
('背板（空白布幕）',  'setup',     '白色布幕背板，可自貼素材',                500, 'per_session', null, true, 12),
('指示立牌',          'setup',     '壓克力立牌座 + 空白卡紙 ×5',             100, 'per_session', null, true, 13),
('名牌座（桌牌）',    'setup',     '壓克力桌上型名牌座，每10個一組',          150, 'per_unit',    null, true, 14),
('茶水服務（冷）',    'fb',        '冷飲壺 2 公升，含杯子',                  200,  'per_session', null, true, 20),
('茶水服務（熱）',    'fb',        '熱水瓶 + 茶包組',                        200,  'per_session', null, true, 21),
('咖啡輕食',          'fb',        '美式咖啡 + 點心盤，每人計費',            150,  'per_person',  null, true, 22),
('場務人員',          'staff',     '全程協助活動進行、收場',                  500,  'per_hour',    null, true, 30),
('現場攝影',          'staff',     '含現場拍攝 + 20張精修，2小時內',         3000, 'per_session', null, true, 31),
('攝影（含剪輯）',    'staff',     '現場拍攝 + 3分鐘剪輯影片',               6000, 'per_session', null, true, 32),
('直播技術人員',      'staff',     '直播設備架設 + 全程監控',                 2000, 'per_session', null, true, 33),
('提前30分鐘場佈',   'time',      '租借開始前30分鐘進場布置',               300,  'per_session', null, true, 40),
('延長使用（1小時）', 'time',      '租借時段結束後延長，費用依當日時租計算',  0,    'per_hour',    null, true, 41);
