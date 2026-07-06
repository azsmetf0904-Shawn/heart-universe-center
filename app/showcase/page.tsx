import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '活動回顧 | 心宇宙商務中心',
  description: '過去在心宇宙舉辦的活動精彩回顧，企業培訓、工作坊、品牌發表、社群聚會一覽。',
}

type Photo = { image_url: string; caption: string | null; sort_order: number }
type PastEvent = {
  id: string
  title: string
  slug: string
  start_time: string
  organizer_name: string | null
  cover_image_url: string | null
  event_photos: Photo[]
  venue: { name: string } | null
}

export default async function ShowcasePage() {
  const supabase = await createClient()

  const { data: rawEvents } = await supabase
    .from('events')
    .select('id, title, slug, start_time, organizer_name, cover_image_url, event_photos(image_url, caption, sort_order), venue:venues(name)')
    .eq('status', 'published')
    .lt('start_time', new Date().toISOString())
    .order('start_time', { ascending: false })

  const events: PastEvent[] = (rawEvents ?? []).map((e: any) => ({
    ...e,
    event_photos: (e.event_photos ?? []).sort((a: Photo, b: Photo) => a.sort_order - b.sort_order),
    venue: Array.isArray(e.venue) ? e.venue[0] ?? null : e.venue ?? null,
  }))

  // Only show events that have a cover or at least one photo
  const eventsWithMedia = events.filter(e => e.cover_image_url || e.event_photos.length > 0)

  function formatDate(s: string) {
    return new Date(s).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  }

  return (
    <>
      {/* Page header */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)', padding: '80px 0 56px' }}>
        <div className="container-narrow">
          <p className="label-tag mb-4">Showcase</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: 'var(--charcoal)', letterSpacing: '0.05em' }}>
            活動回顧
          </h1>
          <div className="gold-divider" />
          <p className="text-sm leading-loose mt-6" style={{ color: 'var(--gray)', letterSpacing: '0.06em' }}>
            心宇宙曾舉辦的精彩活動紀錄，每一場都有它獨特的故事。
          </p>
        </div>
      </section>

      {eventsWithMedia.length === 0 ? (
        <section className="py-40 text-center" style={{ background: 'var(--cream)' }}>
          <p className="text-sm" style={{ color: 'var(--gray)' }}>活動回顧整理中，敬請期待</p>
        </section>
      ) : (
        <div style={{ background: 'var(--cream)' }}>
          {eventsWithMedia.map((event, idx) => {
            const allPhotos: { url: string; caption: string | null }[] = []
            if (event.cover_image_url) {
              allPhotos.push({ url: event.cover_image_url, caption: null })
            }
            for (const p of event.event_photos) {
              if (p.image_url !== event.cover_image_url) {
                allPhotos.push({ url: p.image_url, caption: p.caption })
              }
            }

            return (
              <article
                key={event.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  paddingTop: idx === 0 ? 64 : 80,
                  paddingBottom: 80,
                }}
              >
                <div className="container-wide">
                  {/* Event meta header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                      <p className="text-[10px] tracking-[0.4em] mb-2" style={{ color: 'var(--gold)' }}>
                        {formatDate(event.start_time)}
                        {event.venue?.name && <span style={{ color: 'var(--gray)' }}> · {event.venue.name}</span>}
                      </p>
                      <h2 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--charcoal)', letterSpacing: '0.05em' }}>
                        {event.title}
                      </h2>
                      {event.organizer_name && (
                        <p className="text-xs mt-2 tracking-wider" style={{ color: 'var(--gray)' }}>
                          主辦：{event.organizer_name}
                        </p>
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

                  {/* Photo layout */}
                  {allPhotos.length === 0 ? null : allPhotos.length === 1 ? (
                    /* Single photo — wide */
                    <div className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
                      <Image
                        src={allPhotos[0].url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 90vw"
                      />
                    </div>
                  ) : allPhotos.length === 2 ? (
                    /* 2 photos — 50/50 */
                    <div className="grid grid-cols-2 gap-2">
                      {allPhotos.slice(0, 2).map((p, i) => (
                        <div key={i} className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                          <Image src={p.url} alt={p.caption ?? event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="50vw" />
                        </div>
                      ))}
                    </div>
                  ) : allPhotos.length === 3 ? (
                    /* 3 photos — 1 large left + 2 right */
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
                    /* 4+ photos — hero + mosaic below */
                    <div className="flex flex-col gap-2">
                      {/* Hero */}
                      <div className="relative overflow-hidden" style={{ aspectRatio: '21/8' }}>
                        <Image src={allPhotos[0].url} alt={event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" priority={idx === 0} sizes="100vw" />
                      </div>
                      {/* Mosaic strip */}
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(allPhotos.length - 1, 4)}, 1fr)` }}>
                        {allPhotos.slice(1, 5).map((p, i) => {
                          const isLast = i === 3 && allPhotos.length > 5
                          return (
                            <div key={i} className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                              <Image src={p.url} alt={p.caption ?? event.title} fill className="object-cover hover:scale-105 transition-transform duration-700" sizes="25vw" />
                              {isLast && (
                                <Link
                                  href={`/events/${event.slug}/gallery`}
                                  className="absolute inset-0 flex items-center justify-center"
                                  style={{ background: 'rgba(26,16,8,0.65)' }}
                                >
                                  <span className="text-white text-xs tracking-widest">
                                    +{allPhotos.length - 4} 張
                                  </span>
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
          })}
        </div>
      )}

      {/* CTA */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-color)', padding: '64px 0' }}>
        <div className="container-narrow text-center">
          <p className="font-serif text-2xl mb-3" style={{ color: 'var(--charcoal)' }}>想在這裡舉辦您的活動？</p>
          <p className="text-sm mb-8" style={{ color: 'var(--gray)', letterSpacing: '0.06em' }}>填寫租借申請，一個工作日內確認</p>
          <Link
            href="/rent"
            className="btn-gold-fill text-xs tracking-widest px-12 py-3"
          >
            立即申請
          </Link>
        </div>
      </section>
    </>
  )
}
