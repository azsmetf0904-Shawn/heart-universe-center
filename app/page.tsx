import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CTA } from '@/lib/cta'
import { MobileBottomCTA } from '@/components/MobileBottomCTA'
import { MobileAvailabilityStrip } from '@/components/MobileAvailabilityStrip'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default async function HomePage() {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  const [{ data: venues }, { data: events }, { data: showcaseEvents }, { data: endedPastEvents }, { data: publishedPastEvents }] = await Promise.all([
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
    supabase
      .from('events')
      .select('id, title, slug, start_time, organizer_name, cover_image_url')
      .eq('status', 'ended')
      .not('cover_image_url', 'is', null)
      .order('start_time', { ascending: false })
      .limit(3),
    supabase
      .from('events')
      .select('id, title, slug, start_time, organizer_name, cover_image_url')
      .eq('status', 'published')
      .lt('start_time', nowIso)
      .not('cover_image_url', 'is', null)
      .order('start_time', { ascending: false })
      .limit(3),
  ])

  const endedIds = new Set((endedPastEvents ?? []).map(ev => ev.id))
  const pastEvents = [
    ...(endedPastEvents ?? []),
    ...((publishedPastEvents ?? []).filter(ev => !endedIds.has(ev.id))),
  ].slice(0, 3)

  type VenuePhoto = { image_url: string; sort_order: number }

  return (
    <>
      {/* ─── Hero — 方案 B：左文字 + 右照片格 ─── */}
      <section className="grid md:grid-cols-2" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Left: dark text panel — Logo 居中，文字下方 */}
        <div
          className="relative flex flex-col items-center text-center px-8 md:px-14 pt-16 pb-10 md:pt-40 md:pb-4"
          style={{
            background: '#1C1008',
            overflow: 'hidden',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {/* 桌機版：實景照片搭配半透明品牌色遮罩 */}
          <div className="absolute inset-0 hidden md:block pointer-events-none">
            <Image
              src="/home-hero/venue-background.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="50vw"
              style={{ objectPosition: 'center center' }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(155deg, rgba(24, 12, 5, 0.80) 0%, rgba(38, 21, 9, 0.73) 48%, rgba(25, 13, 6, 0.84) 100%)',
                boxShadow: 'inset -1px 0 rgba(196, 160, 56, 0.14)',
              }}
            />
          </div>

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
            src="/logo-new.png"
            alt="心宇宙商務中心"
            width={330} height={330}
            priority
            className="relative z-10 w-[180px] md:w-[330px] h-auto"
            style={{ objectFit: 'contain', marginBottom: 16, filter: 'drop-shadow(0 0 2px rgba(196,160,56,0.40))', opacity: 0.82 }}
          />

          {/* 品牌名 — 手機桌機都顯示 */}
          <p className="relative z-10 font-serif mb-1" style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', color: 'rgba(244,239,230,0.92)', letterSpacing: '0.18em' }}>
            心宇宙商務中心
          </p>
          {/* HEART UNIVERSE */}
          <p className="relative z-10 text-[10px] tracking-[0.35em] mb-4" style={{ color: 'rgba(196,160,56,0.95)' }}>
            HEART UNIVERSE · TAIPEI
          </p>

          {/* Gold divider — 手機桌機都顯示 */}
          <div className="relative z-10" style={{ width: 36, height: 1, background: 'var(--gold)', opacity: 0.5, marginBottom: 20 }} />

          {/* Tagline */}
          <h1
            className="relative z-10 font-serif leading-snug mb-4"
            style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', fontWeight: 600, color: '#fff', letterSpacing: '0.06em' }}
          >
            台北最適合<span style={{ color: 'var(--gold)' }}>質感活動</span>的場地
          </h1>

          <p className="relative z-10 text-[11px] leading-loose mb-5" style={{ color: 'rgba(244,239,230,0.75)', letterSpacing: '0.1em' }}>
            台北八德路 · 100–150 人<br />
            捷運步行可達 · 高規格設備齊全
          </p>

          {/* Activity tags — 全部顯示 */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {['品牌講座', '女性成長課程', '企業培訓', '工作坊', '身心靈課程', '直播活動'].map(tag => (
              <span key={tag} className="text-[10px] px-3 py-1.5 tracking-wide"
                style={{ border: '1px solid rgba(196,160,56,0.75)', color: 'rgba(230,200,120,1)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="relative z-10 hidden md:flex gap-3 mb-auto">
            <Link href="/rent" className="btn-gold-fill text-xs tracking-widest px-8 py-3">
              {CTA.home.startRental}
            </Link>
            <Link href="/venues"
              className="text-xs tracking-widest px-6 py-3 transition-colors"
              style={{ border: '1px solid rgba(244,239,230,0.18)', color: 'rgba(244,239,230,0.55)', display: 'inline-flex', alignItems: 'center' }}>
              {CTA.home.viewVenuePhotos}
            </Link>
          </div>

          {/* Stats row — pinned to bottom */}
          <div className="relative z-10 flex gap-0 w-full mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}>
            {[
              { n: '100–150', u: '人', l: '最大容納' },
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
        <div
          className="hidden md:grid"
          style={{
            gridTemplateRows: '2fr 1fr',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          <div className="relative col-span-3 overflow-hidden" style={{ background: 'var(--surface)' }}>
            <Image
              src="/home-hero/event-family-day-1.jpg"
              alt="心宇宙商務中心親子日活動現場"
              fill
              className="object-cover"
              sizes="50vw"
              priority
              style={{ objectPosition: 'center center' }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-3"
              style={{ background: 'linear-gradient(to top, rgba(26,16,8,0.72), transparent)' }}
            >
              <p className="text-[10px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.78)', borderLeft: '2px solid var(--gold)', paddingLeft: 10 }}>
                親子日活動實景 · 多功能大廳
              </p>
            </div>
          </div>

          {[
            { src: '/home-hero/event-family-day-2.jpg', alt: '親子日活動舞台與觀眾' },
            { src: '/home-hero/event-family-day-3.jpg', alt: '親子日活動互動現場' },
            { src: '/home-hero/event-family-day-4.jpg', alt: '心宇宙活動講者分享現場' },
          ].map(photo => (
            <div key={photo.src} className="relative overflow-hidden" style={{ background: '#b8b4b0' }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="17vw"
                style={{ objectPosition: 'center center' }}
              />
            </div>
          ))}
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
        <div className="container-wide py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '🚇', title: '捷運步行可達', desc: '小巨蛋站 3 號出口 · 國父紀念館站 1 號出口，步行約 10 分鐘' },
              { icon: '🪑', title: '彈性座位配置', desc: '劇院型 · 島嶼式 100–150 人，桌椅自由調整' },
              { icon: '🎤', title: '高規格視聽設備', desc: '雷射投影機 · Sure 無線麥克風 × 4 · 專業音響，全包含於場租' },
            ].map(f => (
              <div
                key={f.title}
                className="rounded-3xl border border-[var(--border-color)] bg-[var(--cream)] px-8 py-10 md:px-10 md:py-12 text-center shadow-[0_10px_28px_rgba(26,16,8,0.04)]"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(196,160,56,0.12)', color: 'var(--gold)' }}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-serif text-lg mb-3" style={{ color: 'var(--charcoal)' }}>{f.title}</h3>
                <div className="mx-auto mb-4 h-px w-10" style={{ background: 'var(--gold)', opacity: 0.45 }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats — 手機深色三欄、桌機奶油四欄 ─── */}
      {/* 手機版 */}
      <section className="md:hidden" style={{ background: '#1C1008' }}>
        <div className="container-wide py-4">
          <div className="grid grid-cols-3 gap-3">
          {[
            { n: '100–150', unit: '人', label: '最大容納' },
            { n: '15K', unit: '起', label: '平日場租' },
            { n: '1', unit: '日', label: '確認回覆' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-center py-4 px-2">
              <div className="font-serif text-xl font-bold leading-none mb-1" style={{ color: '#C4A038', fontStyle: 'italic' }}>
                {s.n}<span className="text-xs ml-0.5">{s.unit}</span>
              </div>
              <div className="text-[8px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
          </div>
        </div>
      </section>
      {/* 桌機版 */}
      <section className="hidden md:block" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide py-8 grid grid-cols-4 gap-4">
          {[
            { n: '100–150', unit: '人', label: '最大容納人數' },
            { n: '15K', unit: '起', label: '平日場租 / 3 小時' },
            { n: '10', unit: '分', label: '捷運步行可達' },
            { n: '1', unit: '日', label: '工作日確認回覆' },
          ].map(s => (
            <div key={s.label} className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] text-center py-14 px-6 shadow-[0_8px_24px_rgba(26,16,8,0.04)]">
              <div className="font-serif text-5xl font-semibold leading-none mb-3" style={{ color: 'var(--gold)', fontStyle: 'italic' }}>
                {s.n}<span className="text-2xl">{s.unit}</span>
              </div>
              <div className="text-[10px] tracking-widest" style={{ color: 'var(--gray)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Past Events ─── */}
      {pastEvents && pastEvents.length > 0 && (
        <section className="py-16 md:py-24" style={{ background: 'var(--card-bg)' }}>
          <div className="container-wide">
            <div className="flex items-end justify-between gap-6 mb-8 md:mb-12">
              <div>
                <p className="label-tag mb-3">Past Events</p>
                <h2 className="font-serif text-2xl md:text-4xl" style={{ color: 'var(--charcoal)' }}>過往精選</h2>
                <div className="gold-divider mt-4" />
                <p className="mt-4 text-sm leading-relaxed max-w-xl" style={{ color: 'var(--gray)' }}>
                  從近期結束的活動中，挑選最值得回看的片段，讓場地的使用情境更直接。
                </p>
              </div>
              <Link
                href="/events"
                className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
              >
                {CTA.home.viewAllEvents} <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:hidden">
                {pastEvents.slice(0, 1).map(ev => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    className="group block border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors overflow-hidden rounded-3xl shadow-[0_12px_28px_rgba(26,16,8,0.08)]"
                    style={{ background: 'var(--card-bg)' }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
                      <Image
                        src={ev.cover_image_url!}
                        alt={ev.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,16,8,0.78)] via-[rgba(26,16,8,0.18)] to-transparent" />
                      <div className="absolute left-5 top-5 inline-flex items-center rounded-full px-3 py-1 text-[10px] tracking-[0.3em]" style={{ background: 'rgba(244,239,230,0.88)', color: 'var(--charcoal)' }}>
                        回顧精選
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-[8px] tracking-[0.35em] mb-2" style={{ color: 'rgba(255,255,255,0.72)' }}>
                          Past Events
                        </p>
                        <h3 className="font-serif text-[1.12rem] leading-tight mb-2" style={{ color: '#fff' }}>
                          {ev.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[9px] flex-wrap" style={{ color: 'rgba(255,255,255,0.72)' }}>
                          <span>{new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}</span>
                          <span>·</span>
                          <span>{ev.organizer_name || '心宇宙商務中心'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="hidden md:contents">
                {pastEvents.map(ev => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    className="group block border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors overflow-hidden rounded-2xl"
                    style={{ background: 'var(--card-bg)' }}
                >
                  <div className="relative aspect-video overflow-hidden bg-[var(--surface)]">
                    <Image
                      src={ev.cover_image_url!}
                      alt={ev.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,16,8,0.25)] via-transparent to-transparent" />
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="text-[10px] tracking-[0.3em] mb-2" style={{ color: 'var(--gold)' }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h3 className="font-serif text-lg md:text-xl mb-3 leading-snug" style={{ color: 'var(--charcoal)' }}>
                      {ev.title}
                    </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
                        主辦：{ev.organizer_name || '心宇宙商務中心'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 md:hidden">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-xs tracking-widest pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}
              >
                {CTA.home.viewAllEvents} <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 手機版：7天可用時段快速條 ─── */}
      {venues && venues.length > 0 && <MobileAvailabilityStrip venueId={venues[0].id} />}

      {/* ─── Venue + Showcase（左右分欄）─── */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide grid md:grid-cols-2 gap-6 md:gap-8 py-6 md:py-10">

          {/* ── 左：精品場地空間 ── */}
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-5 md:px-10 py-10 md:py-12 shadow-[0_10px_28px_rgba(26,16,8,0.04)]">
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
                {CTA.home.viewAll} <ArrowRight size={12} />
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
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-5 md:px-10 py-10 md:py-12 shadow-[0_10px_28px_rgba(26,16,8,0.04)]">
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
                {CTA.home.viewAlbum} <ArrowRight size={12} />
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
        <div className="container-wide">
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
              {CTA.home.viewAll} <ArrowRight size={12} />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid gap-4 md:gap-5">
              {events.map(ev => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="group grid grid-cols-[76px_1fr_auto] md:grid-cols-[120px_1fr_auto] items-center gap-4 md:gap-8 rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-4 md:px-6 md:py-5 shadow-[0_8px_24px_rgba(26,16,8,0.04)] transition-colors hover:border-[var(--gold)]"
                >
                  {/* Date box */}
                  <div className="text-center shrink-0 rounded-2xl bg-[var(--surface)] px-2 py-3 md:px-3 md:py-4">
                    <p className="text-[9px] tracking-[0.3em] mb-0.5" style={{ color: 'var(--gold)' }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </p>
                    <p className="font-serif font-semibold leading-none" style={{ fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--charcoal)' }}>
                      {new Date(ev.start_time).getDate()}
                    </p>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif mb-1 truncate" style={{ fontSize: 'clamp(14px, 2vw, 20px)', color: 'var(--charcoal)' }}>{ev.title}</h3>
                    <p className="text-[11px] leading-relaxed flex items-center gap-1 flex-wrap" style={{ color: 'var(--gray)' }}>
                      <CalendarDays size={10} /> {formatDate(ev.start_time)}
                      &nbsp;·&nbsp;
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </p>
                  </div>
                  {/* Button — desktop only */}
                  <div className="hidden md:block text-right shrink-0">
                    <span className="inline-block rounded-full bg-[var(--surface)] px-5 py-2 text-xs tracking-widest border transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]" style={{ borderColor: 'var(--border-color)', color: 'var(--charcoal)' }}>
                      {ev.is_paid ? CTA.events.register : CTA.events.freeRegister}
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

      {/* ─── Brand Manifesto ─── */}
      <section className="py-20" style={{ background: 'var(--surface)' }}>
        <div className="container-narrow">
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-6 py-8 md:px-10 md:py-10 shadow-[0_10px_28px_rgba(26,16,8,0.04)]">
            <p className="label-tag mb-4">Our Belief</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: 'var(--charcoal)' }}>
              不只是一個場地
            </h2>
            <div className="gold-divider" />
            <div className="mt-8 space-y-3 text-sm leading-loose" style={{ color: 'var(--gray)' }}>
              <p>我們相信，每一個聚集，都在改變某人的軌跡。</p>
              <p>好的空間，讓想法有地方落地。</p>
              <p>心宇宙是一個起點，也是一個歸處。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="hidden md:block"
        style={{ padding: '96px 0', background: 'var(--surface)' }}
      >
        <div className="container-narrow">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-8 py-12 md:px-14 md:py-16 text-center shadow-[0_12px_32px_rgba(26,16,8,0.06)]">
            <div className="absolute inset-x-8 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,160,56,0.45), transparent)' }} />
            <p className="label-tag mb-4">Start Here</p>
            <h2 className="font-serif text-3xl md:text-5xl mb-5" style={{ color: 'var(--charcoal)', letterSpacing: '0.06em' }}>
              預約您的專屬場地
            </h2>
            <p className="text-sm tracking-widest mb-10" style={{ color: 'var(--gray)', letterSpacing: '0.14em' }}>
              填寫租借申請，我們將於一個工作日內與您確認
            </p>
            <Link
              href="/rent"
              className="btn-gold-fill inline-flex items-center gap-2 px-14 py-3 text-xs tracking-widest"
            >
              {CTA.home.startRental} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
      {/* ─── 手機版：底部固定 CTA 佔位（避免被遮住）─── */}
      <div className="md:hidden" style={{ height: 170 }} />

      {/* ─── 手機底部固定 CTA ─── */}
      <MobileBottomCTA />
    </>
  )
}
