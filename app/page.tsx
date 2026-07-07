import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MobileBottomCTA } from '@/components/MobileBottomCTA'
import { MobileAvailabilityStrip } from '@/components/MobileAvailabilityStrip'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: venues }, { data: events }, { data: showcaseEvents }] = await Promise.all([
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
    supabase
      .from('events')
      .select('id, title, slug, start_time, event_photos(image_url, sort_order)')
      .eq('status', 'published')
      .lt('start_time', new Date().toISOString())
      .order('start_time', { ascending: false })
      .limit(6),
  ])

  // Pick first available venue photo as hero background
  type VenuePhoto = { image_url: string; sort_order: number }
  const heroCover = venues
    ?.flatMap(v => {
      const photos = v.venue_photos as VenuePhoto[] | null
      return photos?.sort((a, b) => a.sort_order - b.sort_order) ?? []
    })
    .find(p => p.image_url)?.image_url ?? null

  return (
    <>
      {/* ─── Hero — 方案 B：左文字 + 右照片格 ─── */}
      <section className="grid md:grid-cols-2" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Left: dark text panel — Logo 居中，文字下方 */}
        <div
          className="relative flex flex-col items-center text-center px-8 md:px-14 pt-16 pb-10 md:py-14"
          style={{
            background: 'linear-gradient(160deg, #1C1008 0%, #261608 40%, #2E1C0C 70%, #1A0E06 100%)',
            overflow: 'hidden',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {/* 手機版：固定背景圖（venue-real-6.jpg — 劇院式白椅全景） */}
          <div
            className="absolute inset-0 md:hidden pointer-events-none"
            style={{
              backgroundImage: `url(https://sdxwufrolnbobstfuvtc.supabase.co/storage/v1/object/public/venues-photos/venues/ee0cbe6d-9043-4bce-9459-23a0a63f3d0e/venue-real-6.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.28,
            }}
          />

          {/* Decorative rings */}
          <div className="absolute pointer-events-none" style={{ bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(176,120,80,0.12)' }} />
          <div className="absolute pointer-events-none" style={{ bottom: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(176,120,80,0.1)' }} />

          {/* Logo — 手機 180px，桌機 330px */}
          <Image
            src="/logo.svg?v=2"
            alt="心宇宙商務中心"
            width={330} height={330}
            priority
            className="w-[180px] md:w-[330px] h-auto"
            style={{ objectFit: 'contain', marginBottom: 16, filter: 'drop-shadow(0 0 2px rgba(196,160,56,0.40))' }}
          />

          {/* 品牌名 — 手機桌機都顯示 */}
          <p className="font-serif mb-1" style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', color: 'rgba(244,239,230,0.92)', letterSpacing: '0.18em' }}>
            心宇宙商務中心
          </p>
          {/* HEART UNIVERSE */}
          <p className="text-[10px] tracking-[0.35em] mb-4" style={{ color: 'rgba(196,160,56,0.95)' }}>
            HEART UNIVERSE · TAIPEI
          </p>

          {/* Gold divider — 手機桌機都顯示 */}
          <div style={{ width: 36, height: 1, background: 'var(--gold)', opacity: 0.5, marginBottom: 20 }} />

          {/* Tagline */}
          <h1
            className="font-serif leading-snug mb-4"
            style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', fontWeight: 600, color: '#fff', letterSpacing: '0.06em' }}
          >
            台北最適合<span style={{ color: 'var(--gold)' }}>質感活動</span>的場地
          </h1>

          <p className="text-[11px] leading-loose mb-5" style={{ color: 'rgba(244,239,230,0.75)', letterSpacing: '0.1em' }}>
            台北八德路 · 100–150 人<br />
            捷運步行可達 · 高規格設備齊全
          </p>

          {/* Activity tags — 全部顯示 */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {['品牌講座', '女性成長課程', '企業培訓', '工作坊', '身心靈課程', '直播活動'].map(tag => (
              <span key={tag} className="text-[10px] px-3 py-1.5 tracking-wide"
                style={{ border: '1px solid rgba(196,160,56,0.75)', color: 'rgba(230,200,120,1)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-auto">
            <Link href="/rent" className="btn-gold-fill text-xs tracking-widest px-8 py-3">
              立即申請租借
            </Link>
            <Link href="/venues"
              className="text-xs tracking-widest px-6 py-3 transition-colors"
              style={{ border: '1px solid rgba(244,239,230,0.18)', color: 'rgba(244,239,230,0.55)', display: 'inline-flex', alignItems: 'center' }}>
              查看場地照片
            </Link>
          </div>

          {/* Stats row — pinned to bottom */}
          <div className="flex gap-0 w-full mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}>
            {[
              { n: '150', u: '人', l: '最大容納' },
              { n: '15K', u: '起', l: '平日場租' },
              { n: '3H', u: '', l: '每時段' },
            ].map((s, i) => (
              <div key={s.l} className="flex-1 text-center"
                style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div className="font-serif" style={{ fontSize: 20, fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>
                  {s.n}<span style={{ fontSize: 11, marginLeft: 2 }}>{s.u}</span>
                </div>
                <div className="text-[9px] mt-1.5 tracking-[0.2em]" style={{ color: 'rgba(244,239,230,0.3)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo grid */}
        <div className="hidden md:grid" style={{ gridTemplateRows: '2fr 1fr', gridTemplateColumns: '1fr 1fr' }}>
          {/* Main photo — top, full width */}
          <div className="relative col-span-2 overflow-hidden" style={{ background: 'var(--surface)' }}>
            {heroCover ? (
              <Image src={heroCover} alt="心宇宙商務中心" fill className="object-cover" sizes="50vw" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#d0ccc8' }}>
                <span className="text-xs tracking-widest" style={{ color: 'rgba(44,30,18,0.3)' }}>場地照片</span>
              </div>
            )}
            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-3"
              style={{ background: 'linear-gradient(to top, rgba(26,16,8,0.7), transparent)' }}>
              <p className="text-[10px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.7)', borderLeft: '2px solid var(--gold)', paddingLeft: 10 }}>
                多功能大廳 · 100–150 人
              </p>
            </div>
          </div>

          {/* Sub photo 1 */}
          {(() => {
            const photos = venues?.flatMap(v => (v.venue_photos as VenuePhoto[] | null)?.sort((a,b) => a.sort_order - b.sort_order) ?? [])
            const p1 = photos?.[1]?.image_url
            return (
              <div className="relative overflow-hidden" style={{ background: '#b8b4b0' }}>
                {p1 ? (
                  <Image src={p1} alt="劇院型配置" fill className="object-cover" sizes="25vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>劇院型</span>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Sub photo 2 */}
          {(() => {
            const photos = venues?.flatMap(v => (v.venue_photos as VenuePhoto[] | null)?.sort((a,b) => a.sort_order - b.sort_order) ?? [])
            const p2 = photos?.[2]?.image_url
            return (
              <div className="relative overflow-hidden" style={{ background: '#888480' }}>
                {p2 ? (
                  <Image src={p2} alt="島嶼式配置" fill className="object-cover" sizes="25vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>島嶼式</span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ─── Venue quick strip ─── */}
      {venues && venues.length > 0 && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${venues.length}, 1fr)`,
            background: 'var(--cream)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {venues.map((v, i) => {
            const photos = v.venue_photos as VenuePhoto[] | null
            const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
            return (
              <Link
                key={v.id}
                href={`/venues/${v.slug}`}
                className="event-row flex items-center gap-4 px-8 py-6"
                style={{
                  borderRight: i < venues.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                {cover ? (
                  <div className="relative shrink-0 overflow-hidden" style={{ width: 52, height: 52 }}>
                    <Image src={cover} alt={v.name} fill className="object-cover" sizes="52px" />
                  </div>
                ) : (
                  <div
                    className="shrink-0 flex items-center justify-center text-lg"
                    style={{ width: 52, height: 52, background: 'var(--surface)', border: '1px solid var(--border-color)' }}
                  >
                    🏛
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-sm mb-1" style={{ color: 'var(--charcoal)' }}>{v.name}</h3>
                  <p className="text-[10px] tracking-wider" style={{ color: 'var(--gray)' }}>
                    {[v.capacity && `最多 ${v.capacity} 人`, v.area_ping && `${v.area_ping} 坪`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ─── Features 3-col ─── */}
      <section style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
        <div className="container-wide grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">
          {[
            { icon: '🚇', title: '捷運步行可達', desc: '小巨蛋站 3 號出口 · 國父紀念館站 1 號出口，步行約 10 分鐘' },
            { icon: '🪑', title: '彈性座位配置', desc: '劇院型 150 人 · 島嶼式 120 人，桌椅自由調整' },
            { icon: '🎤', title: '高規格視聽設備', desc: '雷射投影機 · Sure 無線麥克風 × 4 · 專業音響，全包含於場租' },
          ].map(f => (
            <div key={f.title} className="px-10 py-12 text-center">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-serif text-base mb-2" style={{ color: 'var(--charcoal)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Stats — 手機深色三欄、桌機奶油四欄 ─── */}
      {/* 手機版 */}
      <section className="md:hidden" style={{ background: '#1C1008' }}>
        <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.08)]">
          {[
            { n: '150', unit: '人', label: '最大容納' },
            { n: '15K', unit: '起', label: '平日場租' },
            { n: '1', unit: '日', label: '確認回覆' },
          ].map(s => (
            <div key={s.label} className="text-center py-4 px-2">
              <div className="font-serif text-xl font-bold leading-none mb-1" style={{ color: '#C4A038', fontStyle: 'italic' }}>
                {s.n}<span className="text-xs ml-0.5">{s.unit}</span>
              </div>
              <div className="text-[8px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      {/* 桌機版 */}
      <section className="hidden md:block" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide grid grid-cols-4 divide-x divide-[var(--border-color)]">
          {[
            { n: '150', unit: '人', label: '最大容納人數' },
            { n: '15K', unit: '起', label: '平日場租 / 3 小時' },
            { n: '10', unit: '分', label: '捷運步行可達' },
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

      {/* ─── 手機版：7天可用時段快速條 ─── */}
      {venues && venues.length > 0 && <MobileAvailabilityStrip venueId={venues[0].id} />}

      {/* ─── Venue + Showcase（左右分欄）─── */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">

          {/* ── 左：精品場地空間 ── */}
          <div className="px-5 md:px-14 py-10 md:py-16">
            <div className="flex items-end justify-between mb-6 md:mb-10">
              <div>
                <p className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Venue</p>
                <h2 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--charcoal)' }}>精品場地空間</h2>
              </div>
              <Link
                href="/venues"
                className="flex items-center gap-2 text-xs tracking-widest pb-1 border-b shrink-0 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
              >
                查看全部 <ArrowRight size={12} />
              </Link>
            </div>

            {venues && venues.length > 0 ? (() => {
              type VenuePhoto = { image_url: string; sort_order: number }
              const v = venues[0]
              const photos = v.venue_photos as VenuePhoto[] | null
              const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
              const extra = photos?.sort((a, b) => a.sort_order - b.sort_order).slice(1, 3) ?? []
              return (
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/venues/${v.slug}`}
                    className="group block overflow-hidden border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors"
                    style={{ background: 'var(--card-bg)' }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {cover ? (
                        <Image src={cover} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                          <span className="text-xs tracking-widest" style={{ color: 'var(--border-color)' }}>PHOTO</span>
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--charcoal)' }}>{v.name}</h3>
                        <div className="flex gap-2 flex-wrap">
                          {v.capacity && <span className="text-[10px] tracking-widest px-3 py-1 border" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>最多 {v.capacity} 人</span>}
                          {v.area_ping && <span className="text-[10px] tracking-widest px-3 py-1 border" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>{v.area_ping} 坪</span>}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    </div>
                  </Link>
                  {extra.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {extra.map((p, i) => (
                        <Link key={i} href={`/venues/${v.slug}`} className="group relative overflow-hidden block" style={{ aspectRatio: '4/3' }}>
                          <Image src={p.image_url} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })() : (
              <div className="py-16 text-center text-sm" style={{ color: 'var(--gray)' }}>場地資訊整理中，敬請期待</div>
            )}
          </div>

          {/* ── 右：過去的活動回顧 ── */}
          <div className="px-5 md:px-14 py-10 md:py-16">
            <div className="flex items-end justify-between mb-6 md:mb-10">
              <div>
                <p className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Showcase</p>
                <h2 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--charcoal)' }}>過去的活動回顧</h2>
              </div>
              <Link
                href="/showcase"
                className="flex items-center gap-2 text-xs tracking-widest pb-1 border-b shrink-0 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
              >
                查看相簿 <ArrowRight size={12} />
              </Link>
            </div>

            {showcaseEvents && showcaseEvents.length > 0 ? (() => {
              type EventPhoto = { image_url: string; sort_order: number }
              return (
                <div className="flex flex-col gap-3">
                  {/* Featured first event */}
                  {(() => {
                    const ev = showcaseEvents[0]
                    const photos = ev.event_photos as EventPhoto[] | null
                    const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                    return (
                      <Link href="/showcase" className="group relative block overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        {cover ? (
                          <Image src={cover} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                        ) : (
                          <div className="w-full h-full" style={{ background: 'var(--surface)' }} />
                        )}
                        <div className="absolute inset-0 flex flex-col justify-end p-5" style={{ background: 'linear-gradient(to top, rgba(26,16,8,0.75) 0%, transparent 55%)' }}>
                          <p className="text-[9px] tracking-[0.3em] mb-1" style={{ color: 'rgba(196,160,56,0.9)' }}>
                            {new Date(ev.start_time).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="font-serif text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>{ev.title}</p>
                        </div>
                      </Link>
                    )
                  })()}
                  {/* Remaining events as 2-col grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {showcaseEvents.slice(1).map(ev => {
                      const photos = ev.event_photos as EventPhoto[] | null
                      const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                      return (
                        <Link key={ev.id} href="/showcase" className="group relative block overflow-hidden" style={{ aspectRatio: '4/3' }}>
                          {cover ? (
                            <Image src={cover} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="25vw" />
                          ) : (
                            <div className="w-full h-full" style={{ background: 'var(--surface)' }} />
                          )}
                          <div className="absolute inset-0 flex flex-col justify-end p-3" style={{ background: 'linear-gradient(to top, rgba(26,16,8,0.7) 0%, transparent 55%)' }}>
                            <p className="font-serif text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>{ev.title}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })() : null}
          </div>

        </div>
      </section>

      {/* ─── Events ─── */}
      <section className="py-10 md:py-20" style={{ background: 'var(--card-bg)' }}>
        <div className="px-5 md:container-wide">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: 'var(--gold)' }}>Events</p>
              <h2 className="font-serif text-2xl md:text-4xl" style={{ color: 'var(--charcoal)' }}>近期活動課程</h2>
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
                  className="event-row flex md:grid items-center gap-4 md:gap-8 py-5 md:py-8 border-b"
                  style={{
                    gridTemplateColumns: '90px 1fr 160px',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Date box */}
                  <div className="text-center shrink-0" style={{ minWidth: 52 }}>
                    <p className="text-[9px] tracking-[0.3em] mb-0.5" style={{ color: 'var(--gold)' }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </p>
                    <p className="font-serif font-semibold leading-none" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--charcoal)' }}>
                      {new Date(ev.start_time).getDate()}
                    </p>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif mb-1 truncate" style={{ fontSize: 'clamp(14px, 2vw, 20px)', color: 'var(--charcoal)' }}>{ev.title}</h3>
                    <p className="text-[11px] leading-relaxed flex items-center gap-1" style={{ color: 'var(--gray)' }}>
                      <CalendarDays size={10} /> {formatDate(ev.start_time)}
                      &nbsp;·&nbsp;
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </p>
                  </div>
                  {/* Button — desktop only */}
                  <div className="hidden md:block text-right shrink-0">
                    <span className="inline-block px-6 py-2 text-xs tracking-widest border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}>
                      {ev.is_paid ? '立即報名' : '免費報名'}
                    </span>
                  </div>
                  {/* Mobile arrow */}
                  <ArrowRight size={14} className="md:hidden shrink-0" style={{ color: 'var(--gold)' }} />
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
        className="text-center hidden md:block"
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
      {/* ─── 手機版：底部固定 CTA 佔位（避免被遮住）─── */}
      <div className="md:hidden" style={{ height: 56 }} />

      {/* ─── 手機底部固定 CTA ─── */}
      <MobileBottomCTA />
    </>
  )
}
