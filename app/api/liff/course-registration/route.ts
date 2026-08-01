import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildCourseRegistrationConfirmFlex } from '@/lib/line'
import { verifyLineAccessToken } from '@/lib/line-auth'

type RegistrationPayload = {
  event_id?: string
  name?: string
  phone?: string
  email?: string
  note?: string
}

export async function GET(req: NextRequest) {
  const accessToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
  const identity = await verifyLineAccessToken(accessToken)
  if (!identity?.userId) return NextResponse.json({ ok: false, error: 'line_auth_required' }, { status: 401 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .select('id, title, slug, start_time, is_paid, price')
    .eq('status', 'published')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
  if (error) {
    console.error('[liff/course-registration] events lookup failed:', error)
    return NextResponse.json({ ok: false, error: 'lookup_failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, events: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as RegistrationPayload
  const accessToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
  const identity = await verifyLineAccessToken(accessToken)
  const lineUserId = identity?.userId
  if (!lineUserId) return NextResponse.json({ ok: false, error: 'line_auth_required' }, { status: 401 })

  const eventId = body.event_id?.trim() ?? ''
  const name = body.name?.trim() ?? ''
  const phone = body.phone?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  if (!eventId || !name || !phone || !email) {
    return NextResponse.json({ ok: false, error: 'invalid_params' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('title, start_time, is_paid, price')
    .eq('id', eventId)
    .eq('status', 'published')
    .single()
  if (eventError || !event) {
    console.error('[liff/course-registration] event lookup failed:', eventError)
    return NextResponse.json({ ok: false, error: 'event_not_found' }, { status: 404 })
  }

  const { data: registration, error } = await supabase.from('event_registrations').insert({
    event_id: eventId,
    line_user_id: lineUserId,
    name, phone, email,
    note: body.note?.trim() || null,
  }).select('id, check_in_token').single()

  if (error || !registration) {
    console.error('[liff/course-registration] insert failed:', error)
    return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 })
  }

  await linePushFlex(
    lineUserId, `${name}，課程報名成功！`,
    buildCourseRegistrationConfirmFlex(name, event.title, event.start_time, event.is_paid, event.price),
  ).catch(() => {})

  return NextResponse.json({ ok: true, registrationId: registration.id, checkInToken: registration.check_in_token })
}
