import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildAdminPaymentFlex } from '@/lib/line'

type PaymentPayload = {
  lineUserId?: string
  bookingId?: string
  last5?: string
  date?: string
  amount?: string | number
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

export async function GET(req: NextRequest) {
  const lineUserId = req.nextUrl.searchParams.get('lineUserId')?.trim()
  if (!lineUserId) return NextResponse.json({ ok: false, error: 'line_user_required' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('rental_requests')
    .select('id, name, event_title, booking_date, time_slot, status, payment_last5, payment_date, payment_amount, payment_reported_at, phone')
    .eq('line_user_id', lineUserId)
    .in('status', ['pending', 'payment_pending'])
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ ok: false, error: 'lookup_failed' }, { status: 500 })
  return NextResponse.json({ ok: true, bookings: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as PaymentPayload
  const lineUserId = body.lineUserId?.trim()
  const bookingId = body.bookingId?.trim()
  const last5 = body.last5?.replace(/\D/g, '').slice(0, 5) ?? ''
  const date = body.date?.trim() ?? ''
  const amount = Number(body.amount)

  if (!lineUserId || !bookingId || !/^\d{5}$/.test(last5) || !isValidDate(date) || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'invalid_params' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data: booking } = await supabase
    .from('rental_requests')
    .select('id, name, event_title, booking_date, time_slot, status, line_user_id, phone')
    .eq('id', bookingId)
    .eq('line_user_id', lineUserId)
    .single()

  if (!booking) return NextResponse.json({ ok: false, error: 'booking_not_found' }, { status: 404 })
  if (booking.status !== 'pending') return NextResponse.json({ ok: false, error: 'already_reported' }, { status: 409 })

  const { error } = await supabase.from('rental_requests').update({
    payment_last5: last5,
    payment_date: date,
    payment_amount: Math.round(amount),
    payment_reported_at: new Date().toISOString(),
    status: 'payment_pending',
  }).eq('id', bookingId).eq('status', 'pending')

  if (error) return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 })

  const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
  if (adminId) {
    const slot = booking.time_slot ?? ''
    await linePushFlex(
      adminId,
      `💰 ${booking.name} 已回報匯款`,
      buildAdminPaymentFlex(booking.id, booking.name, booking.event_title, booking.booking_date ?? '', slot, last5, date, Math.round(amount)),
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true, bookingId, status: 'payment_pending' })
}
