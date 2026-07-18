import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { rateLimit, requestIp } from '@/lib/rate-limit'
import { linePushFlex, buildConfirmedFlex, buildCancelledFlex, buildWaitlistFlex, buildAdminPaymentFlex, buildAdminNewBookingFlex, buildCustomerBookingConfirmFlex } from '@/lib/line'

type PublicBooking = {
  id: string; name: string; phone: string; email: string; event_title: string;
  booking_date: string | null; time_slot: string | null; guest_count: number | null;
  note: string | null; line_user_id: string | null; status: string;
  venue?: { name?: string } | { name?: string }[] | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, lineUserId, name, eventTitle, bookingDate, timeSlot } = body

    if (!type || typeof type !== 'string') return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 400 })
    const publicTypes = new Set(['new_booking', 'booking_received'])
    const secret = process.env.LINE_NOTIFY_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    let publicBooking: PublicBooking | null = null

    if (publicTypes.has(type)) {
      const bookingId = typeof body.bookingId === 'string' ? body.bookingId : ''
      const expires = Number(req.headers.get('x-notify-expires') ?? 0)
      const supplied = req.headers.get('x-notify-token') ?? ''
      if (!secret || !bookingId || !supplied || !Number.isFinite(expires) || expires < Date.now()) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
      }
      const expected = createHmac('sha256', secret).update(`${bookingId}:${type}:${expires}`).digest('hex')
      if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
        return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
      }
      publicBooking = await (async () => {
        const sb = await createAdminClient()
        const { data } = await sb.from('rental_requests')
          .select('id, name, phone, email, event_title, booking_date, time_slot, guest_count, note, line_user_id, status, venue:venues(name)')
          .eq('id', bookingId).single()
        return data as PublicBooking | null
      })()
      if (!publicBooking) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    } else {
      const limiter = rateLimit(`line-notify:${requestIp(req)}`, 20, 60_000)
      if (!limiter.allowed) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
      const supabase = await createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
      const { data: isAdmin } = await supabase.rpc('is_admin')
      if (!isAdmin) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    // 管理員通知：新預約申請（Flex Message + 核可/候補/取消按鈕）
    if (type === 'new_booking') {
      const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
      if (!adminId) return NextResponse.json({ ok: false, error: 'ADMIN_LINE_GROUP_ID not set' })
      const bookingId = publicBooking?.id ?? body.bookingId
      const phone = publicBooking?.phone ?? body.phone
      const email = publicBooking?.email ?? body.email
      const venueName = Array.isArray(publicBooking?.venue) ? publicBooking?.venue[0]?.name : publicBooking?.venue?.name
      const guestCount = publicBooking?.guest_count ?? body.guestCount
      const note = publicBooking?.note ?? body.note
      const isWaitlist = publicBooking?.status === 'waitlist'
      const flex = buildAdminNewBookingFlex(
        bookingId, publicBooking?.name ?? name, phone, email ?? '', publicBooking?.event_title ?? eventTitle, publicBooking?.booking_date ?? bookingDate, publicBooking?.time_slot ?? timeSlot,
        venueName ?? '', guestCount ?? null, note ?? null, !!isWaitlist,
      )
      const altText = `${isWaitlist ? '🔔 候補' : '📋 新預約'}：${publicBooking?.name ?? name}・${publicBooking?.event_title ?? eventTitle}`
      await linePushFlex(adminId, altText, flex)
      return NextResponse.json({ ok: true })
    }

    // 管理員通知：客戶匯款回報（Flex Message + 審核按鈕）
    if (type === 'payment_reported') {
      const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
      if (!adminId) return NextResponse.json({ ok: false, error: 'ADMIN_LINE_GROUP_ID / ADMIN_LINE_USER_ID not set' })
      const { bookingId, last5, paymentDate, amount } = body
      const flex = buildAdminPaymentFlex(bookingId, name, eventTitle, bookingDate, timeSlot, last5, paymentDate, amount)
      await linePushFlex(adminId, `💰 ${name} 已回報匯款`, flex)
      return NextResponse.json({ ok: true })
    }

    // 客戶通知：預約已收到（立即 Flex 確認）
    if (type === 'booking_received') {
      const recipient = publicBooking?.line_user_id ?? lineUserId
      if (!recipient) return NextResponse.json({ ok: false, error: 'lineUserId required' })
      const venueName = Array.isArray(publicBooking?.venue) ? publicBooking?.venue[0]?.name : publicBooking?.venue?.name
      const totalAmount = body.totalAmount
      const phone = publicBooking?.phone ?? body.phone
      const isWaitlist = publicBooking?.status === 'waitlist'
      const flex = buildCustomerBookingConfirmFlex(
        publicBooking?.name ?? name, publicBooking?.event_title ?? eventTitle, publicBooking?.booking_date ?? bookingDate, publicBooking?.time_slot ?? timeSlot,
        venueName ?? '', totalAmount ?? null, phone ?? '', !!isWaitlist,
      )
      await linePushFlex(recipient, `${publicBooking?.name ?? name}，您的場地申請已收到！`, flex)
      return NextResponse.json({ ok: true })
    }

    if (!lineUserId) return NextResponse.json({ ok: false })
    const { phone } = body
    if (type === 'confirmed') {
      await linePushFlex(lineUserId, `${name}，場地租借已確認！`, buildConfirmedFlex(name, eventTitle, bookingDate, timeSlot, phone ?? ''))
    } else if (type === 'cancelled') {
      await linePushFlex(lineUserId, `${name}，您的場地申請已取消`, buildCancelledFlex(name, eventTitle))
    } else if (type === 'waitlist') {
      await linePushFlex(lineUserId, `${name}，候補時段釋出！`, buildWaitlistFlex(name, eventTitle, bookingDate, timeSlot))
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
