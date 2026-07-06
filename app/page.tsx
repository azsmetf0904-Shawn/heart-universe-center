import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: venues }, { data: events }] = await Promise.all([
    supabase
      .from('venues')
      .select('id, name, slug, capacity, area_ping, venue_photos(image_url, sort_order)')
      .eq('is_active', true)
      .order('created_at')
      .limit(3),
    supabase
      .from('events')
      .select('id, title, slug, start_time, is_paid, price, cover_image_url, capacity')
      .eq('status', 'published')
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(3),
  ])

  return (
    <>
      {/* ─── Hero (dark for logo) ─── */}
      <section
        className="relative flex items-center justify-center text-center overflow-hidden"
        style={{
          minHeight: 'calc(100vh - 4rem)',
          background: 'linear-gradient(160deg, #0D0A05 0%, #1A1108 50%, #0D0A05 100%)',
        }}
      >
        {/* Radial glow — Design C spirit in dark version */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 100%, rgba(184,152,64,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 80% 0%, rgba(184,152,64,0.06) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Season line — Design C signature */}
          <div className="flex items-center gap-5 mb-4">
            <div className="w-10 h-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
            <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--gold)' }}>
              Heart Universe · Taipei
            </p>
            <div className="w-10 h-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
          </div>

          {/* 85vw Logo */}
          <Image
            src="/logo.png"
            alt="心宇宙商務中心"
            width={1200}
            height={1200}
            priority
            style={{ width: '85vw', maxWidth: '1020px', height: 'auto', mixBlendMode: 'screen' }}
          />

          {/* Vertical line — Design C signature */}
          <div className="w-px h-14 my-2" style={{ background: 'var(--gold)', opacity: 0.4 }} />

          <p className="text-sm tracking-[0.22em] leading-loose mb-8" style={{ color: 'var(--dark-muted)' }}>
            台北八德路精品場地空間
          </p>

          {/* Adjacent CTAs — Design C signature */}
          <div className="flex">
            <Link
              href="/rent"
              className="px-12 py-3 text-xs tracking-widest transition-all btn-dark-gold"
            >
              租借申請
            </Link>
            <Link
              href="/venues"
              className="px-12 py-3 text-xs tracking-widest border transition-colors"
              style={{ borderColor: 'var(--dark-border)', color: 'var(--dark-muted)' }}
            >
              瀏覽場地
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features — Design C 3-col bordered ─── */}
      <section style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">
          {[
            { icon: '📍', title: '台北八德路', desc: '捷運步行可達，交通便利' },
            { icon: '🪑', title: '多元配置', desc: '教室型 · 講座型 · 分組型，彈性佈置' },
            { icon: '🕐', title: '三時段彈性', desc: '早午晚時段分開計費，依需租借' },
          ].map(f => (
            <div key={f.title} className="px-10 py-12 text-center" style={{ background: 'var(--cream)' }}>
              <div className="text-2xl mb-4" style={{ color: 'var(--gold)' }}>{f.icon}</div>
              <h3 className="font-serif text-base mb-2" style={{ color: 'var(--charcoal)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Venues — Design C masonry ─── */}
      <section className="py-24" style={{ background: 'var(--cream)' }}>
        <div className="container-wide">
          {/* Section header with see-all link */}
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Venue</p>
              <h2 className="font-serif text-4xl" style={{ color: 'var(--charcoal)' }}>精品場地空間</h2>
            </div>
            <Link
              href="/venues"
              className="flex items-center gap-2 text-xs tracking-widest pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
            >
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>

          {venues && venues.length > 0 ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
              {/* Left col: large card */}
              <div>
                {venues[0] && (() => {
                  const photos = venues[0].venue_photos as { image_url: string; sort_order: number }[] | null
                  const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                  return (
                    <Link
                      href={`/venues/${venues[0].slug}`}
                      className="group block overflow-hidden border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors"
                      style={{ background: 'var(--card-bg)' }}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        {cover ? (
                          <Image src={cover} alt={venues[0].name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="66vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs tracking-widest" style={{ color: 'var(--gray)' }}>PHOTO</span>
                          </div>
                        )}
                      </div>
                      <div className="px-7 py-6">
                        <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--charcoal)' }}>{venues[0].name}</h3>
                        <div className="flex gap-2 flex-wrap mt-3">
                          {venues[0].capacity && <span className="text-[10px] tracking-widest px-3 py-1 border" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>最多 {venues[0].capacity} 人</span>}
                          {venues[0].area_ping && <span className="text-[10px] tracking-widest px-3 py-1 border" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>{venues[0].area_ping} 坪</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })()}
              </div>

              {/* Right col: stacked cards */}
              <div className="flex flex-col gap-4">
                {venues.slice(1).map(v => {
                  const photos = v.venue_photos as { image_url: string; sort_order: number }[] | null
                  const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                  return (
                    <Link
                      key={v.id}
                      href={`/venues/${v.slug}`}
                      className="group block overflow-hidden border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex-1"
                      style={{ background: 'var(--card-bg)' }}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        {cover ? (
                          <Image src={cover} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="33vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                            <span className="text-xs tracking-widest" style={{ color: 'var(--gray)' }}>PHOTO</span>
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-4">
                        <h3 className="font-serif text-base" style={{ color: 'var(--charcoal)' }}>{v.name}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-sm" style={{ color: 'var(--gray)' }}>場地資訊整理中，敬請期待</div>
          )}
        </div>
      </section>

      {/* ─── Events — Design C row layout ─── */}
      <section className="py-20" style={{ background: 'var(--card-bg)' }}>
        <div className="container-wide">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Events</p>
              <h2 className="font-serif text-4xl" style={{ color: 'var(--charcoal)' }}>近期活動課程</h2>
            </div>
            <Link
              href="/events"
              className="flex items-center gap-2 text-xs tracking-widest pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
            >
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              {events.map(ev => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="event-row grid items-center gap-8 py-8 border-b"
                  style={{
                    gridTemplateColumns: '100px 1fr 160px',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Date block */}
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.3em] mb-1" style={{ color: 'var(--gold)' }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </p>
                    <p className="font-serif text-5xl font-semibold leading-none" style={{ color: 'var(--charcoal)' }}>
                      {new Date(ev.start_time).getDate()}
                    </p>
                  </div>

                  {/* Title + meta */}
                  <div>
                    <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--charcoal)' }}>{ev.title}</h3>
                    <p className="text-xs leading-relaxed flex items-center gap-1" style={{ color: 'var(--gray)' }}>
                      <CalendarDays size={11} /> {formatDate(ev.start_time)}
                      &nbsp;·&nbsp;
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="text-right">
                    <span
                      className="inline-block px-6 py-2 text-xs tracking-widest border transition-colors"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}
                    >
                      {ev.is_paid ? '立即報名' : '免費報名'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm" style={{ color: 'var(--gray)' }}>近期暫無活動，請持續關注</div>
          )}
        </div>
      </section>

      {/* ─── CTA — Design C concentric circle ─── */}
      <section
        className="text-center"
        style={{ padding: '120px 80px', background: 'var(--charcoal)' }}
      >
        <div className="container-narrow">
          {/* Concentric circles — Design C signature */}
          <div
            className="flex items-center justify-center mx-auto mb-12"
            style={{
              width: 160, height: 160, borderRadius: '50%',
              border: '1px solid rgba(184,152,64,0.3)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute', inset: 12, borderRadius: '50%',
                border: '1px solid rgba(184,152,64,0.5)',
              }}
            />
            <p className="text-[10px] tracking-[0.22em]" style={{ color: 'var(--gold)' }}>預　約</p>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl mb-5" style={{ color: 'var(--cream)', letterSpacing: '0.08em' }}>
            預約您的專屬場地
          </h2>
          <p className="text-sm tracking-widest mb-12" style={{ color: 'rgba(244,239,230,0.45)', letterSpacing: '0.15em' }}>
            填寫租借申請，我們將於一個工作日內與您確認
          </p>
          <Link
            href="/rent"
            className="btn-cta-ghost inline-flex items-center gap-2 px-16 py-3 text-xs tracking-widest"
          >
            立即申請 <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </>
  )
}
