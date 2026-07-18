'use client'
import { useState, useEffect, useCallback } from 'react'
import type { TimeSlot, VenuePricing } from '@/lib/types'
import { getPriceForSlot } from '@/lib/types'

const SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']
const DOW = ['日', '一', '二', '三', '四', '五', '六']

const SLOT_CONFIG: Record<TimeSlot, { label: string; short: string; time: string }> = {
  morning:   { label: '早場', short: '早', time: '09:00 – 12:00' },
  afternoon: { label: '午場', short: '午', time: '14:00 – 17:00' },
  evening:   { label: '晚場', short: '晚', time: '18:30 – 21:30' },
}

type SlotStatus = 'available' | 'pending' | 'booked' | 'past'
type MonthMap = Record<string, Record<string, string>>

export interface CalendarSelection {
  date: Date
  dateStr: string
  slots: TimeSlot[]
}

interface Props {
  venueId: string
  pricing: VenuePricing[]
  onSelect: (sel: CalendarSelection | null) => void
  selected?: CalendarSelection | null
}

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(selected?.date ?? null)

  const loadMonth = useCallback(async (y: number, m: number) => {
    if (!venueId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ year: String(y), month: String(m), venue_id: venueId })
      const res = await fetch(`/api/availability?${params}`)
      const { map } = await res.json()
      setAvail(map ?? {})
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => { queueMicrotask(() => { void loadMonth(year, month) }) }, [year, month, loadMonth])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function getSlotStatus(date: Date, slot: TimeSlot): SlotStatus {
    if (isPastDate(date)) return 'past'
    const s = avail[toLocalDateStr(date)]?.[slot]
    if (s === 'pending') return 'pending'
    if (s === 'booked') return 'booked'
    return 'available'
  }

  // Dot color per slot for calendar cell
  function dotColor(status: SlotStatus) {
    if (status === 'available') return '#6ee7b7'  // green
    if (status === 'pending') return '#fcd34d'    // amber
    if (status === 'booked') return '#fca5a5'     // red
    return 'var(--border-color)'                  // past/gray
  }

  function handleDateClick(date: Date) {
    if (isPastDate(date)) return
    setSelectedDate(date)
    // reset slots when changing date
    if (selected?.dateStr !== toLocalDateStr(date)) {
      onSelect(null)
    }
  }

  function handleSlotToggle(slot: TimeSlot) {
    if (!selectedDate) return
    const dateStr = toLocalDateStr(selectedDate)
    const currentSlots = selected?.dateStr === dateStr ? selected.slots : []
    if (currentSlots.includes(slot)) {
      const next = currentSlots.filter(s => s !== slot)
      onSelect(next.length === 0 ? null : { date: selectedDate, dateStr, slots: next })
    } else {
      onSelect({ date: selectedDate, dateStr, slots: [...currentSlots, slot] })
    }
  }

  const cells = buildCells(year, month)
  const isHol = selectedDate ? isHolidayDate(selectedDate) : false
  const selectedDateStr = selectedDate ? toLocalDateStr(selectedDate) : null

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: 'var(--gray)' }}>←</button>
        <span className="text-sm tracking-widest" style={{ color: 'var(--charcoal)' }}>
          {year} 年 {month + 1} 月
          {loading && <span className="ml-2 text-xs" style={{ color: 'var(--gray)' }}>…</span>}
        </span>
        <button type="button" onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: 'var(--gray)' }}>→</button>
      </div>

      {/* Day of week header */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DOW.map((d, i) => (
          <div key={d} className="text-[10px] pb-1"
            style={{ color: i === 0 || i === 6 ? '#f87171' : 'var(--gray)' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid — date selection only */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="min-h-[52px]" />
          const isPst = isPastDate(date)
          const isHoliday = isHolidayDate(date)
          const isToday = toLocalDateStr(date) === toLocalDateStr(today)
          const isThisDateSelected = selectedDateStr === toLocalDateStr(date)

          return (
            <button
              key={i}
              type="button"
              disabled={isPst}
              onClick={() => handleDateClick(date)}
              className="min-h-[52px] p-1 flex flex-col items-center transition-colors"
              style={{
                opacity: isPst ? 0.35 : 1,
                cursor: isPst ? 'not-allowed' : 'pointer',
                background: isThisDateSelected ? 'var(--gold)' : 'transparent',
                outline: isThisDateSelected ? 'none' : undefined,
              }}
            >
              {/* Date number */}
              <span className="text-[11px] font-medium mb-1"
                style={{
                  color: isThisDateSelected ? 'white'
                    : isToday ? 'var(--gold)'
                    : isHoliday ? '#f87171'
                    : 'var(--charcoal)',
                }}>
                {date.getDate()}
              </span>
              {/* Availability dots */}
              <div className="flex gap-0.5">
                {SLOTS.map(slot => {
                  const status = getSlotStatus(date, slot)
                  return (
                    <span
                      key={slot}
                      className="block rounded-full"
                      style={{
                        width: 4, height: 4,
                        background: isThisDateSelected ? 'rgba(255,255,255,0.6)' : dotColor(status),
                      }}
                      title={SLOT_CONFIG[slot].short}
                    />
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>

      {/* Dot legend */}
      <div className="flex gap-4 mt-3 text-[10px]" style={{ color: 'var(--gray)' }}>
        <span className="flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full bg-emerald-300" />可預約
        </span>
        <span className="flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full bg-amber-300" />待確認
        </span>
        <span className="flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full bg-red-300" />已預約
        </span>
      </div>

      {/* ── Time slot cards — appear after date selected ── */}
      {selectedDate && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
              {selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日（{['日','一','二','三','四','五','六'][selectedDate.getDay()]}）
            </span>
            <span className="text-[10px]" style={{ color: 'var(--gray)' }}>
              · {isHol ? '假日' : '平日'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map(slot => {
              const status = getSlotStatus(selectedDate, slot)
              const isSelected = selected?.dateStr === selectedDateStr && selected.slots.includes(slot)
              const canSelect = status === 'available'
              const priceObj = getPriceForSlot(pricing, selectedDate, slot)
              const price = priceObj?.price

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!canSelect}
                  onClick={() => handleSlotToggle(slot)}
                  className="relative flex flex-col items-center text-center p-3 transition-all"
                  style={{
                    border: isSelected
                      ? '2px solid var(--gold)'
                      : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--gold)' : canSelect ? 'var(--card-bg)' : 'var(--surface)',
                    cursor: canSelect ? 'pointer' : 'not-allowed',
                    opacity: canSelect ? 1 : 0.5,
                  }}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 text-white text-[10px]">✓</span>
                  )}

                  <span className="text-xs font-medium mb-1"
                    style={{ color: isSelected ? 'white' : 'var(--charcoal)' }}>
                    {SLOT_CONFIG[slot].label}
                  </span>
                  <span className="text-[10px] mb-2 leading-relaxed"
                    style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--gray)' }}>
                    {SLOT_CONFIG[slot].time}
                    <br />3 小時
                  </span>

                  {status === 'available' && price != null ? (
                    <span className="text-xs font-medium"
                      style={{ color: isSelected ? 'white' : 'var(--gold)' }}>
                      NT$ {price.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px]"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--gray)' }}>
                      {{ pending: '待確認', booked: '已預約', past: '已過期', available: '' }[status]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Total */}
          {selected && selected.slots.length > 0 && (() => {
            const total = selected.slots.reduce((sum, slot) => {
              const p = getPriceForSlot(pricing, selectedDate, slot)
              return sum + (p?.price ?? 0)
            }, 0)
            return (
              <div className="mt-3 flex items-center justify-between px-4 py-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                <span className="text-[10px] tracking-wider" style={{ color: 'var(--gray)' }}>
                  已選 {selected.slots.length} 個時段
                </span>
                <span className="text-base font-medium" style={{ color: 'var(--charcoal)' }}>
                  NT$ {total.toLocaleString()}
                </span>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
