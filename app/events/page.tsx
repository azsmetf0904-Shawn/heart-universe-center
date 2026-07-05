import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '活動課程' }

function formatDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const isEnded = tab === 'ended'
  const supabase = await createClient()

  const now = new Date().toISOString()
  let query = supabase
    .from('events')
    .select('*')
    .eq('status', isEnded ? 'ended' : 'published')
    .order('start_time', { ascending: !isEnded })

  if (!isEnded) query = query.gte('start_time', now)

  const { data: events } = await query

  return (
    <div className="py-20">
      <div className="container-narrow mb-12">
        <p className="label-tag mb-4">Events</p>
        <h1 className="text-4xl md:text-5xl mb-4">活動課程</h1>
        <div className="gold-divider" />
      </div>

      {/* Tabs */}
      <div className="container-narrow mb-10">
        <div className="flex gap-6 border-b border-[var(--border-color)]">
          {[
            { tab: '', label: '即將舉辦' },
            { tab: 'ended', label: '已結束' },
          ].map(t => (
            <Link
              key={t.tab}
              href={t.tab ? `?tab=${t.tab}` : '/events'}
              className={`pb-3 text-sm tracking-widest border-b-2 transition-colors ${
                (isEnded ? t.tab === 'ended' : t.tab === '')
                  ? 'border-[var(--gold)] text-[var(--gold)]'
                  : 'border-transparent text-[var(--gray)] hover:text-[var(--charcoal)]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {!events?.length ? (
        <div className="container-narrow text-center py-20 text-[var(--gray)]">
          <p className="text-sm">{isEnded ? '尚無結束的活動' : '近期暫無活動，請持續關注'}</p>
        </div>
      ) : (
        <div className="container-wide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <Link
              key={ev.id}
              href={`/events/${ev.slug}`}
              className="group bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--gold)] transition-colors"
            >
              <div className="relative aspect-video bg-[var(--surface)] overflow-hidden">
                {ev.cover_image_url
                  ? <Image src={ev.cover_image_url} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  : <div className="w-full h-full flex items-center justify-center text-[var(--gray)] text-xs tracking-widest">EVENT</div>
                }
              </div>
              <div className="p-5">
                <p className="text-[var(--gold)] text-xs mb-2 flex items-center gap-1">
                  <CalendarDays size={12} /> {formatDate(ev.start_time)}
                </p>
                <h2 className="text-base mb-2 leading-snug">{ev.title}</h2>
                {ev.capacity && (
                  <p className="text-xs text-[var(--gray)] flex items-center gap-1 mb-3">
                    <Users size={11} /> 限 {ev.capacity} 名
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--charcoal)]">
                    {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                  </span>
                  <span className="text-xs text-[var(--gold)] group-hover:gap-2 flex items-center gap-1 transition-all">
                    {isEnded ? '查看回顧' : '報名'} <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
