import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildCourseRegistrationConfirmFlex, buildAdminNewRegistrationFlex } from '@/lib/line'
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
    .select('title, start_time, is_paid, price, capacity')
    .eq('id', eventId)
    .eq('status', 'published')
    .single()
  if (eventError || !event) {
    console.error('[liff/course-registration] event lookup failed:', eventError)
    return NextResponse.json({ ok: false, error: 'event_not_found' }, { status: 404 })
  }

  if (event.capacity !== null) {
    const { count, error: countError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['registered', 'payment_pending'])
    if (countError) console.error('[liff/course-registration] capacity count failed:', countError)
    if ((count ?? 0) >= event.capacity) {
      return NextResponse.json({ ok: false, error: 'event_full' }, { status: 409 })
    }
  }

  const status = event.is_paid ? 'payment_pending' : 'registered'
  const { data: registration, error } = await supabase.from('event_registrations').insert({
    event_id: eventId,
    line_user_id: lineUserId,
    name, phone, email,
    note: body.note?.trim() || null,
    status,
  }).select('id, check_in_token').single()

  if (error || !registration) {
    console.error('[liff/course-registration] insert failed:', error)
    return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 })
  }

  await linePushFlex(
    lineUserId, event.is_paid ? `${name}，報名已收到，請完成匯款` : `${name}，課程報名成功！`,
    buildCourseRegistrationConfirmFlex(name, event.title, event.start_time, event.is_paid, event.price),
  ).catch(() => {})

  const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
  if (adminId) {
    await linePushFlex(
      adminId, `🎓 新課程報名：${name}・${event.title}`,
      buildAdminNewRegistrationFlex(registration.id, name, phone, email, event.title, event.start_time, event.is_paid, event.price),
    ).catch(() => {})
  } else {
    console.error('[liff/course-registration] ADMIN_LINE_GROUP_ID / ADMIN_LINE_USER_ID not set, admin not notified')
  }

  return NextResponse.json({ ok: true, registrationId: registration.id, checkInToken: registration.check_in_token, isPaid: event.is_paid })
}
