import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const { ok } = rateLimit(ip, 30, 60_000)
  if (!ok) return NextResponse.json({ booked: [] }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const venue_id = searchParams.get('venue_id')
  const date     = searchParams.get('date')
  const year     = searchParams.get('year')
  const month    = searchParams.get('month') // 0-indexed from client

  const supabase = await createAdminClient()

  // ── 月曆模式：?year=2026&month=6&venue_id=xxx ──
  if (year && month !== null) {
    const m = parseInt(month) // 0-indexed
    const y = parseInt(year)
    if (isNaN(y) || isNaN(m)) return NextResponse.json({ map: {} })

    const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const lastDay   = new Date(y, m + 1, 0).getDate()
    const endDate   = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    let q = supabase
      .from('rental_requests')
      .select('booking_date, time_slot, status')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .not('status', 'eq', 'cancelled')

    if (venue_id) q = q.eq('venue_id', venue_id)

    const { data } = await q
    const map: Record<string, Record<string, string>> = {}
    ;(data ?? []).forEach((r: { booking_date: string | null; time_slot: string | null; status: string }) => {
      if (!r.booking_date || !r.time_slot) return
      if (!map[r.booking_date]) map[r.booking_date] = {}
      map[r.booking_date][r.time_slot] = r.status === 'pending' ? 'pending' : 'booked'
    })
    return NextResponse.json({ map })
  }

  // ── 單日模式（原有）：?date=2026-07-15&venue_id=xxx ──
  if (!date) return NextResponse.json({ booked: [] })

  let query = supabase
    .from('rental_requests')
    .select('time_slot')
    .eq('booking_date', date)
    .not('status', 'eq', 'cancelled')

  if (venue_id) query = query.eq('venue_id', venue_id)

  const { data } = await query
  const booked = (data ?? []).map((r: { time_slot: string | null }) => r.time_slot).filter(Boolean)
  return NextResponse.json({ booked })
}
