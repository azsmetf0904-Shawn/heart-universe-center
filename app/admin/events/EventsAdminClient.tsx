'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Event, EventStatus } from '@/lib/types'
import { EVENT_STATUS_LABEL } from '@/lib/types'
import { Users, ImageIcon, List } from 'lucide-react'

const STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-500',
  published: 'bg-green-100 text-green-700',
  ended: 'bg-[var(--card-bg)] text-[var(--gray)]',
}

export default function EventsAdminClient({
  initialData,
  venues,
}: {
  initialData: Event[]
  venues: { id: string; name: string }[]
}) {
  const [events, setEvents] = useState(initialData)

  async function changeStatus(id: string, status: EventStatus) {
    const supabase = createClient()
    await supabase.from('events').update({ status }).eq('id', id)
    setEvents(e => e.map(ev => ev.id === id ? { ...ev, status } : ev))
  }

  function fmt(s: string) {
    return new Date(s).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function registeredCount(ev: Event) {
    return ev.event_registrations?.filter((r: { status: string }) => r.status === 'registered').length ?? 0
  }

  return (
    <div className="flex flex-col gap-3">
      {events.length === 0 && <p className="text-sm text-[var(--gray)] py-10 text-center">尚無活動</p>}
      {events.map(ev => (
        <div key={ev.id} className="bg-[var(--cream)] border border-[var(--border-color)] px-6 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              {ev.cover_image_url
                ? <img src={ev.cover_image_url} alt={ev.title} className="w-14 h-14 object-cover shrink-0" />
                : <div className="w-14 h-14 bg-[var(--surface)] flex items-center justify-center shrink-0"><ImageIcon size={16} className="text-[var(--gray)]" /></div>
              }
              <div>
                <p className="text-sm font-medium mb-1">{ev.title}</p>
                <p className="text-xs text-[var(--gray)]">{fmt(ev.start_time)} – {fmt(ev.end_time)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 ${STATUS_COLORS[ev.status]}`}>{EVENT_STATUS_LABEL[ev.status]}</span>
                  <span className="text-xs text-[var(--gray)] flex items-center gap-1">
                    <Users size={11} /> {registeredCount(ev)}{ev.capacity ? `/${ev.capacity}` : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(Object.keys(EVENT_STATUS_LABEL) as EventStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => changeStatus(ev.id, s)}
                  className={`text-xs px-2 py-1 border transition-colors ${ev.status === s ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-[var(--border-color)] text-[var(--gray)] hover:border-[var(--charcoal)]'}`}
                >
                  {EVENT_STATUS_LABEL[s]}
                </button>
              ))}
              <Link href={`/admin/events/${ev.id}/registrations`} className="text-xs px-3 py-1 border border-[var(--border-color)] text-[var(--gray)] hover:border-[var(--charcoal)] flex items-center gap-1 transition-colors">
                <List size={11} /> 報名名單
              </Link>
              <Link href={`/admin/events/${ev.id}/gallery`} className="text-xs px-3 py-1 border border-[var(--border-color)] text-[var(--gray)] hover:border-[var(--charcoal)] flex items-center gap-1 transition-colors">
                <ImageIcon size={11} /> 回顧照片
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
