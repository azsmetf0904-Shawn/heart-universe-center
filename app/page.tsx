import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CTA } from '@/lib/cta'
import { MobileBottomCTA } from '@/components/MobileBottomCTA'
import { ScrollRevealSection } from '@/components/ScrollRevealSection'
import { MobileAvailabilityStrip } from '@/components/MobileAvailabilityStrip'
import { HeroEffects } from '@/components/HeroEffects'
import { TiltCard } from '@/components/TiltCard'
import { MagneticButton } from '@/components/MagneticButton'

// ── Design tokens ─────────────────────────────────────────────────────────────
const W    = '#FDFAF6'   // near-white warm
const ST   = '#F2EAE0'   // stone
const ST2  = '#EAE0D2'   // stone 2
const ST3  = '#E0D4C4'   // stone 3
const BD   = '#D4C4B0'   // border
const GOLD = '#C4A038'
const DARK = '#1C1008'
const GRAY = '#7A6A50'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
}

type VenuePhoto = { image_url: string; sort_order: number }
type EventPhoto  = { image_url: string; sort_order: number }

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: venues }, { data: events }, { data: showcaseEvents }, { data: pastEvents }] = await Promise.all([
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
      .select('id, title, slug, start_time, cover_image_url, organizer_name')
      .eq('status', 'ended')
      .not('cover_image_url', 'is', null)
      .order('start_time', { ascending: false })
      .limit(3),
  ])

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '心宇宙商務中心',
    alternateName: 'Heart Universe Business Center',
    url: 'https://heart-universe-center.vercel.app',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '八德路三段',
      addressLocality: '台北市松山區',
      addressRegion: '台北市',
      addressCountry: 'TW',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens: '09:00',
      closes: '21:30',
    }],
    priceRange: 'NT$15,000+',
    description: '台北八德路精品場地租借，適合品牌講座、企業培訓、工作坊、課程活動，最多容納150人，捷運步行可達。',
    hasMap: 'https://maps.app.goo.gl/NCZomv2nD1zPsq2B7',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />

      {/* ═══════════════════════════════════════════════════════════
          HERO — dark left panel + photo grid right
      ═══════════════════════════════════════════════════════════ */}
      <section id="hero-section" className="hu-perfect-hero grid md:grid-cols-2" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Client: particles + parallax */}
        <HeroEffects heroId="hero-section" leftId="hero-left" />

        {/* ── Left: dark text panel ── */}
        <div
          id="hero-left"
          className="relative flex flex-col items-center text-center px-8 md:px-14 pt-16 pb-16 md:pt-40 md:pb-16"
          style={{ background: DARK, overflow: 'hidden', minHeight: 'calc(100vh - 64px)' }}
        >
          {/* Desktop background photo */}
          <div className="absolute inset-0 hidden md:block pointer-events-none">
            <Image
              src="/home-hero/venue-background.jpg"
              alt=""
              fill priority
              className="object-cover"
              sizes="50vw"
              style={{ objectPosition: 'center center' }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(155deg, rgba(24,12,5,.80) 0%, rgba(38,21,9,.73) 48%, rgba(25,13,6,.84) 100%)',
              boxShadow: 'inset -1px 0 rgba(196,160,56,.14)',
            }} />
          </div>

          {/* Mobile background photo */}
          <div className="absolute inset-0 md:hidden pointer-events-none" style={{
            backgroundImage: `url(https://sdxwufrolnbobstfuvtc.supabase.co/storage/v1/object/public/venues-photos/venues/ee0cbe6d-9043-4bce-9459-23a0a63f3d0e/venue-real-6.jpg)`,
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28,
          }} />

          {/* Decorative rings */}
          <div className="absolute pointer-events-none" style={{ bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(176,120,80,.12)' }} />
          <div className="absolute pointer-events-none" style={{ bottom: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(176,120,80,.10)' }} />

          {/* Logo */}
          <Image
            className="hu-hero-logo relative z-10 w-[180px] md:w-[330px] h-auto"
            data-hp="text"
            src="/logo-new.png"
            alt="心宇宙商務中心"
            width={330} height={330}
            priority
            style={{ objectFit: 'contain', marginBottom: 16, filter: 'drop-shadow(0 0 2px rgba(196,160,56,.40))', opacity: 0.82 }}
          />

          {/* 品牌名 */}
          <p data-hp="text" className="hu-hero-brand relative z-10 font-serif mb-1" style={{ fontSize: 'clamp(18px,2.2vw,28px)', color: 'rgba(244,239,230,.92)', letterSpacing: '.18em' }}>
            心宇宙商務中心
          </p>
          <p data-hp="text" className="hu-hero-eyebrow relative z-10 text-[10px] mb-4" style={{ letterSpacing: '.35em', color: 'rgba(196,160,56,.95)' }}>
            HEART UNIVERSE · TAIPEI
          </p>

          {/* Gold divider */}
          <div data-hp="text" className="relative z-10" style={{ width: 36, height: 1, background: GOLD, opacity: .5, marginBottom: 20 }} />

          {/* Tagline H1 */}
          <h1 data-hp="text" className="relative z-10 font-serif leading-snug mb-4" style={{ fontSize: 'clamp(24px,2.8vw,38px)', fontWeight: 600, color: '#fff', letterSpacing: '.06em' }}>
            臺灣最具<br /><span style={{ color: GOLD }}>質感活動</span><br />的場地
          </h1>

          <p data-hp="text" className="hu-hero-sub relative z-10 text-[11px] leading-loose mb-5" style={{ color: 'rgba(244,239,230,.75)', letterSpacing: '.1em' }}>
            二手公益 × 文創教室，獨一無二的「文化生態圈」
          </p>

          {/* Activity tags */}
          <div data-hp="text" className="hu-hero-tags relative z-10 flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {['品牌講座', '女性成長課程', '企業培訓', '工作坊', '身心靈課程', '直播活動'].map(tag => (
              <span key={tag} className="text-[10px] px-3 py-1.5 tracking-wide"
                style={{ border: '1px solid rgba(196,160,56,.75)', color: 'rgba(230,200,120,1)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* CTA — mobile */}
          <Link data-hp="text" href="/rent" className="relative z-10 md:hidden btn-gold-fill text-xs tracking-widest px-7 py-2.5 mb-6">
            {CTA.home.startRental}
          </Link>

          {/* CTA — desktop */}
          <div data-hp="text" className="relative z-10 hidden md:flex gap-3">
            <Link href="/rent" className="btn-gold-fill text-xs tracking-widest px-8 py-3">
              {CTA.home.startRental}
            </Link>
            <Link href="/venues" className="text-xs tracking-widest px-6 py-3 transition-colors"
              style={{ border: '1px solid rgba(244,239,230,.18)', color: 'rgba(244,239,230,.55)', display: 'inline-flex', alignItems: 'center' }}>
              {CTA.home.viewVenuePhotos}
            </Link>
          </div>
        </div>

        {/* ── Right: photo grid ── */}
        <div
          data-hp="photo"
          className="hidden md:grid"
          style={{ gridTemplateRows: '2fr 1fr', gridTemplateColumns: 'repeat(3,1fr)' }}
        >
          <div className="relative col-span-3 overflow-hidden" style={{ background: 'var(--surface)' }}>
            <Image
              src="/home-hero/event-family-day-1.jpg"
              alt="心宇宙商務中心親子日活動現場"
              fill className="object-cover" sizes="50vw" priority
              style={{ objectPosition: 'center center' }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-3"
              style={{ background: 'linear-gradient(to top, rgba(26,16,8,.72), transparent)' }}>
              <p className="text-[10px]" style={{ letterSpacing: '.25em', color: 'rgba(255,255,255,.78)', borderLeft: '2px solid var(--gold)', paddingLeft: 10 }}>
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
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="17vw"
                style={{ objectPosition: 'center center' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS RIBBON — 4 stats, animated gradient
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{
        background: `linear-gradient(90deg, ${W}, #F8F2EA, ${W})`,
        backgroundSize: '200% 100%',
        animation: 'hu-gradShift 8s ease-in-out infinite',
        borderBottom: `1px solid ${BD}`,
      }}>
        {([
          { n: '150', u: '人', l: '最大容納' },
          { n: '15K', u: '起', l: '平日場租' },
          { n: '3H',  u: '',   l: '每時段' },
          { n: '5F',  u: '',   l: '電梯直達' },
        ] as const).map((s, i) => (
          <ScrollRevealSection key={s.l} delay={i * 80}>
            <div className="py-8 md:py-10 text-center cursor-default" style={{ borderRight: i < 3 ? `1px solid ${BD}` : 'none' }}>
              <div style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 300, color: GOLD, lineHeight: 1 }}>
                {s.n}<span style={{ fontSize: 13, color: GRAY, marginLeft: 2 }}>{s.u}</span>
              </div>
              <div style={{ fontSize: 9, letterSpacing: '.28em', color: GRAY, marginTop: 10, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          </ScrollRevealSection>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FEATURE STRIP — 3 cols, hover gold top-line
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid" style={{ background: BD, gap: 1, gridTemplateColumns: 'repeat(1,1fr)' }}
           // on md: 3 cols via inline override applied below
      >
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ background: BD, gap: 1 }}>
          {[
            { label: 'Location',  title: '捷運步行可達',   desc: '小巨蛋站 3 號出口 · 國父紀念館站 1 號出口，步行約 10 分鐘，鄰近停車場。' },
            { label: 'Capacity',  title: '彈性座位配置',   desc: '劇院型 · 島嶼式 100–150 人，桌椅自由調整，支援多種活動動線規劃。' },
            { label: 'Equipment', title: '高規格視聽設備', desc: '雷射投影機 · Sure 無線麥克風 × 4 · 專業音響系統，全數含於場租費用。' },
          ].map((f, i) => (
            <ScrollRevealSection key={f.title} delay={i * 130}>
              <div className="hu-f-cell h-full" style={{ padding: '52px 44px', background: ST }}>
                <div style={{ fontSize: 9, letterSpacing: '.45em', color: GOLD, textTransform: 'uppercase', marginBottom: 18 }}>{f.label}</div>
                <h3 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 20, color: DARK, marginBottom: 14, fontWeight: 500 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: GRAY, lineHeight: 2.05, letterSpacing: '.04em' }}>{f.desc}</p>
              </div>
            </ScrollRevealSection>
          ))}
        </div>
      </div>

      {/* ─── Mobile: 7天可用時段 ─── */}
      {venues && venues.length > 0 && <MobileAvailabilityStrip venueId={venues[0].id} />}

      {/* ═══════════════════════════════════════════════════════════
          VENUE — editorial 55/45
      ═══════════════════════════════════════════════════════════ */}
      <ScrollRevealSection>
      <section style={{ padding: '108px 0', background: W, borderBottom: `1px solid ${BD}` }}>
        <div className="container-wide">
          {/* Section header */}
          <div className="flex items-end justify-between mb-16">
            <div>
              <p style={{ fontSize: 9, letterSpacing: '.5em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>Venue</p>
              <h2 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(30px,3vw,44px)', fontWeight: 400, color: DARK }}>精品場地空間</h2>
            </div>
            <Link href="/venues" style={{ fontSize: 10, letterSpacing: '.2em', color: GRAY, textDecoration: 'none', borderBottom: `1px solid ${BD}`, paddingBottom: 2 }}>
              查看全部場地 <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          {/* Editorial card */}
          {venues && venues.length > 0 ? (() => {
            const v = venues[0]
            const photos = v.venue_photos as VenuePhoto[] | null
            const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
            return (
              <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr]" style={{ border: `1px solid ${BD}`, overflow: 'hidden', minHeight: 480 }}>
                {/* Photo side */}
                <div className="relative overflow-hidden" style={{ background: DARK, minHeight: 320 }}>
                  {cover ? (
                    <Image src={cover} alt={v.name} fill className="object-cover" sizes="55vw"
                      style={{ objectPosition: 'center', opacity: 0.85 }} />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #2E1C0C 0%, #1A0E06 60%, #0A0604 100%)' }} />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,6,2,.35) 0%, transparent 40%)' }} />
                  {/* Floating "01" */}
                  <div aria-hidden className="absolute pointer-events-none select-none hidden md:block" style={{
                    top: 22, left: 24,
                    fontFamily: 'Noto Serif TC, serif',
                    fontSize: 108, fontWeight: 300,
                    color: 'rgba(196,160,56,.10)', lineHeight: 1,
                    animation: 'hu-floatNum 6s ease-in-out infinite',
                  }}>01</div>
                  {/* Badge */}
                  <div className="absolute" style={{ bottom: 24, left: 28, fontSize: 9, letterSpacing: '.28em', color: 'rgba(196,160,56,.72)', border: '1px solid rgba(196,160,56,.28)', padding: '5px 14px' }}>
                    多功能大廳 · 實景
                  </div>
                </div>

                {/* Info side */}
                <div className="flex flex-col justify-center px-8 md:px-14 py-12" style={{ background: W, borderLeft: `1px solid ${BD}` }}>
                  <div style={{ fontSize: 9, letterSpacing: '.45em', color: GOLD, textTransform: 'uppercase', marginBottom: 18 }}>Main Hall</div>
                  <h3 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(24px,2.8vw,34px)', fontWeight: 400, color: DARK, marginBottom: 14 }}>{v.name}</h3>
                  <div style={{ width: 36, height: 1, background: GOLD, opacity: .6, marginBottom: 24 }} />
                  <p style={{ fontSize: 13, color: GRAY, lineHeight: 2.1, marginBottom: 32 }}>
                    可容納 150 人的精品級活動空間。適合品牌活動、培訓課程與講座發表。
                  </p>
                  {/* Specs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 40 }}>
                    {[
                      ['容量', `100–${v.capacity ?? 150} 人`],
                      ['配置', '劇院 / 島嶼 / 教室 / U 型'],
                      ['平日', 'NT$ 15,000 / 時段'],
                      ['假日', 'NT$ 18,000 / 時段'],
                    ].map(([k, val]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11 }}>
                        <span style={{ color: GOLD, width: 48, flexShrink: 0, letterSpacing: '.06em' }}>{k}</span>
                        <span style={{ color: DARK }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/venues/${v.slug}`} className="inline-flex items-center gap-2 text-xs tracking-widest"
                    style={{ border: `1px solid ${DARK}`, color: DARK, padding: '12px 30px', alignSelf: 'flex-start', textDecoration: 'none', transition: '.25s' }}>
                    查看場地詳情 <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            )
          })() : null}
        </div>
      </section>
      </ScrollRevealSection>

      {/* ═══════════════════════════════════════════════════════════
          SHOWCASE — 2fr/1fr dark photo grid
      ═══════════════════════════════════════════════════════════ */}
      {showcaseEvents && showcaseEvents.length > 0 && (
        <ScrollRevealSection>
        <section style={{ padding: '108px 0', background: ST2, borderBottom: `1px solid ${BD}` }}>
          <div className="container-wide">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p style={{ fontSize: 9, letterSpacing: '.5em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>Showcase</p>
                <h2 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(30px,3vw,44px)', fontWeight: 400, color: DARK }}>過去的活動回顧</h2>
              </div>
              <Link href="/showcase" style={{ fontSize: 10, letterSpacing: '.2em', color: GRAY, textDecoration: 'none', borderBottom: `1px solid ${BD}`, paddingBottom: 2 }}>
                查看全部相簿 <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]" style={{ gap: 4 }}>
              {/* Featured main */}
              {(() => {
                const ev = showcaseEvents[0]
                const photos = ev.event_photos as EventPhoto[] | null
                const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                return (
                  <Link href="/showcase" className="group relative block overflow-hidden md:row-span-2"
                    style={{ minHeight: 500, background: DARK, border: `1px solid ${BD}` }}>
                    {cover ? (
                      <Image src={cover} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="66vw" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #2E1C0C 0%, #1A0E06 60%)' }} />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-9"
                      style={{ background: 'linear-gradient(to top, rgba(10,6,2,.75) 0%, transparent 50%)' }}>
                      <p style={{ fontSize: 9, letterSpacing: '.3em', color: 'rgba(196,160,56,.8)', marginBottom: 8, textTransform: 'uppercase' }}>
                        {new Date(ev.start_time).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })} · 活動實景
                      </p>
                      <p style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 20, color: 'rgba(255,255,255,.88)', fontWeight: 300 }}>{ev.title}</p>
                    </div>
                  </Link>
                )
              })()}
              {/* Small events */}
              {showcaseEvents.slice(1, 3).map(ev => {
                const photos = ev.event_photos as EventPhoto[] | null
                const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                return (
                  <Link key={ev.id} href="/showcase" className="group relative block overflow-hidden"
                    style={{ minHeight: 244, background: DARK, border: `1px solid ${BD}` }}>
                    {cover ? (
                      <Image src={cover} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="33vw" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #261808, #120C04)' }} />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-6"
                      style={{ background: 'linear-gradient(to top, rgba(10,6,2,.75) 0%, transparent 50%)' }}>
                      <p style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 14, color: 'rgba(255,255,255,.85)', fontWeight: 300 }}>{ev.title}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
        </ScrollRevealSection>
      )}

      {/* ═══════════════════════════════════════════════════════════
          EVENTS — 3-col cards with large date + 3D tilt
      ═══════════════════════════════════════════════════════════ */}
      <ScrollRevealSection>
      <section style={{ padding: '108px 0', background: W, borderBottom: `1px solid ${BD}` }}>
        <div className="container-wide">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p style={{ fontSize: 9, letterSpacing: '.5em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>Events</p>
              <h2 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(30px,3vw,44px)', fontWeight: 400, color: DARK }}>近期活動課程</h2>
            </div>
            <Link href="/events" style={{ fontSize: 10, letterSpacing: '.2em', color: GRAY, textDecoration: 'none', borderBottom: `1px solid ${BD}`, paddingBottom: 2 }}>
              {CTA.home.viewAll} <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1, background: BD }}>
              {events.map(ev => (
                <TiltCard key={ev.id} intensity={6} style={{ background: W }}>
                  <Link href={`/events/${ev.slug}`} className="block" style={{ padding: '48px 44px', textDecoration: 'none' }}>
                    <div style={{ fontSize: 9, letterSpacing: '.4em', color: GOLD, textTransform: 'uppercase', marginBottom: 4 }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </div>
                    <div style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(48px,5vw,64px)', fontWeight: 300, color: DARK, lineHeight: 1, marginBottom: 22 }}>
                      {new Date(ev.start_time).getDate()}
                    </div>
                    <div style={{ width: 28, height: 1, background: GOLD, opacity: .6, marginBottom: 22 }} />
                    <h3 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 17, color: DARK, marginBottom: 10, lineHeight: 1.45, fontWeight: 500 }}>{ev.title}</h3>
                    <p style={{ fontSize: 11, color: GRAY, letterSpacing: '.06em', lineHeight: 1.8, marginBottom: 24 }}>
                      {formatDate(ev.start_time)}
                    </p>
                    <div style={{ fontSize: 14, color: GOLD, fontFamily: 'Noto Serif TC, serif', marginBottom: 16 }}>
                      {ev.is_paid ? `NT$ ${ev.price?.toLocaleString() ?? '—'}` : '免費報名'}
                    </div>
                    <span style={{ fontSize: 10, letterSpacing: '.2em', color: GRAY, borderBottom: `1px solid ${BD}`, paddingBottom: 2 }}>
                      {ev.is_paid ? '立即報名 →' : '免費報名 →'}
                    </span>
                  </Link>
                </TiltCard>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm" style={{ color: GRAY }}>近期暫無活動，請持續關注</div>
          )}
        </div>
      </section>
      </ScrollRevealSection>

      {/* ═══════════════════════════════════════════════════════════
          PAST EVENTS — stone bg, white cards + 3D tilt
      ═══════════════════════════════════════════════════════════ */}
      {pastEvents && pastEvents.length > 0 && (
        <ScrollRevealSection>
        <section style={{ padding: '108px 0', background: ST, borderBottom: `1px solid ${BD}` }}>
          <div className="container-wide">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p style={{ fontSize: 9, letterSpacing: '.5em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>Past Events</p>
                <h2 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(30px,3vw,44px)', fontWeight: 400, color: DARK }}>精彩活動回顧</h2>
              </div>
              <Link href="/events" style={{ fontSize: 10, letterSpacing: '.2em', color: GRAY, textDecoration: 'none', borderBottom: `1px solid ${BD}`, paddingBottom: 2 }}>
                {CTA.home.viewAll} <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastEvents.map(ev => (
                <TiltCard key={ev.id} intensity={5} style={{ background: W, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                  <Link href={`/events/${ev.slug}`} className="block" style={{ textDecoration: 'none' }}>
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: DARK }}>
                      <Image
                        src={ev.cover_image_url!}
                        alt={ev.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,6,2,.5) 0%, transparent 45%)' }} />
                    </div>
                    <div style={{ padding: '22px 26px 28px' }}>
                      <h3 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 15, color: DARK, marginBottom: 8, lineHeight: 1.48, fontWeight: 500 }}>{ev.title}</h3>
                      <p style={{ fontSize: 10, color: GRAY, letterSpacing: '.07em' }}>
                        {new Date(ev.start_time).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {ev.organizer_name && <> · {ev.organizer_name}</>}
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
        </ScrollRevealSection>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CHARITY — unchanged dark section
      ═══════════════════════════════════════════════════════════ */}
      <ScrollRevealSection>
      <section style={{ background: '#1A0E06' }}>
        <div className="container-wide">
          <div className="grid md:grid-cols-2 items-center gap-0">
            <div className="relative overflow-hidden" style={{ height: '420px' }}>
              <Image src="/charity/grid-2.jpg" alt="愛物王斷捨離二手公益商店" fill className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #1A0E06)' }} />
            </div>
            <div className="px-8 py-14 md:px-14 md:py-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ background: '#f5ede4' }}>
                  <Image src="/charity/logo.jpg" alt="台灣愛物王公益協會" fill className="object-cover" sizes="56px" />
                </div>
                <p className="text-[10px] tracking-[0.45em] uppercase" style={{ color: 'rgba(196,160,56,.75)' }}>
                  Charity · 二手公益
                </p>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-3 leading-snug">
                愛物王斷捨離<br />二手公益
              </h2>
              <p className="text-sm mb-6 tracking-widest" style={{ color: 'rgba(196,160,56,.85)' }}>
                斷捨離，讓愛傳下去
              </p>
              <p className="text-xs leading-loose mb-8" style={{ color: 'rgba(255,255,255,.5)' }}>
                接收高品質二手物資、整理義賣，扣除管銷後全數捐出。<br />
                台北松山 · 每日 12:00–20:00
              </p>
              <Link href="/charity" className="inline-flex items-center gap-2 text-xs tracking-widest border px-6 py-2.5 transition-all hover:bg-[var(--gold)] hover:text-white hover:border-[var(--gold)]"
                style={{ borderColor: 'rgba(196,160,56,.5)', color: 'rgba(196,160,56,.9)' }}>
                了解更多 <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ═══════════════════════════════════════════════════════════
          MANIFESTO — 2-col with organic blob
      ═══════════════════════════════════════════════════════════ */}
      <ScrollRevealSection>
      <section style={{ padding: '120px 0', background: ST3, borderBottom: `1px solid ${BD}` }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-24">
            {/* Left: copy */}
            <div>
              <p style={{ fontSize: 9, letterSpacing: '.5em', color: GOLD, textTransform: 'uppercase', marginBottom: 22 }}>Our Belief</p>
              <h2 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(38px,4.5vw,58px)', fontWeight: 300, color: DARK, lineHeight: 1.18, marginBottom: 24 }}>
                不只是<br />一個場地
              </h2>
              <div style={{ width: 36, height: 1, background: GOLD, opacity: .6, marginBottom: 24 }} />
              <div style={{ fontSize: 14, color: GRAY, lineHeight: 2.3, letterSpacing: '.055em' }}>
                <p>我們相信，每一個聚集，都在改變某人的軌跡。</p>
                <br />
                <p>好的空間，讓想法有地方落地。</p>
                <br />
                <p>心宇宙是一個起點，也是一個歸處。</p>
              </div>
            </div>

            {/* Right: organic blob + quote card */}
            <div style={{ position: 'relative' }}>
              {/* Organic blob */}
              <div aria-hidden className="hidden md:block" style={{
                position: 'absolute',
                width: 300, height: 280,
                background: 'radial-gradient(circle, rgba(196,160,56,.08) 0%, transparent 65%)',
                borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
                animation: 'hu-blobMorph 8s ease-in-out infinite',
                pointerEvents: 'none',
                top: -30, left: -30,
              }} />
              {/* Quote card */}
              <div style={{
                border: `1px solid ${ST3}`,
                padding: '52px 52px 48px',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(253,250,246,.65)',
              }}>
                {/* Decorative "心" */}
                <div aria-hidden style={{
                  position: 'absolute', bottom: -40, right: -16,
                  fontFamily: 'Noto Serif TC, serif',
                  fontSize: 220, fontWeight: 300,
                  color: 'rgba(196,160,56,.07)', lineHeight: 1,
                  pointerEvents: 'none', userSelect: 'none',
                }}>心</div>
                {/* Top gold accent line */}
                <div style={{ position: 'absolute', top: 0, left: 52, right: 52, height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)`, opacity: .45 }} />
                <p style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 20, fontWeight: 300, color: '#2C1E12', lineHeight: 2.1, letterSpacing: '.12em', marginBottom: 32 }}>
                  讓每一個聚集<br />都成為<br />改變的起點
                </p>
                <p style={{ fontSize: 9, letterSpacing: '.4em', color: 'rgba(196,160,56,.55)', textTransform: 'uppercase', paddingTop: 20, borderTop: `1px solid ${BD}` }}>
                  — 心宇宙商務中心
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ═══════════════════════════════════════════════════════════
          CTA — stone2 bg, halo breath, magnetic button
      ═══════════════════════════════════════════════════════════ */}
      <ScrollRevealSection>
      <section style={{ padding: '140px 0', background: ST2, borderTop: `1px solid ${BD}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Halo */}
        <div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,160,56,.08) 0%, transparent 65%)',
          animation: 'hu-haloBreath 5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        {/* Decorative "心宇宙" text */}
        <div aria-hidden className="hidden md:block" style={{
          position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Noto Serif TC, serif', fontSize: 200, fontWeight: 300,
          color: 'rgba(196,160,56,.05)', lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
        }}>心宇宙</div>

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 9, letterSpacing: '.5em', color: GOLD, textTransform: 'uppercase', marginBottom: 22 }}>Start Here</p>
          <h2 style={{ fontFamily: 'Noto Serif TC, serif', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 300, color: DARK, marginBottom: 14, letterSpacing: '.04em' }}>
            預約您的專屬場地
          </h2>
          <p style={{ fontSize: 12, letterSpacing: '.18em', color: GRAY, marginBottom: 52, lineHeight: 2, animation: 'hu-breathe 4s ease-in-out infinite' }}>
            填寫租借申請，我們將於一個工作日內與您確認
          </p>
          <MagneticButton
            href="/rent"
            style={{
              gap: 14,
              padding: '18px 60px',
              background: DARK,
              color: ST,
              fontSize: 12,
              letterSpacing: '.32em',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            立即申請租借 <ArrowRight size={13} />
          </MagneticButton>
          <p style={{ marginTop: 24, fontSize: 10, letterSpacing: '.18em', color: GRAY, opacity: .7 }}>
            填寫申請表 · 免費諮詢 · 無隱藏費用
          </p>
        </div>
      </section>
      </ScrollRevealSection>

      {/* Mobile spacer for bottom CTA */}
      <div className="md:hidden" style={{ height: 170 }} />
      <MobileBottomCTA />
    </>
  )
}
