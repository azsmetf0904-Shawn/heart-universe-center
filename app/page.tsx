import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Clock, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const DB = 'var(--dark-bg)'
const DB2 = 'var(--dark-bg2)'
const DB3 = 'var(--dark-bg3)'
const BORDER = 'var(--dark-border)'
const TEXT = 'var(--dark-text)'
const MUTED = 'var(--dark-muted)'
const GOLD = 'var(--gold)'
const GOLD_L = 'var(--gold-light)'

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
      .limit(4),
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
      {/* ─── Hero ─── */}
      <section
        className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center text-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${DB} 0%, ${DB2} 50%, ${DB} 100%)` }}
      >
        {/* 心宇宙 watermark */}
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif pointer-events-none select-none whitespace-nowrap"
          style={{ fontSize: 280, fontWeight: 700, color: `rgba(184,152,64,0.04)`, letterSpacing: '-0.02em' }}
        >心宇宙</span>

        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Large logo — 85vw */}
          <Image
            src="/logo.png"
            alt="心宇宙商務中心"
            width={1200}
            height={1200}
            priority
            style={{ width: '85vw', maxWidth: '1020px', height: 'auto', mixBlendMode: 'screen' }}
          />

          <div
            className="w-20 h-px mb-6"
            style={{ background: GOLD, opacity: 0.4 }}
          />

          <p
            className="text-sm tracking-[0.22em] leading-loose mb-10"
            style={{ color: MUTED }}
          >
            場地租借 · 課程活動 · 活動紀錄
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/rent" className="btn-dark-gold px-10 py-3 text-xs tracking-widest">
              租借申請 <ArrowRight size={13} />
            </Link>
            <Link href="/venues" className="btn-dark-ghost px-10 py-3 text-xs tracking-widest">
              瀏覽場地 <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Venues ─── */}
      <section style={{ background: DB2, paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container-wide">
          <div className="mb-12">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-4" style={{ color: GOLD }}>Venue</p>
            <h2 className="font-serif text-4xl mb-4" style={{ color: TEXT }}>精品場地空間</h2>
            <div className="w-16 h-px mb-5" style={{ background: GOLD, opacity: 0.5 }} />
            <p className="text-sm leading-relaxed max-w-lg" style={{ color: MUTED }}>
              寬敞明亮的多功能空間，提供彈性座位配置，適合課程講座、企業培訓、小型展覽、社群聚會。
            </p>
          </div>

          {venues && venues.length > 0 ? (
            <div className="grid grid-cols-2 gap-px mb-10" style={{ background: BORDER }}>
              {venues.map((v, i) => {
                const photos = v.venue_photos as { image_url: string; sort_order: number }[] | null
                const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                const isLarge = i === 0
                return (
                  <Link
                    key={v.id}
                    href={`/venues/${v.slug}`}
                    className="group relative overflow-hidden"
                    style={{
                      aspectRatio: isLarge ? '21/9' : '16/9',
                      gridColumn: isLarge ? 'span 2' : undefined,
                      background: DB3,
                    }}
                  >
                    {cover ? (
                      <Image
                        src={cover}
                        alt={v.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes={isLarge ? '100vw' : '50vw'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs tracking-widest" style={{ color: MUTED }}>PHOTO</span>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                    >
                      <div>
                        <p className="font-serif text-lg text-white mb-1">{v.name}</p>
                        {v.capacity && <p className="text-xs" style={{ color: GOLD_L }}>{v.capacity} 人</p>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="mb-10 py-16 text-center text-sm" style={{ color: MUTED }}>場地資訊整理中，敬請期待</div>
          )}

          <Link href="/venues" className="inline-flex items-center gap-2 text-xs tracking-widest hover:gap-4 transition-all" style={{ color: GOLD }}>
            查看所有場地 <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section>
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: BORDER }}>
          {[
            { num: '3+', label: '專業場地' },
            { num: '50+', label: '坪數空間' },
            { num: '3', label: '彈性時段' },
            { num: '∞', label: '可能性' },
          ].map(s => (
            <div key={s.label} className="py-10 text-center" style={{ background: DB }}>
              <p className="font-serif text-4xl italic mb-2" style={{ color: GOLD }}>
                {s.num}
              </p>
              <p className="text-[10px] tracking-widest" style={{ color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Events ─── */}
      <section style={{ background: DB3, paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container-wide">
          <div className="mb-12">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-4" style={{ color: GOLD }}>Events</p>
            <h2 className="font-serif text-4xl mb-4" style={{ color: TEXT }}>近期活動課程</h2>
            <div className="w-16 h-px" style={{ background: GOLD, opacity: 0.5 }} />
          </div>

          {events && events.length > 0 ? (
            <div className="flex flex-col mb-10" style={{ borderTop: `1px solid ${BORDER}` }}>
              {events.map(ev => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="event-row grid items-center gap-6 py-5 border-b"
                  style={{
                    gridTemplateColumns: '80px 1fr auto',
                    borderColor: BORDER,
                  }}
                >
                  <div className="text-center pl-4">
                    <p className="font-serif text-2xl italic leading-none" style={{ color: GOLD }}>
                      {new Date(ev.start_time).getDate()}
                    </p>
                    <p className="text-[9px] tracking-widest mt-1" style={{ color: MUTED }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-base mb-1 leading-snug" style={{ color: TEXT }}>{ev.title}</p>
                    <p className="text-[10px] tracking-widest flex items-center gap-1" style={{ color: MUTED }}>
                      <CalendarDays size={10} /> {formatDate(ev.start_time)}
                    </p>
                  </div>
                  <div className="pr-4 text-right">
                    <p className="text-sm mb-1" style={{ color: TEXT }}>
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </p>
                    <span className="text-[10px] tracking-widest flex items-center gap-1 justify-end" style={{ color: GOLD }}>
                      報名 <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mb-10 py-16 text-center text-sm" style={{ color: MUTED }}>近期暫無活動，請持續關注</div>
          )}

          <Link href="/events" className="inline-flex items-center gap-2 text-xs tracking-widest hover:gap-4 transition-all" style={{ color: GOLD }}>
            查看所有活動 <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ─── Location ─── */}
      <section style={{ background: DB2, paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container-wide grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase mb-4" style={{ color: GOLD }}>Location</p>
            <h2 className="font-serif text-3xl mb-4" style={{ color: TEXT }}>交通資訊</h2>
            <div className="w-16 h-px mb-8" style={{ background: GOLD, opacity: 0.5 }} />
            <div className="flex flex-col gap-6 text-sm" style={{ color: MUTED }}>
              <div className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="mb-1" style={{ color: TEXT }}>台北市八德路</p>
                  <p className="leading-relaxed">捷運板南線「忠孝復興站」或「忠孝敦化站」步行可達</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={15} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="mb-3" style={{ color: TEXT }}>使用時段</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '早場', time: '09:00–12:00' },
                      { label: '午場', time: '14:00–17:00' },
                      { label: '晚場', time: '18:30–21:30' },
                    ].map(t => (
                      <div key={t.label} className="border p-3 text-center" style={{ borderColor: BORDER }}>
                        <p className="text-xs mb-1" style={{ color: TEXT }}>{t.label}</p>
                        <p className="text-[9px] tracking-tight">{t.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link href="/rent" className="btn-dark-gold mt-8 px-8 py-3 text-xs tracking-widest">
              立即申請租借 <ArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-hidden border" style={{ borderColor: BORDER }}>
            <iframe
              src="https://maps.google.com/maps?q=台北市八德路&output=embed&z=15"
              width="100%"
              height="360"
              style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="心宇宙商務中心地圖"
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="text-center"
        style={{
          padding: '120px 80px',
          background: `linear-gradient(135deg, ${DB3}, ${DB})`,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <div className="container-narrow">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-6" style={{ color: GOLD }}>Reservation</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6" style={{ color: TEXT }}>預約您的專屬場地</h2>
          <div className="w-20 h-px mx-auto mb-8" style={{ background: GOLD, opacity: 0.5 }} />
          <p className="text-sm tracking-wide leading-loose mb-12 max-w-xs mx-auto" style={{ color: MUTED }}>
            填寫租借申請，我們將於一個工作日內與您確認
          </p>
          <Link href="/rent" className="btn-cta-ghost px-12 py-3 text-xs tracking-widest">
            立即申請 <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </>
  )
}
