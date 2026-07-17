import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePush, linePushFlex, lineReply, lineReplyFlex, buildConfirmedFlex, buildCancelledFlex, buildAdminSetWaitlistFlex, buildWaitlistToPayFlex, buildCustomerBookingConfirmFlex, getLineGroupMemberName, buildCalendarButtonFlex } from '@/lib/line'
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
        // 「核可」只代表進入付款流程；確認入帳後才是 confirmed。
        confirm: 'pending',
        waitlist: 'waitlist',
        cancel: 'cancelled',
        payment_confirm: 'confirmed',
        payment_return: 'pending',
      }
      const intendedStatus = statusMap[action]
      if (!intendedStatus) continue

      // 先查目前狀態：候補申請被「核可」時應先轉 pending（待付款），而非直接 confirmed
      const { data: current } = await supabase
        .from('rental_requests')
        .select('status')
        .eq('id', bookingId)
        .single()

      const allowed = action === 'confirm'
        ? ['pending', 'waitlist'].includes(current?.status ?? '')
        : action === 'payment_confirm' || action === 'payment_return'
          ? current?.status === 'payment_pending'
          : ['pending', 'waitlist'].includes(current?.status ?? '')
      if (!allowed) {
        if (event.replyToken) await lineReply(event.replyToken, 'ℹ️ 這筆申請已處理，按鈕已失效。請以最新狀態為準。')
        continue
      }

      const isWaitlistConvert = current?.status === 'waitlist' && action === 'confirm'
      const newStatus: RentalStatus = isWaitlistConvert ? 'pending' : intendedStatus
      const paymentDueAt = action === 'confirm' && newStatus === 'pending'
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : undefined

      let { data: req, error: updateError } = await supabase
        .from('rental_requests')
        .update({ status: newStatus, ...(paymentDueAt ? { payment_due_at: paymentDueAt } : {}) })
        .eq('id', bookingId)
        .select('name, phone, event_title, booking_date, time_slot, line_user_id')
        .single()

      // migration 尚未套用時，至少完成狀態切換，不阻斷核可流程。
      if (updateError && paymentDueAt) {
        const fallback = await supabase
          .from('rental_requests')
          .update({ status: newStatus })
          .eq('id', bookingId)
          .select('name, phone, event_title, booking_date, time_slot, line_user_id')
          .single()
        req = fallback.data
        updateError = fallback.error
      }

      // 回覆管理員（含操作者名稱）
      const labelMap: Record<string, string> = {
        confirmed: '✅ 已確認入帳，預約成立',
        pending: action === 'payment_return' ? '↩️ 已退回，請客戶補充匯款資料' : action === 'confirm' ? '🟡 已核可，等待客戶付款' : '🟡 等待付款',
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
        const phone = req.phone ?? ''
        if (action === 'payment_confirm') {
          await linePushFlex(req.line_user_id, `${req.name}，場地租借已確認！`, buildConfirmedFlex(req.name, req.event_title, req.booking_date ?? '', slotLabel, phone))
        } else if (action === 'payment_return') {
          await linePushFlex(req.line_user_id, `${req.name}，請補充或修正匯款資料`, buildCustomerBookingConfirmFlex(req.name, req.event_title, req.booking_date ?? '', slotLabel, '', null, phone, false, true, null))
        } else if (action === 'confirm' && newStatus === 'pending') {
          await linePushFlex(req.line_user_id, `${req.name}，申請已核可，請完成付款`, buildCustomerBookingConfirmFlex(req.name, req.event_title, req.booking_date ?? '', slotLabel, '', null, phone, false, true, paymentDueAt))
        } else if (newStatus === 'pending' && isWaitlistConvert) {
          await linePushFlex(req.line_user_id, `${req.name}，候補已確認，請完成匯款！`, buildWaitlistToPayFlex(req.name, req.event_title, req.booking_date ?? '', slotLabel, phone))
        } else if (newStatus === 'cancelled') {
          await linePushFlex(req.line_user_id, `${req.name}，您的場地申請已取消`, buildCancelledFlex(req.name, req.event_title))
        } else if (newStatus === 'waitlist') {
          await linePushFlex(req.line_user_id, `${req.name}，您的申請已列為候補`, buildAdminSetWaitlistFlex(req.name, req.event_title, req.booking_date ?? '', slotLabel))
        }
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
