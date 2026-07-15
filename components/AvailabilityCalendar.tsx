'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { TimeSlot } from '@/lib/types'
import { CTA } from '@/lib/cta'

const SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']
const DOW = ['日', '一', '二', '三', '四', '五', '六']

const SLOT_CONFIG: Record<TimeSlot, { label: string; time: string }> = {
  morning:   { label: '早場', time: '09:00–12:00' },
  afternoon: { label: '午場', time: '14:00–17:00' },
  evening:   { label: '晚場', time: '18:30–21:30' },
}

type SlotStatus = 'available' | 'pending' | 'booked' | 'past'
type MonthMap = Record<string, Record<string, string>>

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isPast(d: Date) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d < today
}

function buildCells(y: number, m: number): (Date | null)[] {
  const firstDow = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d))
  return cells
}

const STATUS_BG: Record<SlotStatus, string> = {
  available: '#86efac',  // green-300
  pending:   '#fcd34d',  // amber-300
  booked:    '#fca5a5',  // red-300
  past:      '#e5e7eb',  // gray-200
}
const STATUS_LABEL: Record<SlotStatus, string> = {
  available: '可預約',
  pending:   '待確認',
  booked:    '已預約',
  past:      '已過期',
}

interface Props {
  venueId: string
}

export function AvailabilityCalendar({ venueId }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [avail, setAvail] = useState<MonthMap>({})
  const [loading, setLoading] = useState(false)
  const [activeDate, setActiveDate] = useState<string | null>(null)

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ year: String(y), month: String(m), venue_id: venueId })
      const res = await fetch(`/api/availability?${p}`)
      const { map } = await res.json()
      setAvail(map ?? {})
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => { loadMonth(year, month) }, [year, month, loadMonth])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function getStatus(date: Date, slot: TimeSlot): SlotStatus {
    if (isPast(date)) return 'past'
    const s = avail[toLocalDateStr(date)]?.[slot]
    if (s === 'pending') return 'pending'
    if (s === 'booked') return 'booked'
    return 'available'
  }

  function availableCount(dateStr: string, date: Date): number {
    if (isPast(date)) return 0
    return SLOTS.filter(s => !avail[dateStr]?.[s]).length
  }

  const cells = buildCells(year, month)
  const activeDay = activeDate ? new Date(activeDate + 'T00:00:00') : null
  const activeDateLabel = activeDay
    ? `${activeDay.getMonth() + 1} 月 ${activeDay.getDate()} 日（${DOW[activeDay.getDay()]}）`
    : ''

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center border transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}
        >←</button>
        <span className="font-serif text-lg tracking-widest" style={{ color: 'var(--charcoal)' }}>
          {year} 年 {month + 1} 月
          {loading && <span className="ml-2 text-xs" style={{ color: 'var(--gray)' }}>載入中…</span>}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center border transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}
        >→</button>
      </div>

      {/* Day of week header */}
      <div className="grid grid-cols-7 text-center mb-2">
        {DOW.map((d, i) => (
          <div key={d} className="text-[10px] tracking-widest py-1"
            style={{ color: i === 0 || i === 6 ? '#f87171' : 'var(--gray)' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[72px]" />
          const dateStr = toLocalDateStr(date)
          const isPst = isPast(date)
          const isHol = date.getDay() === 0 || date.getDay() === 6
          const isToday = dateStr === toLocalDateStr(today)
          const isActive = activeDate === dateStr
          const cnt = availableCount(dateStr, date)

          return (
            <button
              key={i}
              type="button"
              disabled={isPst}
              onClick={() => setActiveDate(isActive ? null : dateStr)}
              className="min-h-[72px] p-1.5 flex flex-col items-center gap-1 border transition-all"
              style={{
                opacity: isPst ? 0.4 : 1,
                cursor: isPst ? 'not-allowed' : 'pointer',
                borderColor: isActive ? 'var(--gold)' : 'var(--border-color)',
                background: isActive ? 'rgba(196,160,56,0.06)' : 'var(--card-bg)',
              }}
            >
              {/* Date */}
              <span className="text-xs font-medium"
                style={{
                  color: isActive ? 'var(--gold)'
                    : isToday ? 'var(--gold)'
                    : isHol ? '#f87171'
                    : 'var(--charcoal)',
                  fontWeight: isToday ? 700 : 500,
                }}>
                {date.getDate()}
              </span>

              {/* 3 slot bars */}
              <div className="w-full flex flex-col gap-0.5">
                {SLOTS.map(slot => {
                  const status = getStatus(date, slot)
                  return (
                    <div key={slot}
                      className="h-1.5 w-full rounded-full"
                      style={{ background: STATUS_BG[status] }}
                      title={`${SLOT_CONFIG[slot].label}：${STATUS_LABEL[status]}`}
                    />
                  )
                })}
              </div>

              {/* Available count */}
              {!isPst && (
                <span className="text-[9px] leading-none"
                  style={{ color: cnt === 0 ? '#fca5a5' : cnt === 3 ? '#16a34a' : 'var(--gray)' }}>
                  {cnt === 0 ? '全滿' : `${cnt}/3`}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-5 mt-4 text-[10px] flex-wrap" style={{ color: 'var(--gray)' }}>
        {(['available', 'pending', 'booked'] as SlotStatus[]).map(s => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="block w-3 h-1.5 rounded-full" style={{ background: STATUS_BG[s] }} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      {/* Day detail panel */}
      {activeDay && (
        <div className="mt-6 border p-6" style={{ borderColor: 'var(--gold)', background: 'var(--cream)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif text-base" style={{ color: 'var(--charcoal)' }}>
              {activeDay.getMonth() + 1} 月 {activeDay.getDate()} 日
              （{DOW[activeDay.getDay()]}）
              <span className="ml-2 text-xs font-sans" style={{ color: 'var(--gray)' }}>
                {activeDay.getDay() === 0 || activeDay.getDay() === 6 ? '假日' : '平日'}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setActiveDate(null)}
              className="text-xs"
              style={{ color: 'var(--gray)' }}
            >✕</button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {SLOTS.map(slot => {
              const status = getStatus(activeDay, slot)
              return (
                <div
                  key={slot}
                  className="flex flex-col items-center text-center p-3 border"
                  style={{
                    borderColor: status === 'available' ? '#86efac' : status === 'pending' ? '#fcd34d' : 'var(--border-color)',
                    background: status === 'available' ? 'rgba(134,239,172,0.1)' : status === 'pending' ? 'rgba(252,211,77,0.1)' : 'var(--surface)',
                  }}
                >
                  <div className="w-3 h-1.5 rounded-full mb-2" style={{ background: STATUS_BG[status] }} />
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--charcoal)' }}>
                    {SLOT_CONFIG[slot].label}
                  </p>
                  <p className="text-[10px] mb-2" style={{ color: 'var(--gray)' }}>
                    {SLOT_CONFIG[slot].time}
                  </p>
                  <p className="text-[10px] font-medium"
                    style={{ color: status === 'available' ? '#16a34a' : status === 'pending' ? '#d97706' : '#dc2626' }}>
                    {STATUS_LABEL[status]}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
                {activeDateLabel} 已選取
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--gray)' }}>
                直接帶入申請表單，接著挑選要預約的時段
              </p>
            </div>
            <Link
              href={`/rent?date=${activeDate}`}
              className="btn-gold-fill inline-flex items-center justify-center text-xs tracking-widest px-5 py-3"
            >
              {CTA.venue.applyFromAvailability}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
