import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { bookingId, last5, date, amount } = await req.json()

  if (!bookingId || !last5 || !date || !amount) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Validate the booking exists and is in pending state
  const { data: booking } = await supabase
    .from('rental_requests')
    .select('id, status')
    .eq('id', bookingId)
    .single()

  if (!booking) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
  if (booking.status !== 'pending') {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 409 })
  }

  const { error } = await supabase.from('rental_requests').update({
    payment_last5: String(last5).slice(0, 5),
    payment_date: date,
    payment_amount: parseInt(String(amount)) || null,
    payment_reported_at: new Date().toISOString(),
    status: 'payment_pending',
  }).eq('id', bookingId)

  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true })
}
