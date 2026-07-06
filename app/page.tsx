import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays } from 'lucide-react'
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
      {/* ─── Hero — 左右分割 ─── */}
      <section
        className="grid"
        style={{
          minHeight: 'calc(100vh - 4rem)',
          gridTemplateColumns: '1.1fr 1fr',
        }}
      >
        {/* Left: logo */}
        <div
          className="relative flex items-center justify-center p-12 border-r"
          style={{
            background: 'var(--cream)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 70% at 40% 60%, rgba(184,152,64,0.06) 0%, transparent 65%)',
            }}
          />
          <Image
            src="/logo.svg"
            alt="心宇宙商務中心"
            width={520}
            height={520}
            priority
            style={{ width: '100%', maxWidth: '480px', height: 'auto', position: 'relative', zIndex: 1 }}
          />
        </div>

        {/* Right: text */}
        <div
          className="flex flex-col justify-center px-14 py-16"
          style={{ background: 'var(--surface)' }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px" style={{ background: 'var(--gold)', opacity: 0.5 }} />
            <p className="text-[10px] tracking-[0.45em] uppercase" style={{ color: 'var(--gold)' }}>
              Heart Universe · Taipei
            </p>
          </div>

          {/* Brand name */}
          <h1
            className="font-serif mb-3 leading-snug"
            style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500, color: 'var(--charcoal)', letterSpacing: '0.08em' }}
          >
            心宇宙商務中心
          </h1>

          {/* Tagline */}
          <p
            className="font-serif mb-6"
            style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'var(--gold)', letterSpacing: '0.12em', fontWeight: 400 }}
          >
            台北精品場地空間
          </p>

          {/* Description */}
          <p
            className="text-sm leading-loose mb-7"
            style={{ color: 'var(--gray)', letterSpacing: '0.06em', maxWidth: '360px' }}
          >
            位於台北市八德路，提供企業培訓、<br />
            品牌發表、工作坊及社群聚會<br />
            所需的彈性場地與完善服務。
          </p>

          {/* Service chips */}
          <div className="flex flex-wrap gap-2 mb-9">
            {['場地租借', '課程活動', '工作坊', '企業培訓'].map(s => (
              <span
                key={s}
                className="text-[10px] tracking-widest px-3 py-1 border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex">
            <Link
              href="/venues"
              className="px-10 py-3 text-xs tracking-widest transition-all btn-gold-fill"
            >
              瀏覽場地
            </Link>
            <Link
              href="/rent"
              className="px-8 py-3 text-xs tracking-widest border transition-colors hover:border-[var(--gold)] hover:text-[var(--charcoal)]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--gray)', borderLeft: 'none' }}
            >
              租借申請
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Tagline 2-col ─── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '64px 0' }}>
        <div className="container-wide grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] gap-16 items-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-relaxed" style={{ color: 'var(--charcoal)', letterSpacing: '0.05em' }}>
            適合每一種<br />商務場合的空間
          </h2>
          <div className="hidden md:block self-stretch" style={{ background: 'var(--border-color)' }} />
          <p className="text-sm leading-loose" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>
            無論是企業培訓、品牌發表、社群聚會，<br />
            或一場需要安靜專注的工作坊，<br />
            我們為您的每一個需求提供最合適的場地配置。
          </p>
        </div>
      </section>

      {/* ─── Features 3-col ─── */}
      <section style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
        <div className="container-wide grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">
          {[
            { icon: '📍', title: '台北八德路', desc: '捷運步行可達，交通便利' },
            { icon: '🪑', title: '多元配置', desc: '教室型 · 講座型 · 分組型，彈性佈置' },
            { icon: '🕐', title: '三時段彈性', desc: '早午晚時段分開計費，依需租借' },
          ].map(f => (
            <div key={f.title} className="px-10 py-12 text-center">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-serif text-base mb-2" style={{ color: 'var(--charcoal)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border-color)]">
          {[
            { n: '3', unit: '間', label: '精品場地空間' },
            { n: '80', unit: '人', label: '最大容納人數' },
            { n: '3', unit: '段', label: '靈活時段計費' },
            { n: '1', unit: '日', label: '工作日確認回覆' },
          ].map(s => (
            <div key={s.label} className="text-center py-14 px-6">
              <div className="font-serif text-5xl font-semibold leading-none mb-3" style={{ color: 'var(--gold)', fontStyle: 'italic' }}>
                {s.n}<span className="text-2xl">{s.unit}</span>
              </div>
              <div className="text-[10px] tracking-widest" style={{ color: 'var(--gray)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Venues ─── */}
      <section className="py-24" style={{ background: 'var(--cream)' }}>
        <div className="container-wide">
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
            <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
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
                          <Image src={cover} alt={venues[0].name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="60vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                            <span className="text-xs tracking-widest" style={{ color: 'var(--border-color)' }}>PHOTO</span>
                          </div>
                        )}
                      </div>
                      <div className="px-7 py-6">
                        <h3 className="font-serif text-xl mb-3" style={{ color: 'var(--charcoal)' }}>{venues[0].name}</h3>
                        <div className="flex gap-2 flex-wrap">
                          {venues[0].capacity && <span className="text-[10px] tracking-widest px-3 py-1 border" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>最多 {venues[0].capacity} 人</span>}
                          {venues[0].area_ping && <span className="text-[10px] tracking-widest px-3 py-1 border" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>{venues[0].area_ping} 坪</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })()}
              </div>

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
                            <span className="text-xs tracking-widest" style={{ color: 'var(--border-color)' }}>PHOTO</span>
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

      {/* ─── Events ─── */}
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
                    gridTemplateColumns: '90px 1fr 160px',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.3em] mb-1" style={{ color: 'var(--gold)' }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </p>
                    <p className="font-serif text-5xl font-semibold leading-none" style={{ color: 'var(--charcoal)' }}>
                      {new Date(ev.start_time).getDate()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--charcoal)' }}>{ev.title}</h3>
                    <p className="text-xs leading-relaxed flex items-center gap-1" style={{ color: 'var(--gray)' }}>
                      <CalendarDays size={11} /> {formatDate(ev.start_time)}
                      &nbsp;·&nbsp;
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-6 py-2 text-xs tracking-widest border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>
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

      {/* ─── CTA ─── */}
      <section
        className="text-center"
        style={{ padding: '120px 80px', background: 'var(--charcoal)', position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 400, height: 400, borderRadius: '50%',
            border: '1px solid rgba(184,152,64,0.15)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 260, height: 260, borderRadius: '50%',
            border: '1px solid rgba(184,152,64,0.25)',
            pointerEvents: 'none',
          }}
        />
        <div className="container-narrow" style={{ position: 'relative', zIndex: 1 }}>
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
