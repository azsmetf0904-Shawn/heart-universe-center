'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const DOW = ['日', '一', '二', '三', '四', '五', '六']
const SLOTS = ['morning', 'afternoon', 'evening'] as const

const DOT_COLOR: Record<string, string> = {
  available: '#86efac',
  pending:   '#fcd34d',
  booked:    '#fca5a5',
}

function toLocalStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props { venueId: string }

export function MobileAvailabilityStrip({ venueId }: Props) {
  const [map, setMap] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    const today = new Date()
    const p = new URLSearchParams({
      year: String(today.getFullYear()),
      month: String(today.getMonth()),
      venue_id: venueId,
    })
    fetch(`/api/availability?${p}`)
      .then(r => r.json())
      .then(({ map }) => setMap(map ?? {}))
  }, [venueId])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <section className="md:hidden" style={{ background: '#2E1C0C', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>近期可用時段</span>
        <Link href="/availability" style={{ fontSize: 10, color: '#C4A038', letterSpacing: '0.1em' }}>
          查看月曆 →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          const dateStr = toLocalStr(d)
          const isHol = d.getDay() === 0 || d.getDay() === 6
          const isToday = i === 0
          const dayMap = map[dateStr] ?? {}

          return (
            <Link
              key={dateStr}
              href={`/rent?date=${dateStr}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 0',
                borderRadius: 4,
                background: isToday ? 'rgba(196,160,56,0.15)' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 7, color: isHol ? '#f87171' : 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                {DOW[d.getDay()]}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: isToday ? '#C4A038' : isHol ? '#f87171' : 'rgba(255,255,255,0.8)' }}>
                {d.getDate()}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SLOTS.map(slot => {
                  const s = dayMap[slot]
                  const color = s ? DOT_COLOR[s] ?? DOT_COLOR.booked : DOT_COLOR.available
                  return <div key={slot} style={{ width: 18, height: 3, borderRadius: 2, background: color }} />
                })}
              </div>
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        {[['#86efac', '可預約'], ['#fcd34d', '待確認'], ['#fca5a5', '已預約']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ width: 12, height: 3, borderRadius: 2, background: c, display: 'block' }} />
            {l}
          </span>
        ))}
      </div>
    </section>
  )
}
