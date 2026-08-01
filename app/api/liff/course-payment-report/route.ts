import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildAdminEventPaymentFlex } from '@/lib/line'
import { verifyLineAccessToken } from '@/lib/line-auth'

type PaymentPayload = {
  registrationId?: string
  last5?: string
  date?: string
  amount?: string | number
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
  const identity = await verifyLineAccessToken(accessToken)
  const lineUserId = identity?.userId
  if (!lineUserId) return NextResponse.json({ ok: false, error: 'line_auth_required' }, { status: 401 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .select('id, name, status, payment_last5, payment_date, payment_amount, payment_reported_at, events(title, start_time, price)')
    .eq('line_user_id', lineUserId)
    .eq('status', 'payment_pending')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[liff/course-payment-report] lookup failed:', error)
    return NextResponse.json({ ok: false, error: 'lookup_failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, registrations: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as PaymentPayload
  const accessToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
  const identity = await verifyLineAccessToken(accessToken)
  const lineUserId = identity?.userId
  const registrationId = body.registrationId?.trim()
  const last5 = body.last5?.replace(/\D/g, '').slice(0, 5) ?? ''
  const date = body.date?.trim() ?? ''
  const amount = Number(body.amount)

  if (!lineUserId || !registrationId || !/^\d{5}$/.test(last5) || !isValidDate(date) || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'invalid_params' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data: registration, error: lookupError } = await supabase
    .from('event_registrations')
    .select('id, name, status, line_user_id, events(title)')
    .eq('id', registrationId)
    .eq('line_user_id', lineUserId)
    .single()
  if (lookupError) console.error('[liff/course-payment-report] registration lookup failed:', lookupError)
  if (!registration) return NextResponse.json({ ok: false, error: 'registration_not_found' }, { status: 404 })
  if (registration.status !== 'payment_pending') return NextResponse.json({ ok: false, error: 'not_reportable' }, { status: 409 })

  const { error } = await supabase.from('event_registrations').update({
    payment_last5: last5,
    payment_date: date,
    payment_amount: Math.round(amount),
    payment_reported_at: new Date().toISOString(),
  }).eq('id', registrationId).eq('status', 'payment_pending')

  if (error) {
    console.error('[liff/course-payment-report] update failed:', error)
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 })
  }

  const eventTitle = (registration.events as unknown as { title?: string } | null)?.title ?? ''
  const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
  if (adminId) {
    await linePushFlex(
      adminId, `💰 ${registration.name} 課程報名已回報匯款`,
      buildAdminEventPaymentFlex(registration.id, registration.name, eventTitle, last5, date, Math.round(amount)),
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true, registrationId })
}
