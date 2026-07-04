-- 心宇宙商務中心 — Supabase Schema
-- 在 Supabase SQL Editor 中執行此檔案

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
  time_slot text,                     -- morning / afternoon / evening
  session_count int DEFAULT 1,        -- 幾個時段（連租）
  layout_config text,                 -- 座位配置：教室型/蜈蚣型/分組型/講座型/U型
  is_holiday boolean DEFAULT false,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  note text,
  status text DEFAULT 'pending',     -- pending / confirmed / payment_pending / completed / cancelled
  admin_note text,
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

-- 前台：公開讀取場地、定價、活動、加購、回顧照片
CREATE POLICY "public read venue_pricing" ON venue_pricing FOR SELECT USING (true);
CREATE POLICY "admin full access venue_pricing" ON venue_pricing FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "public read venues" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "public read venue_photos" ON venue_photos FOR SELECT USING (true);
CREATE POLICY "public read venue_addons" ON venue_addons FOR SELECT USING (is_available = true);
CREATE POLICY "public read published events" ON events FOR SELECT USING (status IN ('published', 'ended'));
CREATE POLICY "public read event_photos" ON event_photos FOR SELECT USING (true);

-- 前台：允許送出租借申請
CREATE POLICY "public insert rental_requests" ON rental_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert rental_addons" ON rental_addons FOR INSERT WITH CHECK (true);

-- 前台：允許報名與簽到
CREATE POLICY "public insert registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "public update checkin" ON event_registrations FOR UPDATE USING (true) WITH CHECK (true);

-- 後台：已登入的 Supabase Auth 用戶可以做所有操作
CREATE POLICY "admin full access venues" ON venues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access venue_photos" ON venue_photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access venue_addons" ON venue_addons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access rental_requests" ON rental_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access rental_addons" ON rental_addons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access event_registrations" ON event_registrations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin full access event_photos" ON event_photos FOR ALL USING (auth.role() = 'authenticated');

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
