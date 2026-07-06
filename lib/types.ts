export type AddonCategory = 'equipment' | 'setup' | 'fb' | 'staff' | 'time'
export type AddonUnit = 'per_session' | 'per_hour' | 'per_person' | 'per_unit'
export type RentalStatus = 'pending' | 'confirmed' | 'payment_pending' | 'completed' | 'cancelled'
export type EventStatus = 'draft' | 'published' | 'ended'
export type RegistrationStatus = 'registered' | 'cancelled'
export type DayType = 'weekday' | 'holiday'
export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export const TIME_SLOT_LABEL: Record<TimeSlot, string> = {
  morning:   '早上 09:00–12:00',
  afternoon: '下午 14:00–17:00',
  evening:   '晚上 18:30–21:30',
}

export const LAYOUT_TYPES = ['教室型', '蜈蚣型', '分組型', '講座型', 'U型'] as const
export type LayoutType = typeof LAYOUT_TYPES[number]

export interface VenuePricing {
  id: string
  venue_id: string
  day_type: DayType
  time_slot: TimeSlot
  price: number
  overtime_per_30min: number
  created_at: string
}

export interface Venue {
  id: string
  name: string
  slug: string
  description: string | null
  capacity: number | null
  area_ping: number | null
  layout_capacities: Partial<Record<LayoutType, number>> | null
  equipment: string[] | null
  cover_image_url: string | null
  is_active: boolean
  created_at: string
  venue_photos?: VenuePhoto[]
  venue_pricing?: VenuePricing[]
}

export interface VenuePhoto {
  id: string
  venue_id: string
  image_url: string
  sort_order: number
  created_at: string
}

export interface VenueAddon {
  id: string
  name: string
  category: AddonCategory | null
  description: string | null
  price: number
  unit: AddonUnit
  quantity: number | null
  is_available: boolean
  sort_order: number
  created_at: string
}

export interface RentalRequest {
  id: string
  venue_id: string | null
  name: string
  phone: string
  email: string
  event_title: string
  event_type: string | null
  guest_count: number | null
  booking_date: string | null
  time_slot: TimeSlot | null
  time_slots: TimeSlot[] | null
  layout_config: LayoutType | null
  is_holiday: boolean
  session_count: number
  start_time: string
  end_time: string
  note: string | null
  status: RentalStatus
  admin_note: string | null
  created_at: string
  venue?: Venue
  rental_addons?: RentalAddon[]
}

export interface RentalAddon {
  id: string
  rental_request_id: string
  addon_id: string
  quantity: number
  unit_price: number
  subtotal: number
  note: string | null
  created_at: string
  venue_addons?: VenueAddon
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  venue_id: string | null
  organizer_name: string | null
  cover_image_url: string | null
  start_time: string
  end_time: string
  price: number
  is_paid: boolean
  capacity: number | null
  status: EventStatus
  category: string | null
  created_at: string
  venue?: Venue
  event_photos?: EventPhoto[]
  event_registrations?: EventRegistration[]
}

export interface EventRegistration {
  id: string
  event_id: string
  name: string
  phone: string
  email: string
  note: string | null
  status: RegistrationStatus
  checked_in: boolean
  checked_in_at: string | null
  check_in_token: string
  created_at: string
}

export interface EventPhoto {
  id: string
  event_id: string
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export const ADDON_CATEGORY_LABEL: Record<AddonCategory, string> = {
  equipment: '設備',
  setup: '場佈',
  fb: '餐飲',
  staff: '人力',
  time: '時間',
}

export const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  pending: '待確認',
  confirmed: '已確認',
  payment_pending: '待付款',
  completed: '已完成',
  cancelled: '已取消',
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  draft: '草稿',
  published: '已發布',
  ended: '已結束',
}

export function isHoliday(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function getPriceForSlot(
  pricing: VenuePricing[],
  date: Date,
  slot: TimeSlot
): VenuePricing | null {
  const dayType: DayType = isHoliday(date) ? 'holiday' : 'weekday'
  return pricing.find(p => p.day_type === dayType && p.time_slot === slot) ?? null
}
