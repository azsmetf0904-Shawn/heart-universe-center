export const dynamic = 'force-dynamic'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RENTAL_STATUS_LABEL, TIME_SLOT_LABEL } from '@/lib/types'
import type { RentalStatus, TimeSlot } from '@/lib/types'
import { verifyCalendarToken } from '@/lib/calendar-token'

const STATUS_COLOR: Record<string, string> = {
  pending:         '#F59E0B',
  payment_pending: '#3B82F6',
  confirmed:       '#22C55E',
  waitlist:        '#A855F7',
  completed:       '#15803D',
}

const MONTH_ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六']

type Booking = {
  id: string
  name: string
  phone: string
  event_title: string
  booking_date: string
  time_slot: string | null
  time_slots: string[] | null
  status: RentalStatus
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; token?: string; expires?: string }>
}) {
  const sp = await searchParams

  // 兩種存取路徑：Supabase 管理員登入（後台使用），或 LINE OA 審核群組取得的
  // 短效簽章連結（沒有後台帳號的工作人員/志工用）。兩者擇一即可。
  const hasValidToken = verifyCalendarToken(sp.token, sp.expires)
  let isAdmin = hasValidToken
  if (!isAdmin) {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    const { data } = user ? await auth.rpc('is_admin') : { data: false }
    isAdmin = Boolean(user && data)
  }
  if (!isAdmin) {
    return (
      <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#888', textAlign: 'center', marginTop: 80 }}>
        🔒 無存取權限
      </div>
    )
  }

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const year = parseInt(sp.year ?? '') || now.getFullYear()
  const month = Math.max(1, Math.min(12, parseInt(sp.month ?? '') || (now.getMonth() + 1)))

  const daysInMonth = new Date(year, month, 0).getDate()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('rental_requests')
    .select('id, name, phone, event_title, booking_date, time_slot, time_slots, status')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    .neq('status', 'cancelled')
    .order('booking_date')
    .order('time_slot')

  const bookings: Booking[] = (data ?? []) as Booking[]

  const byDate = new Map<string, Booking[]>()
  for (const b of bookings) {
    if (!b.booking_date) continue
    if (!byDate.has(b.booking_date)) byDate.set(b.booking_date, [])
    byDate.get(b.booking_date)!.push(b)
  }

  const prevM = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextM = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  const tokenQuery = hasValidToken ? `&token=${sp.token}&expires=${sp.expires}` : ''
  const base = '/admin-calendar'

  const firstDow = new Date(year, month - 1, 1).getDay()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const occupiedDays = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif',
      maxWidth: 480, margin: '0 auto', padding: '12px 10px',
      background: '#FFFCFA', minHeight: '100vh', color: '#2C1E12',
    }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Link href={`${base}?year=${prevM.year}&month=${prevM.month}${tokenQuery}`}
          style={{
            textDecoration: 'none', color: '#C4A038', fontSize: 14, fontWeight: 500,
            minWidth: 48, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
          }}>
          ‹ {MONTH_ZH[prevM.month]}月
        </Link>
        <span style={{ fontSize: 16, fontWeight: 700 }}>
          {year} 年 {MONTH_ZH[month]} 月
        </span>
        <Link href={`${base}?year=${nextM.year}&month=${nextM.month}${tokenQuery}`}
          style={{
            textDecoration: 'none', color: '#C4A038', fontSize: 14, fontWeight: 500,
            minWidth: 48, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          }}>
          {MONTH_ZH[nextM.month]}月 ›
        </Link>
      </div>

      {/* Calendar grid */}
      <div style={{ border: '1px solid #EDE8E2', borderRadius: 10, overflow: 'hidden', marginBottom: 20, background: '#fff' }}>
        {/* Weekday header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F5EDE4' }}>
          {WEEKDAY_ZH.map((w, i) => (
            <div key={w} style={{
              textAlign: 'center', padding: '7px 0', fontSize: 11, fontWeight: 600,
              color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#6B4226',
            }}>
              {w}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            if (day === null) return (
              <div key={`e${idx}`} style={{ minHeight: 52, borderRight: '1px solid #F5EDE4', borderBottom: '1px solid #F5EDE4' }} />
            )
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayBks = byDate.get(dateStr) ?? []
            const isToday = dateStr === todayStr
            const dow = (firstDow + day - 1) % 7
            return (
              <div key={day} style={{
                minHeight: 52, padding: '5px 3px',
                borderRight: '1px solid #F5EDE4', borderBottom: '1px solid #F5EDE4',
                background: isToday ? 'rgba(196,160,56,0.08)' : undefined,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  margin: '0 auto 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: isToday ? 700 : 400,
                  background: isToday ? '#C4A038' : undefined,
                  color: isToday ? '#fff' : dow === 0 ? '#EF4444' : dow === 6 ? '#3B82F6' : '#2C1E12',
                }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                  {dayBks.map(b => (
                    <div key={b.id} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: STATUS_COLOR[b.status] ?? '#ccc',
                    }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {([
          ['待付款', '#F59E0B'],
          ['匯款審核', '#3B82F6'],
          ['已確認', '#22C55E'],
          ['候補', '#A855F7'],
        ] as [string, string][]).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B4226' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Booking detail list */}
      {occupiedDays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#B09880', fontSize: 14 }}>
          本月尚無預約
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {occupiedDays.map(([date, items]) => {
            const d = new Date(date + 'T00:00:00')
            const wd = WEEKDAY_ZH[d.getDay()]
            const isPast = date < todayStr
            return (
              <div key={date} style={{
                border: '1px solid #EDE8E2', borderRadius: 8, overflow: 'hidden',
                background: '#fff', opacity: isPast ? 0.6 : 1,
              }}>
                <div style={{
                  padding: '7px 14px', background: '#F5EDE4',
                  fontSize: 12, fontWeight: 600, color: '#6B4226',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{date}（{wd}）</span>
                  {isPast && <span style={{ fontWeight: 400, color: '#B09880', fontSize: 11 }}>已過</span>}
                </div>
                {items.map(b => {
                  const slotLabel = (b.time_slots && b.time_slots.length > 1)
                    ? b.time_slots.map(s => TIME_SLOT_LABEL[s as TimeSlot] ?? s).join('、')
                    : (TIME_SLOT_LABEL[b.time_slot as TimeSlot] ?? b.time_slot ?? '—')
                  const c = STATUS_COLOR[b.status] ?? '#999'
                  return (
                    <div key={b.id} style={{ padding: '10px 14px', borderTop: '1px solid #F5EDE4', borderLeft: `3px solid ${STATUS_COLOR[b.status] ?? '#ccc'}` }}>
                      {/* Title + badge row：minWidth:0 讓 title 可以截斷 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          flex: 1, minWidth: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {b.event_title}
                        </span>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 10, flexShrink: 0,
                          background: c + '22', color: c, fontWeight: 600,
                        }}>
                          {RENTAL_STATUS_LABEL[b.status]}
                        </span>
                      </div>
                      {/* 時段獨立一行 */}
                      <div style={{ fontSize: 11, color: '#B09880', marginBottom: 2 }}>
                        {slotLabel}
                      </div>
                      {/* 姓名 + 可撥號電話 */}
                      <div style={{ fontSize: 11, color: '#B09880' }}>
                        {b.name}・
                        <a href={`tel:${b.phone}`} style={{ color: '#B09880', textDecoration: 'none' }}>
                          {b.phone}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 12, fontSize: 10, color: '#C4A038', letterSpacing: 2 }}>
        心宇宙商務中心 · 管理月曆
      </div>
    </div>
  )
}
