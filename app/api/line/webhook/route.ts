import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { linePush, lineReply, lineConfirmedMsg, lineCancelledMsg, lineWaitlistMsg } from '@/lib/line'
import { TIME_SLOT_LABEL } from '@/lib/types'
import type { RentalStatus } from '@/lib/types'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-line-signature') ?? ''

  const hash = createHmac('sha256', process.env.LINE_CHANNEL_SECRET ?? '')
    .update(body).digest('base64')
  if (hash !== signature) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { events } = JSON.parse(body) as { events: LineEvent[] }
  const supabase = await createClient()

  for (const event of events ?? []) {
    // ── Postback：管理員點按鈕審核 ──
    if (event.type === 'postback' && event.postback?.data) {
      const params = new URLSearchParams(event.postback.data)
      const action = params.get('action')
      const bookingId = params.get('bookingId')
      if (!action || !bookingId) continue

      const statusMap: Record<string, RentalStatus> = {
        confirm: 'confirmed',
        waitlist: 'waitlist',
        cancel: 'cancelled',
      }
      const newStatus = statusMap[action]
      if (!newStatus) continue

      const { data: req } = await supabase
        .from('rental_requests')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .select('name, event_title, booking_date, time_slot, line_user_id')
        .single()

      // 回覆管理員
      const labelMap: Record<string, string> = { confirmed: '✅ 已核可', waitlist: '🕐 已設為候補', cancelled: '❌ 已取消' }
      if (event.replyToken) {
        await lineReply(event.replyToken, `${labelMap[newStatus]}：${req?.event_title ?? bookingId}`)
      }

      // 通知客戶
      if (req?.line_user_id) {
        const slotLabel = req.time_slot ? (TIME_SLOT_LABEL[req.time_slot as keyof typeof TIME_SLOT_LABEL] ?? req.time_slot) : ''
        let customerMsg = ''
        if (newStatus === 'confirmed') customerMsg = lineConfirmedMsg(req.name, req.event_title, req.booking_date ?? '', slotLabel)
        else if (newStatus === 'cancelled') customerMsg = lineCancelledMsg(req.name, req.event_title)
        else if (newStatus === 'waitlist') customerMsg = lineWaitlistMsg(req.name, req.event_title, req.booking_date ?? '', slotLabel)
        if (customerMsg) await linePush(req.line_user_id, customerMsg)
      }
      continue
    }

    // ── Message：驗證碼綁定 ──
    if (event.type !== 'message' || event.message?.type !== 'text') continue
    const userId = event.source?.userId
    if (!userId) continue

    const code = event.message.text.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(code)) continue

    const { data } = await supabase
      .from('rental_requests')
      .update({ line_user_id: userId })
      .eq('line_code', code)
      .is('line_user_id', null)
      .select('name')
      .maybeSingle()

    if (data?.name) {
      await linePush(userId, `✅ 驗證成功！${data.name}，LINE 通知已啟用。\n\n審核結果將直接透過此帳號通知您，請耐心等候。😊`)
    } else {
      await linePush(userId, '⚠️ 驗證碼無效或已使用，請確認驗證碼是否正確。')
    }
  }

  return NextResponse.json({ ok: true })
}

type LineEvent = {
  type: string
  replyToken?: string
  source?: { userId?: string }
  message?: { type: string; text: string }
  postback?: { data: string }
}
