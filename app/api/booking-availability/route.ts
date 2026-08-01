import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/rate-limit'
import type { TimeSlot } from '@/lib/types'

type Payload = {
  venue_id?: string
  booking_date?: string
  time_slots?: string[]
}

// rental_requests 沒有公開 SELECT RLS 政策（客戶個資不該公開可讀），
// 所以這個衝突檢查一定要走 admin client 在伺服器端查，不能像早期版本
// 那樣直接用瀏覽器 anon client 查——anon 查詢會被 RLS 安靜地擋成 0 筆，
// 讓候補機制整個失效卻沒有任何錯誤訊號。只回傳布林值，不洩漏任何預約細節。
export async function POST(req: NextRequest) {
  const limiter = rateLimit(`booking-availability:${requestIp(req)}`, 20, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
  }

  const body = await req.json() as Payload
  const venueId = body.venue_id?.trim() ?? ''
  const bookingDate = body.booking_date?.trim() ?? ''
  const timeSlots = Array.isArray(body.time_slots) ? body.time_slots.filter(Boolean) as TimeSlot[] : []

  if (!venueId || !bookingDate || timeSlots.length === 0) {
    return NextResponse.json({ ok: true, hasConflict: false })
  }

  const supabase = await createAdminClient()
  const { data: conflicts, error } = await supabase
    .from('rental_requests')
    .select('id')
    .eq('venue_id', venueId)
    .eq('booking_date', bookingDate)
    .in('time_slot', timeSlots)
    .in('status', ['pending', 'confirmed', 'payment_pending', 'waitlist'])
    .limit(1)

  if (error) {
    console.error('[booking-availability] conflict check failed:', error)
    return NextResponse.json({ ok: false, error: 'lookup_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, hasConflict: Boolean(conflicts && conflicts.length > 0) })
}
