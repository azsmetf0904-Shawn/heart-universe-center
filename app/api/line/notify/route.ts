import { NextRequest, NextResponse } from 'next/server'
import { linePush, lineConfirmedMsg, lineCancelledMsg, lineWaitlistMsg } from '@/lib/line'

export async function POST(req: NextRequest) {
  try {
    const { type, lineUserId, name, eventTitle, bookingDate, timeSlot } = await req.json()
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
