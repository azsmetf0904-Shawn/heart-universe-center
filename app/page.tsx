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

        {/* Left: dark text panel */}
        <div
          className="relative flex flex-col px-10 md:px-16 py-12 md:py-16"
          style={{ background: 'var(--charcoal)', overflow: 'hidden' }}
        >
          {/* Decorative rings */}
          <div className="absolute pointer-events-none" style={{ bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(176,120,80,0.12)' }} />
          <div className="absolute pointer-events-none" style={{ bottom: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(176,120,80,0.1)' }} />

          {/* Logo at top */}
          <div className="flex items-center gap-4 mb-12">
            <Image src="/logo.svg" alt="心宇宙商務中心" width={48} height={48} priority />
            <div style={{ borderLeft: '1px solid rgba(176,120,80,0.3)', paddingLeft: 16 }}>
              <p className="font-serif text-sm leading-tight" style={{ color: 'rgba(244,239,230,0.9)', letterSpacing: '0.08em' }}>心宇宙商務中心</p>
              <p className="text-[9px] mt-0.5 tracking-[0.3em]" style={{ color: 'rgba(176,120,80,0.7)' }}>HEART UNIVERSE · TAIPEI</p>
            </div>
          </div>

          {/* Main content — push to vertical center */}
          <div className="flex-1 flex flex-col justify-center">
            {/* H1 */}
            <h1
              className="font-serif leading-tight mb-5"
              style={{ fontSize: 'clamp(36px, 4.5vw, 62px)', fontWeight: 600, color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2 }}
            >
              台北最適合<br />
              <span style={{ color: 'var(--gold)' }}>質感活動</span><br />
              的場地
            </h1>

            {/* Gold divider */}
            <div style={{ width: 40, height: 1, background: 'var(--gold)', opacity: 0.6, marginBottom: 20 }} />

            <p className="text-sm leading-loose mb-8" style={{ color: 'rgba(244,239,230,0.5)', letterSpacing: '0.08em' }}>
              台北八德路 · 100–150 人<br />
              捷運步行可達 · 高規格設備齊全
            </p>

            {/* Activity tags */}
            <div className="flex flex-wrap gap-2 mb-10">
              {['品牌講座', '女性成長課程', '企業培訓', '工作坊', '身心靈課程', '直播活動'].map(tag => (
                <span key={tag} className="text-[10px] px-3 py-1.5 tracking-wide"
                  style={{ border: '1px solid rgba(176,120,80,0.35)', color: 'rgba(176,120,80,0.85)' }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 mb-12">
              <Link href="/rent" className="btn-gold-fill text-xs tracking-widest px-10 py-3">
                立即申請租借
              </Link>
              <Link href="/venues"
                className="text-xs tracking-widest px-8 py-3 transition-colors"
                style={{ border: '1px solid rgba(244,239,230,0.18)', color: 'rgba(244,239,230,0.55)', display: 'inline-flex', alignItems: 'center' }}>
                查看場地照片
              </Link>
            </div>
          </div>

          {/* Stats row — pinned to bottom */}
          <div className="flex gap-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
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

      {/* ─── Stats ─── */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border-color)]">
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

      {/* ─── Showcase teaser ─── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '80px 0' }}>
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: 'var(--gold)' }}>Showcase</p>
              <h2 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: 'var(--charcoal)', letterSpacing: '0.05em' }}>
                過去的活動回顧
              </h2>
              <p className="text-sm leading-loose" style={{ color: 'var(--gray)', letterSpacing: '0.06em', maxWidth: '420px' }}>
                從企業培訓到社群聚會，每一場在心宇宙舉辦的活動都留下了精彩的畫面。
              </p>
            </div>
            <Link
              href="/showcase"
              className="btn-gold-fill shrink-0 text-xs tracking-widest px-10 py-3"
            >
              查看活動相簿
            </Link>
          </div>
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
