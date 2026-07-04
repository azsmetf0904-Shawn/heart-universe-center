import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
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
