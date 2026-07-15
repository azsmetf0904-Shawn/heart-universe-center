import { NextRequest, NextResponse } from 'next/server'
import { linePush, linePushFlex, lineConfirmedMsg, lineCancelledMsg, lineWaitlistMsg, buildAdminPaymentFlex, buildAdminNewBookingFlex } from '@/lib/line'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, lineUserId, name, eventTitle, bookingDate, timeSlot } = body

    // 管理員通知：新預約申請（Flex Message + 核可/候補/取消按鈕）
    if (type === 'new_booking') {
      const adminId = process.env.ADMIN_LINE_GROUP_ID ?? process.env.ADMIN_LINE_USER_ID
      if (!adminId) return NextResponse.json({ ok: false, error: 'ADMIN_LINE_GROUP_ID not set' })
      const { bookingId, phone, venueName, guestCount, note, isWaitlist } = body
      const flex = buildAdminNewBookingFlex(
        bookingId, name, phone, eventTitle, bookingDate, timeSlot,
        venueName ?? '', guestCount ?? null, note ?? null, !!isWaitlist,
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

    if (!lineUserId) return NextResponse.json({ ok: false })
    let text = ''
    if (type === 'confirmed') text = lineConfirmedMsg(name, eventTitle, bookingDate, timeSlot)
    else if (type === 'cancelled') text = lineCancelledMsg(name, eventTitle)
    else if (type === 'waitlist') text = lineWaitlistMsg(name, eventTitle, bookingDate, timeSlot)

    if (text) await linePush(lineUserId, text)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
