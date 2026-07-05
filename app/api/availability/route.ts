import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const { ok } = rateLimit(ip, 30, 60_000)
  if (!ok) return NextResponse.json({ booked: [] }, { status: 429 })
  const { searchParams } = new URL(req.url)
  const venue_id = searchParams.get('venue_id')
  const date = searchParams.get('date')

  if (!date) return NextResponse.json({ booked: [] })

  const supabase = await createAdminClient()
  let query = supabase
    .from('rental_requests')
    .select('time_slot, session_count')
    .eq('booking_date', date)
    .not('status', 'eq', 'cancelled')

  if (venue_id) query = query.eq('venue_id', venue_id)

  const { data } = await query
  const booked = (data ?? []).map((r: { time_slot: string | null }) => r.time_slot).filter(Boolean)
  return NextResponse.json({ booked })
}
