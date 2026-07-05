import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Users, Clock, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const features = [
  { icon: MapPin, title: '台北八德路', desc: '捷運步行可達，交通便利' },
  { icon: Users, title: '多元配置', desc: '教室型 · 講座型 · 分組型，彈性佈置' },
  { icon: Clock, title: '三時段彈性', desc: '早午晚時段分開計費，依需租借' },
]

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
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-[var(--surface)]">
        <div className="container-narrow w-full py-24">
          <p className="label-tag mb-6">Heart Universe Business Center</p>
          <h1 className="text-5xl md:text-7xl text-[var(--charcoal)] leading-tight mb-6">
            心宇宙<br />商務中心
          </h1>
          <div className="gold-divider" />
          <p className="text-[var(--gray)] text-lg leading-relaxed mt-6 mb-10 max-w-md">
            台北八德路精品場地空間<br />
            場地租借 · 課程活動 · 活動紀錄
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/rent"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
            >
              租借申請 <ArrowRight size={14} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--charcoal)] text-[var(--charcoal)] text-sm tracking-widest hover:bg-[var(--charcoal)] hover:text-white transition-all"
            >
              活動課程 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map(f => (
              <div key={f.title} className="flex flex-col">
                <f.icon size={20} className="text-[var(--gold)] mb-4" />
                <h3 className="text-lg text-[var(--charcoal)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--gray)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="py-24 bg-[var(--card-bg)]">
        <div className="container-wide">
          <div className="container-narrow px-0 mb-10">
            <p className="label-tag mb-4">Venue</p>
            <h2 className="text-3xl md:text-4xl mb-4">精品場地空間</h2>
            <div className="gold-divider" />
            <p className="text-[var(--gray)] text-sm leading-relaxed mt-6 max-w-lg">
              寬敞明亮的多功能空間，提供彈性座位配置，適合課程講座、企業培訓、小型展覽、社群聚會。
            </p>
          </div>

          {venues && venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {venues.map(v => {
                const photos = v.venue_photos as { image_url: string; sort_order: number }[] | null
                const cover = photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
                return (
                  <Link
                    key={v.id}
                    href={`/venues/${v.slug}`}
                    className="group bg-[var(--cream)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--gold)] transition-colors"
                  >
                    <div className="relative aspect-video bg-[var(--surface)] overflow-hidden">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={v.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--gray)] text-xs tracking-widest">PHOTO</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base mb-1">{v.name}</h3>
                      {v.area_ping && <p className="text-xs text-[var(--gray)]">{v.area_ping} 坪</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="mb-8 py-12 text-center text-sm text-[var(--gray)]">場地資訊整理中，敬請期待</div>
          )}

          <Link
            href="/venues"
            className="inline-flex items-center gap-2 text-sm text-[var(--gold)] tracking-widest hover:gap-4 transition-all"
          >
            查看所有場地 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Events */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="container-wide">
          <div className="container-narrow px-0 mb-10">
            <p className="label-tag mb-4">Events</p>
            <h2 className="text-3xl md:text-4xl mb-4">近期活動課程</h2>
            <div className="gold-divider" />
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {events.map(ev => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="group bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--gold)] transition-colors"
                >
                  <div className="relative aspect-video bg-[var(--surface)] overflow-hidden">
                    {ev.cover_image_url ? (
                      <Image
                        src={ev.cover_image_url}
                        alt={ev.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--gray)] text-xs tracking-widest">EVENT</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[var(--gold)] text-xs mb-2 flex items-center gap-1">
                      <CalendarDays size={11} /> {formatDate(ev.start_time)}
                    </p>
                    <h3 className="text-sm leading-snug mb-3">{ev.title}</h3>
                    <span className="text-xs font-medium text-[var(--charcoal)]">
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mb-8 py-12 text-center text-sm text-[var(--gray)]">近期暫無活動，請持續關注</div>
          )}

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-[var(--gold)] tracking-widest hover:gap-4 transition-all"
          >
            查看所有活動 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 bg-[var(--card-bg)]">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="label-tag mb-4">Location</p>
              <h2 className="text-3xl mb-4">交通資訊</h2>
              <div className="gold-divider" />
              <div className="mt-6 flex flex-col gap-4 text-sm text-[var(--gray)]">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[var(--gold)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[var(--charcoal)] mb-1">台北市八德路</p>
                    <p className="leading-relaxed">捷運板南線「忠孝復興站」或「忠孝敦化站」步行可達</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[var(--gold)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[var(--charcoal)] mb-1">使用時段</p>
                    <p>早場 09:00–12:00</p>
                    <p>午場 14:00–17:00</p>
                    <p>晚場 18:30–21:30</p>
                  </div>
                </div>
              </div>
              <Link
                href="/rent"
                className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
              >
                立即申請租借 <ArrowRight size={14} />
              </Link>
            </div>
            <div className="rounded overflow-hidden border border-[var(--border-color)]">
              <iframe
                src="https://maps.google.com/maps?q=台北市八德路&output=embed&z=15"
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="心宇宙商務中心地圖"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[var(--charcoal)] text-white">
        <div className="container-narrow text-center">
          <p className="label-tag mb-4" style={{ color: 'var(--gold-light)' }}>Reservation</p>
          <h2 className="text-3xl md:text-4xl mb-4">預約您的專屬場地</h2>
          <div className="gold-divider mx-auto" />
          <p className="text-white/60 text-sm leading-relaxed mt-6 mb-10">
            填寫租借申請，我們將於一個工作日內與您確認
          </p>
          <Link
            href="/rent"
            className="inline-flex items-center gap-2 px-10 py-3 border border-[var(--gold)] text-[var(--gold)] text-sm tracking-widest hover:bg-[var(--gold)] hover:text-white transition-all"
          >
            立即申請 <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  )
}
