import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildCustomerBookingConfirmFlex } from '@/lib/line'
import { verifyLineAccessToken } from '@/lib/line-auth'
import { TIME_SLOT_LABEL } from '@/lib/types'
import type { TimeSlot } from '@/lib/types'

type BookingPayload = {
  venue_id?: string
  name?: string
  phone?: string
  email?: string
  event_title?: string
  booking_date?: string
  time_slot?: string
  note?: string
}

export async function POST(req: NextRequest) {
  const body = await req.json() as BookingPayload
  const accessToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
  const identity = await verifyLineAccessToken(accessToken)
  const lineUserId = identity?.userId
  if (!lineUserId) return NextResponse.json({ ok: false, error: 'line_auth_required' }, { status: 401 })

  const name = body.name?.trim() ?? ''
  const phone = body.phone?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const eventTitle = body.event_title?.trim() ?? ''
  const bookingDate = body.booking_date?.trim() ?? ''
  const timeSlot = (body.time_slot?.trim() ?? '') as TimeSlot | ''
  if (!name || !phone || !email || !eventTitle || !bookingDate || !timeSlot) {
    return NextResponse.json({ ok: false, error: 'invalid_params' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const { data: conflicts } = await supabase
    .from('rental_requests')
    .select('id')
    .eq('booking_date', bookingDate)
    .eq('time_slot', timeSlot)
    .in('status', ['pending', 'confirmed', 'payment_pending', 'waitlist'])
    .limit(1)
  const isWaitlist = Boolean(conflicts && conflicts.length > 0)

  const generatedCode = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  const { data: booking, error } = await supabase.from('rental_requests').insert({
    line_user_id: lineUserId,
    venue_id: body.venue_id || null,
    name, phone, email,
    event_title: eventTitle,
    booking_date: bookingDate,
    time_slot: timeSlot,
    start_time: `${bookingDate}T09:00:00`,
    end_time: `${bookingDate}T21:30:00`,
    note: body.note?.trim() || null,
    status: isWaitlist ? 'waitlist' : 'pending',
    line_code: generatedCode,
  }).select('id, venues(name)').single()

  if (error || !booking) return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 })

  const venueName = (booking.venues as unknown as { name?: string } | null)?.name ?? ''
  const slotLabel = TIME_SLOT_LABEL[timeSlot as TimeSlot] ?? timeSlot
  await linePushFlex(
    lineUserId, `${name}，申請已收到！`,
    buildCustomerBookingConfirmFlex(name, eventTitle, bookingDate, slotLabel, venueName, null, phone, isWaitlist, false, null),
  ).catch(() => {})

  return NextResponse.json({ ok: true, bookingId: booking.id, isWaitlist })
}
