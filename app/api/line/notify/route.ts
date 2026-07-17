import { NextRequest, NextResponse } from 'next/server'
import { linePushFlex, buildConfirmedFlex, buildCancelledFlex, buildWaitlistFlex, buildAdminPaymentFlex, buildAdminNewBookingFlex, buildCustomerBookingConfirmFlex } from '@/lib/line'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, lineUserId, name, eventTitle, bookingDate, timeSlot } = body

    // 管理員通知：新預約申請（Flex Message + 核可/候補/取消按鈕）
    if (type === 'new_booking') {
      const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
      if (!adminId) return NextResponse.json({ ok: false, error: 'ADMIN_LINE_GROUP_ID not set' })
      const { bookingId, phone, email, venueName, guestCount, note, isWaitlist, lineUserId: customerLineUserId } = body
      const flex = buildAdminNewBookingFlex(
        bookingId, name, phone, email ?? '', eventTitle, bookingDate, timeSlot,
        venueName ?? '', guestCount ?? null, note ?? null, !!isWaitlist, customerLineUserId ?? null,
      )
      const altText = `${isWaitlist ? '🔔 候補' : '📋 新預約'}：${name}・${eventTitle}`
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
      if (!lineUserId) return NextResponse.json({ ok: false, error: 'lineUserId required' })
      const { venueName, totalAmount, phone, isWaitlist } = body
      const flex = buildCustomerBookingConfirmFlex(
        name, eventTitle, bookingDate, timeSlot,
        venueName ?? '', totalAmount ?? null, phone ?? '', !!isWaitlist,
      )
      await linePushFlex(lineUserId, `${name}，您的場地申請已收到！`, flex)
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
