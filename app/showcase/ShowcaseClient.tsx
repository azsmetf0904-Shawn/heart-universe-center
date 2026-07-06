'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type Photo = { image_url: string; caption: string | null; sort_order: number }
export type PastEvent = {
  id: string
  title: string
  slug: string
  start_time: string
  organizer_name: string | null
  cover_image_url: string | null
  category: string | null
  event_photos: Photo[]
  venue: { name: string } | null
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all',       label: '全部' },
  { key: 'launch',    label: '品牌發表' },
  { key: 'community', label: '社群聚會' },
  { key: 'workshop',  label: '課程工作坊' },
]

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })
}

function EventArticle({ event, idx }: { event: PastEvent; idx: number }) {
  const allPhotos: { url: string; caption: string | null }[] = []
  if (event.cover_image_url) allPhotos.push({ url: event.cover_image_url, caption: null })
  for (const p of event.event_photos) {
    if (p.image_url !== event.cover_image_url) allPhotos.push({ url: p.image_url, caption: p.caption })
  }

  return (
    <article style={{ borderBottom: '1px solid var(--border-color)', paddingTop: idx === 0 ? 64 : 80, paddingBottom: 80 }}>
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {event.category && (
                <span className="text-[9px] tracking-[0.25em] px-2 py-0.5 border" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                  {{ launch: '品牌發表', community: '社群聚會', workshop: '課程工作坊' }[event.category] ?? event.category}
                </span>
              )}
              <p className="text-[10px] tracking-[0.3em]" style={{ color: 'var(--gray)' }}>
                {formatDate(event.start_time)}
                {event.venue?.name && ` · ${event.venue.name}`}
              </p>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--charcoal)', letterSpacing: '0.05em' }}>
              {event.title}
            </h2>
            {event.organizer_name && (
              <p className="text-xs mt-2 tracking-wider" style={{ color: 'var(--gray)' }}>主辦：{event.organizer_name}</p>
            )}
          </div>
          <Link
            href={`/events/${event.slug}/gallery`}
            className="shrink-0 text-[10px] tracking-[0.25em] pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
          >
            查看完整相簿 →
          </Link>
        </div>

        {allPhotos.length === 0 ? null : allPhotos.length === 1 ? (
          <div className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
            <Image src={allPhotos[0].url} alt={event.title} fill className="object-cover" sizes="100vw" />
          </div>
        ) : allPhotos.length === 2 ? (
          <div className="grid grid-cols-2 gap-2">
            {allPhotos.map((p, i) => (
              <div key={i} className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <Image src={p.url} alt={p.caption ?? event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="50vw" />
              </div>
            ))}
          </div>
        ) : allPhotos.length === 3 ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image src={allPhotos[0].url} alt={event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="60vw" />
            </div>
            <div className="flex flex-col gap-2">
              {allPhotos.slice(1, 3).map((p, i) => (
                <div key={i} className="relative overflow-hidden flex-1">
                  <Image src={p.url} alt={p.caption ?? event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="30vw" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="relative overflow-hidden" style={{ aspectRatio: '21/8' }}>
              <Image src={allPhotos[0].url} alt={event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" priority={idx === 0} sizes="100vw" />
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(allPhotos.length - 1, 4)}, 1fr)` }}>
              {allPhotos.slice(1, 5).map((p, i) => {
                const isLast = i === 3 && allPhotos.length > 5
                return (
                  <div key={i} className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <Image src={p.url} alt={p.caption ?? event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
                    {isLast && (
                      <Link href={`/events/${event.slug}/gallery`} className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(26,16,8,0.65)' }}>
                        <span className="text-white text-xs tracking-widest">+{allPhotos.length - 4} 張</span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export function ShowcaseClient({ events }: { events: PastEvent[] }) {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? events : events.filter(e => e.category === active)

  return (
    <>
      {/* Category filter tabs */}
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: '64px', zIndex: 40 }}>
        <div className="container-wide">
          <div className="flex gap-0 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className="shrink-0 px-6 py-4 text-xs tracking-widest transition-colors border-b-2"
                style={{
                  borderBottomColor: active === cat.key ? 'var(--gold)' : 'transparent',
                  color: active === cat.key ? 'var(--gold)' : 'var(--gray)',
                  background: 'none',
                }}
              >
                {cat.label}
                {cat.key !== 'all' && (
                  <span className="ml-2 text-[10px]" style={{ color: 'var(--border-color)' }}>
                    {events.filter(e => e.category === cat.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events */}
      {filtered.length === 0 ? (
        <div className="py-40 text-center" style={{ background: 'var(--cream)' }}>
          <p className="text-sm" style={{ color: 'var(--gray)' }}>此類別暫無活動紀錄</p>
        </div>
      ) : (
        <div style={{ background: 'var(--cream)' }}>
          {filtered.map((event, idx) => (
            <EventArticle key={event.id} event={event} idx={idx} />
          ))}
        </div>
      )}
    </>
  )
}
