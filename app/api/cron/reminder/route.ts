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

  return NextResponse.json({ ok: true, sent: sent.length, ids: sent })
}
