import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { linePushFlex, buildReminderFlex } from '@/lib/line'
import { TIME_SLOT_LABEL } from '@/lib/types'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const supabase = await createAdminClient()

  // 付款期限到期後自動取消仍未付款的申請，避免場地長期被佔用。
  const { data: expired } = await supabase
    .from('rental_requests')
    .select('id, name, event_title, line_user_id')
    .eq('status', 'pending')
    .not('payment_due_at', 'is', null)
    .lt('payment_due_at', new Date().toISOString())

  const expiredIds: string[] = []
  for (const booking of expired ?? []) {
    const { data: updated } = await supabase
      .from('rental_requests')
      .update({ status: 'cancelled', admin_note: '付款期限已到期，系統自動取消' })
      .eq('id', booking.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()
    if (!updated) continue
    expiredIds.push(booking.id)
    if (booking.line_user_id) {
      const { buildCancelledFlex } = await import('@/lib/line')
      await linePushFlex(booking.line_user_id, `${booking.name}，您的場地申請已逾期取消`, buildCancelledFlex(booking.name, booking.event_title)).catch(() => {})
    }
  }

  // 台灣時間 (UTC+8) 明天日期
  const nowUtc = Date.now()
  const tomorrowTW = new Date(nowUtc + 8 * 60 * 60 * 1000)
  tomorrowTW.setUTCDate(tomorrowTW.getUTCDate() + 1)
  const tomorrow = tomorrowTW.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('rental_requests')
    .select('id, name, event_title, booking_date, time_slot, line_user_id, venues(name)')
    .eq('status', 'confirmed')
    .eq('booking_date', tomorrow)
    .not('line_user_id', 'is', null)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const sent: string[] = []
  for (const r of (data ?? [])) {
    const slotLabel = TIME_SLOT_LABEL[r.time_slot as keyof typeof TIME_SLOT_LABEL] ?? r.time_slot ?? ''
    const venueName = (r.venues as { name?: string } | null)?.name ?? ''
    const flex = buildReminderFlex(r.name, r.event_title, r.booking_date ?? '', slotLabel, venueName)
    await linePushFlex(r.line_user_id!, `${r.name}，您明天有場地預約！`, flex)
    sent.push(r.id)
  }

  return NextResponse.json({ ok: true, sent: sent.length, ids: sent, expired: expiredIds.length, expiredIds })
}
