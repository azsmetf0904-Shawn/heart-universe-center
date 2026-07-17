import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePush, lineReply, lineReplyFlex, lineConfirmedMsg, lineCancelledMsg, lineAdminSetWaitlistMsg, lineWaitlistToPayMsg, getLineGroupMemberName, buildCalendarButtonFlex } from '@/lib/line'
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
  const supabase = await createAdminClient()

  for (const event of events ?? []) {
    // ── Join：OA 被加入群組，自動回報 group ID ──
    if (event.type === 'join' && event.source?.groupId) {
      const groupId = event.source.groupId
      const adminId = process.env.ADMIN_LINE_USER_ID
      if (adminId) {
        await linePush(adminId, `✅ OA 已加入群組\n\nGroup ID：${groupId}\n\n請到 Vercel 設定環境變數：\nADMIN_LINE_GROUP_ID = ${groupId}`)
      }
      if (event.replyToken) {
        await lineReply(event.replyToken, '心宇宙商務中心預約審核系統已就緒 🎉')
      }
      continue
    }

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
      const intendedStatus = statusMap[action]
      if (!intendedStatus) continue

      // 先查目前狀態：候補申請被「核可」時應先轉 pending（待付款），而非直接 confirmed
      const { data: current } = await supabase
        .from('rental_requests')
        .select('status')
        .eq('id', bookingId)
        .single()

      const isWaitlistConvert = current?.status === 'waitlist' && action === 'confirm'
      const newStatus: RentalStatus = isWaitlistConvert ? 'pending' : intendedStatus

      const { data: req } = await supabase
        .from('rental_requests')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .select('name, event_title, booking_date, time_slot, line_user_id')
        .single()

      // 回覆管理員（含操作者名稱）
      const labelMap: Record<string, string> = {
        confirmed: '✅ 已核可',
        pending: '🔔 候補已轉正式，等待客戶匯款',
        waitlist: '🕐 已設為候補',
        cancelled: '❌ 已取消',
      }
      if (event.replyToken) {
        const actorUserId = event.source?.userId
        let actorName = ''
        if (actorUserId) {
          const groupId = process.env.ADMIN_LINE_GROUP_ID
          if (groupId) actorName = await getLineGroupMemberName(groupId, actorUserId) ?? ''
        }
        const replyText = `${labelMap[newStatus] ?? '已更新'}：${req?.event_title ?? bookingId}${actorName ? `\n👤 操作者：${actorName}` : ''}`
        await lineReply(event.replyToken, replyText)
      }

      // 通知客戶
      if (req?.line_user_id) {
        const slotLabel = req.time_slot ? (TIME_SLOT_LABEL[req.time_slot as keyof typeof TIME_SLOT_LABEL] ?? req.time_slot) : ''
        let customerMsg = ''
        if (newStatus === 'confirmed') customerMsg = lineConfirmedMsg(req.name, req.event_title, req.booking_date ?? '', slotLabel)
        else if (newStatus === 'pending' && isWaitlistConvert) customerMsg = lineWaitlistToPayMsg(req.name, req.event_title, req.booking_date ?? '', slotLabel)
        else if (newStatus === 'cancelled') customerMsg = lineCancelledMsg(req.name, req.event_title)
        else if (newStatus === 'waitlist') customerMsg = lineAdminSetWaitlistMsg(req.name, req.event_title, req.booking_date ?? '', slotLabel)
        if (customerMsg) await linePush(req.line_user_id, customerMsg)
      }
      continue
    }

    // ── Message ──
    if (event.type !== 'message' || event.message?.type !== 'text') continue
    const userId = event.source?.userId
    if (!userId) continue

    const text = event.message.text.trim()

    // 月曆關鍵字：回覆月曆連結
    if (['月曆', '行事曆', 'calendar', '查月曆', 'cal'].includes(text)) {
      const token = process.env.ADMIN_CALENDAR_TOKEN ?? process.env.LINE_CHANNEL_SECRET?.slice(0, 12) ?? ''
      const now = new Date()
      const calUrl = `https://heart-universe-center.vercel.app/admin-calendar?token=${encodeURIComponent(token)}&year=${now.getFullYear()}&month=${now.getMonth() + 1}`
      if (event.replyToken) {
        await lineReplyFlex(event.replyToken, `📅 ${now.getFullYear()}年${now.getMonth() + 1}月 場地月曆`, buildCalendarButtonFlex(calUrl, now.getFullYear(), now.getMonth() + 1))
      }
      continue
    }

    const code = text.toUpperCase()
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
  source?: { userId?: string; groupId?: string }
  message?: { type: string; text: string }
  postback?: { data: string }
}
