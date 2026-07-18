import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildAdminPaymentFlex } from '@/lib/line'
import { rateLimit, requestIp } from '@/lib/rate-limit'

function phoneVariants(input: string): string[] {
  const digits = input.replace(/\D/g, '')
  const values = new Set<string>([digits])
  if (digits.startsWith('886') && digits.length >= 11) values.add(`0${digits.slice(3)}`)
  if (digits.startsWith('09') && digits.length === 10) values.add(digits.slice(1))
  if (digits.startsWith('9') && digits.length === 9) values.add(`0${digits}`)
  return [...values].filter(Boolean)
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

export async function POST(req: NextRequest) {
  const limiter = rateLimit(`payment-report:${requestIp(req)}`, 8, 60_000)
  if (!limiter.allowed) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
  const { bookingId, contact, phone, last5, date, amount } = await req.json() as {
    bookingId?: unknown; contact?: unknown; phone?: unknown; last5?: unknown; date?: unknown; amount?: unknown
  }
  const verification = String(contact ?? phone ?? '').trim()
  const cleanLast5 = String(last5 ?? '').replace(/\D/g, '')
  const cleanDate = String(date ?? '').trim()
  const numericAmount = Number(amount)

  if (!bookingId || !verification || !/^\d{5}$/.test(cleanLast5) || !isValidDate(cleanDate) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return NextResponse.json({ ok: false, error: 'missing_params' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Validate the booking exists and is in pending state
  const { data: booking } = await supabase
    .from('rental_requests')
    .select('id, status, name, event_title, booking_date, time_slot, phone, email')
    .eq('id', bookingId)
    .single()

  if (!booking) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
  const normalizedContact = verification.toLowerCase()
  const matchesContact = verification.includes('@')
    ? booking.email?.toLowerCase() === normalizedContact
    : phoneVariants(verification).includes(booking.phone?.replace(/\D/g, ''))
  if (!matchesContact) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  if (booking.status !== 'pending') {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 409 })
  }

  const { error } = await supabase.from('rental_requests').update({
    payment_last5: cleanLast5,
    payment_date: cleanDate,
    payment_amount: Math.round(numericAmount),
    payment_reported_at: new Date().toISOString(),
    status: 'payment_pending',
  }).eq('id', bookingId).eq('status', 'pending')

  if (error) return NextResponse.json({ ok: false }, { status: 500 })

  const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
  if (adminId) {
    await linePushFlex(
      adminId,
      `💰 ${booking.name} 已回報匯款`,
      buildAdminPaymentFlex(booking.id, booking.name, booking.event_title, booking.booking_date ?? '', booking.time_slot ?? '', cleanLast5, cleanDate, Math.round(numericAmount)),
    ).catch(() => {})
  }
  return NextResponse.json({ ok: true })
}
