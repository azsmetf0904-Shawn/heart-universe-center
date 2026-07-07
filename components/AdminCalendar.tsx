'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RentalRequest, RentalStatus } from '@/lib/types'
import { RENTAL_STATUS_LABEL, TIME_SLOT_LABEL } from '@/lib/types'

const DOW = ['日', '一', '二', '三', '四', '五', '六']

const STATUS_DOT: Record<RentalStatus, string> = {
  pending:         '#fcd34d',
  confirmed:       '#60a5fa',
  payment_pending: '#fb923c',
  completed:       '#4ade80',
  cancelled:       '#d1d5db',
}
const STATUS_BG: Record<RentalStatus, string> = {
  pending:         'rgba(252,211,77,0.15)',
  confirmed:       'rgba(96,165,250,0.15)',
  payment_pending: 'rgba(251,146,60,0.15)',
  completed:       'rgba(74,222,128,0.15)',
  cancelled:       'rgba(209,213,219,0.15)',
}

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildCells(y: number, m: number): (Date | null)[] {
  const firstDow = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d))
  return cells
}

export function AdminCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [activeDate, setActiveDate] = useState<string | null>(null)

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true)
    const supabase = createClient()
    const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const lastDay   = new Date(y, m + 1, 0).getDate()
    const endDate   = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    const { data } = await supabase
      .from('rental_requests')
      .select('*')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date')
      .order('time_slot')
    setRequests(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadMonth(year, month) }, [year, month, loadMonth])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function dayRequests(dateStr: string) {
    return requests.filter(r => r.booking_date === dateStr && r.status !== 'cancelled')
  }

  const cells = buildCells(year, month)
  const activeDayReqs = activeDate ? dayRequests(activeDate) : []
  const activeDay = activeDate ? new Date(activeDate + 'T00:00:00') : null

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={prevMonth}
          className="px-3 py-1.5 text-sm border transition-colors hover:border-[var(--charcoal)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>← 上月</button>
        <span className="font-serif text-lg" style={{ color: 'var(--charcoal)' }}>
          {year} 年 {month + 1} 月
          {loading && <span className="ml-2 text-xs" style={{ color: 'var(--gray)' }}>載入中…</span>}
        </span>
        <button type="button" onClick={nextMonth}
          className="px-3 py-1.5 text-sm border transition-colors hover:border-[var(--charcoal)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>下月 →</button>
      </div>

      {/* Day of week header */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DOW.map((d, i) => (
          <div key={d} className="text-[10px] tracking-widest py-1.5"
            style={{ color: i === 0 || i === 6 ? '#f87171' : 'var(--gray)' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border-color)' }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[90px]" style={{ background: 'var(--cream)' }} />
          const dateStr = toLocalDateStr(date)
          const isToday = dateStr === toLocalDateStr(today)
          const isHol = date.getDay() === 0 || date.getDay() === 6
          const isActive = activeDate === dateStr
          const dayReqs = dayRequests(dateStr)

          return (
            <div
              key={i}
              className="min-h-[90px] p-1.5 cursor-pointer transition-colors"
              style={{
                background: isActive ? 'rgba(196,160,56,0.08)' : 'var(--cream)',
                outline: isActive ? '2px solid var(--gold)' : 'none',
                outlineOffset: -2,
              }}
              onClick={() => setActiveDate(isActive ? null : dateStr)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-medium w-5 h-5 flex items-center justify-center"
                  style={{
                    background: isToday ? 'var(--gold)' : 'transparent',
                    color: isToday ? 'white' : isHol ? '#f87171' : 'var(--charcoal)',
                    borderRadius: isToday ? '50%' : undefined,
                  }}
                >
                  {date.getDate()}
                </span>
                {dayReqs.length > 0 && (
                  <span className="text-[9px]" style={{ color: 'var(--gold)' }}>{dayReqs.length}</span>
                )}
              </div>

              {/* Booking badges */}
              <div className="flex flex-col gap-0.5">
                {dayReqs.slice(0, 3).map(r => (
                  <div
                    key={r.id}
                    className="px-1 py-0.5 text-[9px] leading-tight truncate"
                    style={{
                      background: STATUS_BG[r.status],
                      borderLeft: `2px solid ${STATUS_DOT[r.status]}`,
                      color: 'var(--charcoal)',
                    }}
                  >
                    {r.time_slot ? TIME_SLOT_LABEL[r.time_slot as keyof typeof TIME_SLOT_LABEL] : ''} {r.event_title}
                  </div>
                ))}
                {dayReqs.length > 3 && (
                  <div className="text-[9px]" style={{ color: 'var(--gray)' }}>+{dayReqs.length - 3} 筆</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Status legend */}
      <div className="flex gap-4 mt-3 flex-wrap">
        {(Object.entries(RENTAL_STATUS_LABEL) as [RentalStatus, string][]).filter(([s]) => s !== 'cancelled').map(([s, label]) => (
          <span key={s} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--gray)' }}>
            <span className="block w-2.5 h-2.5 rounded-full" style={{ background: STATUS_DOT[s] }} />
            {label}
          </span>
        ))}
      </div>

      {/* Day detail panel */}
      {activeDay && (
        <div className="mt-6 border p-6" style={{ borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif text-base" style={{ color: 'var(--charcoal)' }}>
              {activeDay.getMonth() + 1} 月 {activeDay.getDate()} 日（{DOW[activeDay.getDay()]}）
              {activeDayReqs.length === 0 && (
                <span className="ml-2 text-xs font-sans" style={{ color: 'var(--gray)' }}>無預約</span>
              )}
            </p>
            <button type="button" onClick={() => setActiveDate(null)} className="text-xs" style={{ color: 'var(--gray)' }}>✕</button>
          </div>

          {activeDayReqs.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--gray)' }}>這天尚無預約紀錄</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeDayReqs.map(r => (
                <div key={r.id} className="p-4 border" style={{ borderColor: 'var(--border-color)', borderLeft: `3px solid ${STATUS_DOT[r.status]}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>{r.event_title}</p>
                    <span className="text-[10px] px-2 py-0.5" style={{ background: STATUS_BG[r.status], color: 'var(--charcoal)' }}>
                      {RENTAL_STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-[11px]" style={{ color: 'var(--gray)' }}>
                    <span>申請人：{r.name}</span>
                    <span>時段：{r.time_slot ? TIME_SLOT_LABEL[r.time_slot as keyof typeof TIME_SLOT_LABEL] : '—'}</span>
                    <span>手機：{r.phone}</span>
                    <span>人數：{r.guest_count ?? '—'}</span>
                  </div>
                  {r.note && (
                    <p className="mt-2 text-[11px]" style={{ color: 'var(--gray)' }}>備註：{r.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
