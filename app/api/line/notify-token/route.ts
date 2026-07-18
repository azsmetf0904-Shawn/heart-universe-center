import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/rate-limit'

function phoneVariants(input: string) {
  const digits = input.replace(/\D/g, '')
  const values = new Set([digits])
  if (digits.startsWith('886') && digits.length >= 11) values.add(`0${digits.slice(3)}`)
  if (digits.startsWith('09') && digits.length === 10) values.add(digits.slice(1))
  if (digits.startsWith('9') && digits.length === 9) values.add(`0${digits}`)
  return values
}

export async function POST(req: NextRequest) {
  const limiter = rateLimit(`notify-token:${requestIp(req)}`, 5, 60_000)
  if (!limiter.allowed) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const { bookingId, contact, type } = await req.json() as { bookingId?: unknown; contact?: unknown; type?: unknown }
  if (typeof bookingId !== 'string' || typeof contact !== 'string' || !['new_booking', 'booking_received'].includes(String(type))) {
    return NextResponse.json({ ok: false, error: 'invalid_params' }, { status: 400 })
  }
  const supabase = await createAdminClient()
  const { data: booking } = await supabase.from('rental_requests').select('id, phone, email').eq('id', bookingId).single()
  if (!booking) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  const value = contact.trim().toLowerCase()
  if ((!value.includes('@') && !phoneVariants(value).has(booking.phone?.replace(/\D/g, ''))) && value !== booking.email?.toLowerCase()) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
  const expires = Date.now() + 5 * 60_000
  const secret = process.env.LINE_NOTIFY_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 })
  const token = createHmac('sha256', secret).update(`${bookingId}:${type}:${expires}`).digest('hex')
  return NextResponse.json({ ok: true, token, expires })
}
