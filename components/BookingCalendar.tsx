'use client'
import { useState, useEffect, useCallback } from 'react'
import type { TimeSlot, VenuePricing } from '@/lib/types'
import { TIME_SLOT_LABEL, getPriceForSlot } from '@/lib/types'

const SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']
const SLOT_SHORT: Record<TimeSlot, string> = { morning: '早', afternoon: '午', evening: '晚' }
const DOW = ['日', '一', '二', '三', '四', '五', '六']

type SlotStatus = 'available' | 'pending' | 'booked' | 'past'
type MonthMap = Record<string, Record<string, string>>

export interface CalendarSelection {
  date: Date
  dateStr: string // YYYY-MM-DD local
  slot: TimeSlot
}

interface Props {
  venueId: string
  pricing: VenuePricing[]
  onSelect: (sel: CalendarSelection) => void
  selected?: CalendarSelection | null
}

function toLocalDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isHolidayDate(d: Date) { return d.getDay() === 0 || d.getDay() === 6 }

function isPastDate(d: Date) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d < today
}

function buildCells(year: number, month: number): (Date | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

export function BookingCalendar({ venueId, pricing, onSelect, selected }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [avail, setAvail] = useState<MonthMap>({})
  const [loading, setLoading] = useState(false)

  const loadMonth = useCallback(async (y: number, m: number) => {
    if (!venueId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        year: String(y), month: String(m), venue_id: venueId,
      })
      const res = await fetch(`/api/availability?${params}`)
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
    if (isPastDate(date)) return 'past'
    const key = toLocalDateStr(date)
    const s = avail[key]?.[slot]
    if (s === 'pending') return 'pending'
    if (s === 'booked') return 'booked'
    return 'available'
  }

  function isSelected(date: Date, slot: TimeSlot) {
    return selected?.dateStr === toLocalDateStr(date) && selected.slot === slot
  }

  const cells = buildCells(year, month)

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center text-[var(--gray)] hover:text-[var(--charcoal)] transition-colors">
          ←
        </button>
        <span className="text-sm tracking-widest text-[var(--charcoal)]">
          {year} 年 {month + 1} 月
          {loading && <span className="ml-2 text-xs text-[var(--gray)]">…</span>}
        </span>
        <button type="button" onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center text-[var(--gray)] hover:text-[var(--charcoal)] transition-colors">
          →
        </button>
      </div>

      {/* Day of week header */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DOW.map((d, i) => (
          <div key={d} className={`text-[10px] pb-1 ${i === 0 || i === 6 ? 'text-red-400' : 'text-[var(--gray)]'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[56px]" />
          const isPst = isPastDate(date)
          const isHol = isHolidayDate(date)
          const isToday = toLocalDateStr(date) === toLocalDateStr(today)

          return (
            <div key={i} className={`min-h-[56px] p-0.5 ${isPst ? 'opacity-40' : ''}`}>
              {/* Date number */}
              <div className={`text-center text-[10px] mb-0.5 font-medium
                ${isToday ? 'text-[var(--gold)]' : isHol ? 'text-red-400' : 'text-[var(--charcoal)]'}`}>
                {date.getDate()}
              </div>
              {/* Slot badges */}
              <div className="flex flex-col gap-0.5">
                {SLOTS.map(slot => {
                  const status = getStatus(date, slot)
                  const sel = isSelected(date, slot)
                  const canSelect = status === 'available'

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!canSelect}
                      onClick={() => {
                        const dateStr = toLocalDateStr(date)
                        onSelect({ date, dateStr, slot })
                      }}
                      className={[
                        'w-full text-[9px] leading-none py-0.5 rounded-sm transition-colors',
                        sel
                          ? '!bg-[var(--gold)] !text-white'
                          : status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                            : status === 'pending'
                              ? 'bg-amber-50 text-amber-500 cursor-not-allowed'
                              : status === 'booked'
                                ? 'bg-red-50 text-red-300 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed',
                      ].join(' ')}
                      title={`${date.getMonth() + 1}/${date.getDate()} ${SLOT_SHORT[slot]}場 — ${
                        { available: '可預約', pending: '待確認', booked: '已預約', past: '已過期' }[status]
                      }`}
                    >
                      {SLOT_SHORT[slot]}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-[var(--gray)]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-emerald-50 border border-emerald-200" />可預約
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-amber-50 border border-amber-200" />待確認
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-red-50 border border-red-200" />已預約
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-[var(--gold)]" />已選
        </span>
      </div>

      {/* Price preview */}
      {selected && (
        <PricePreview pricing={pricing} date={selected.date} slot={selected.slot} />
      )}
    </div>
  )
}

function PricePreview({ pricing, date, slot }: { pricing: VenuePricing[]; date: Date; slot: TimeSlot }) {
  const p = getPriceForSlot(pricing, date, slot)
  if (!p) return null
  return (
    <div className="mt-3 p-3 bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-between">
      <div>
        <p className="text-[10px] text-[var(--gray)] mb-0.5">
          {isHolidayDate(date) ? '假日' : '平日'} · {TIME_SLOT_LABEL[slot]}
        </p>
        {p.overtime_per_30min > 0 && (
          <p className="text-[10px] text-[var(--gray)]">超時每 30 分 +NT$ {p.overtime_per_30min}</p>
        )}
      </div>
      <p className="text-lg font-light text-[var(--charcoal)]">
        NT$ {p.price.toLocaleString()}
      </p>
    </div>
  )
}
