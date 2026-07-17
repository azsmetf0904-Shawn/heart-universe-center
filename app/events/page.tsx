import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, ExternalLink, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { CTA } from '@/lib/cta'
import PageTabs from '@/components/layout/PageTabs'
import type { EventRegistration } from '@/lib/types'

export const metadata: Metadata = {
  title: '活動課程',
  description: '心宇宙商務中心舉辦的課程、講座、工作坊與社群活動，品牌培訓、身心靈成長、女性創業一覽。',
  openGraph: {
    title: '活動課程｜心宇宙商務中心',
    description: '課程、講座、工作坊與社群活動，台北八德路精品場地。',
    type: 'website',
  },
}

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
    .select('*, event_registrations(id, status)')
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

      <PageTabs active="events" />

      {!events?.length ? (
        <div className="container-narrow text-center py-20">
          <p className="text-sm mb-4" style={{ color: 'var(--gray)' }}>
            {isEnded ? '目前暫無結束的活動回顧' : '近期暫無公開活動'}
          </p>
          {isEnded ? (
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs tracking-widest border px-5 py-2 transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--charcoal)' }}
            >
              查看即將到來的活動 <ArrowRight size={11} />
            </Link>
          ) : (
            <Link
              href="/rent"
              className="inline-flex items-center gap-2 text-xs tracking-widest border px-5 py-2 transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--charcoal)' }}
            >
              想在此舉辦活動？申請租借 <ArrowRight size={11} />
            </Link>
          )}
        </div>
      ) : (
        <div className="container-wide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            (() => {
              const registrations = Array.isArray(ev.event_registrations) ? ev.event_registrations as EventRegistration[] : []
              const registeredCount = registrations.filter(r => r.status === 'registered').length
              const remainingSeats = ev.capacity !== null && ev.capacity !== undefined ? ev.capacity - registeredCount : null

              return (
            <Link
              key={ev.id}
              href={`/events/${ev.slug}`}
              className="group bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--gold)] hover:shadow-[0_16px_40px_rgba(26,16,8,0.10)] hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300"
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
                {ev.capacity !== null && ev.capacity !== undefined && (
                  <p
                    className={`text-xs flex items-center gap-1 mb-3 ${remainingSeats !== null && remainingSeats <= 0 ? 'text-red-500' : 'text-[var(--gray)]'}`}
                  >
                    <Users size={11} />
                    {remainingSeats !== null && remainingSeats <= 0
                      ? '名額已滿'
                      : `剩 ${remainingSeats ?? ev.capacity} 名`}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--charcoal)]">
                    {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                  </span>
                  <div className="flex items-center gap-2">
                    {ev.external_url && (
                      <a
                        href={ev.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-[var(--gray)] hover:text-[var(--gold)] flex items-center gap-0.5 transition-colors"
                        title="外部連結"
                      >
                        <ExternalLink size={11} />
                      </a>
                    )}
                    <span className="text-xs text-[var(--gold)] group-hover:gap-2 flex items-center gap-1 transition-all">
                      {isEnded ? CTA.events.review : CTA.events.register} <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
              )
            })()
          ))}
        </div>
      )}
    </div>
  )
}
