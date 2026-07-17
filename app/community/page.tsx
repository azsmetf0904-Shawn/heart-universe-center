import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://heart-universe-center.vercel.app'

export const metadata: Metadata = {
  title: '社群 Community',
  description: '心宇宙商務中心是台北的質感聚集地。每一個到來的人，都帶著自己的使命與夢想。這裡不只是場地，是一個讓想法落地、讓連結發生的社群。',
  openGraph: {
    title: '社群 Community｜心宇宙商務中心',
    description: '每一個到來的人，都帶著自己的使命與夢想。',
    url: `${SITE}/community`,
    type: 'website',
  },
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default async function CommunityPage() {
  const supabase = await createClient()

  const [{ data: upcomingEvents }, { data: pastEvents }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, slug, start_time, is_paid, price, cover_image_url, organizer_name')
      .eq('status', 'published')
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(3),
    supabase
      .from('events')
      .select('id, title, slug, start_time, cover_image_url, organizer_name')
      .eq('status', 'ended')
      .not('cover_image_url', 'is', null)
      .order('start_time', { ascending: false })
      .limit(3),
  ])

  return (
    <div className="py-20">
      {/* Hero */}
      <section className="container-narrow mb-20">
        <p className="label-tag mb-4">Community</p>
        <h1 className="text-4xl md:text-5xl mb-4">每一個聚集，<br />都在改變某人的軌跡</h1>
        <div className="gold-divider" />
        <p className="mt-8 text-sm leading-loose max-w-xl" style={{ color: 'var(--gray)' }}>
          心宇宙是台北的質感聚集地。每一個到來的人，都帶著自己的使命與夢想。
          這裡不只是場地，是一個讓想法落地、讓連結發生的地方。
        </p>
      </section>

      {/* Values strip */}
      <section className="mb-20" style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-wide py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '✦',
                title: '質感空間',
                desc: '石材牆、木格柵、高規視聽設備，讓每一場活動都值得被記住。',
              },
              {
                icon: '◎',
                title: '有溫度的連結',
                desc: '我們相信真實的見面、真實的對話，才能創造真正的改變。',
              },
              {
                icon: '⬡',
                title: '共同成長',
                desc: '不論是主辦者還是參與者，心宇宙是一個讓每個人都可以開展的舞台。',
              },
            ].map((v) => (
              <div key={v.title} className="px-6 py-8 border border-[var(--border-color)] bg-[var(--cream)]">
                <div className="text-2xl mb-4" style={{ color: 'var(--gold)' }}>{v.icon}</div>
                <h3 className="font-serif text-lg mb-3" style={{ color: 'var(--charcoal)' }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to join */}
      <section className="container-narrow mb-20">
        <p className="label-tag mb-3">How to Join</p>
        <h2 className="font-serif text-2xl md:text-3xl mb-8" style={{ color: 'var(--charcoal)' }}>如何參與這個社群</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              step: '01',
              title: '參加活動',
              desc: '關注心宇宙舉辦的各類課程、講座與工作坊，每次到來都是一次相遇。',
              href: '/events',
              cta: '查看近期活動',
            },
            {
              step: '02',
              title: '租借場地',
              desc: '你也可以成為主辦者。把你的活動、課程帶進心宇宙，用這個空間承載你的理念。',
              href: '/rent',
              cta: '申請場地租借',
            },
            {
              step: '03',
              title: '關注二手公益',
              desc: '愛物王斷捨離公益商店與心宇宙共生，每一件轉送的物品，都是善意的流動。',
              href: '/charity',
              cta: '了解公益行動',
            },
            {
              step: '04',
              title: '分享你的故事',
              desc: '如果你曾在心宇宙舉辦活動，我們歡迎你留下回顧與見證，讓更多人看見可能性。',
              href: '/events',
              cta: '瀏覽精彩回顧',
            },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="group border border-[var(--border-color)] bg-[var(--card-bg)] p-6 hover:border-[var(--gold)] transition-colors"
            >
              <div className="text-[10px] tracking-[0.4em] mb-3" style={{ color: 'var(--gold)' }}>{item.step}</div>
              <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--charcoal)' }}>{item.title}</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--gray)' }}>{item.desc}</p>
              <span className="text-xs tracking-widest flex items-center gap-1.5 group-hover:gap-3 transition-all" style={{ color: 'var(--gold)' }}>
                {item.cta} <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <section className="mb-20" style={{ background: 'var(--cream)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container-wide py-12 md:py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="label-tag mb-2">Upcoming</p>
                <h2 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--charcoal)' }}>近期活動</h2>
              </div>
              <Link href="/events" className="flex items-center gap-2 text-xs tracking-widest pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]" style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}>
                全部活動 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid gap-4">
              {upcomingEvents.map(ev => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="group grid grid-cols-[76px_1fr] md:grid-cols-[100px_1fr_auto] items-center gap-4 md:gap-8 border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-4 md:px-6 md:py-5 hover:border-[var(--gold)] transition-colors"
                >
                  <div className="text-center shrink-0 bg-[var(--surface)] px-2 py-3">
                    <p className="text-[9px] tracking-[0.3em] mb-0.5" style={{ color: 'var(--gold)' }}>
                      {new Date(ev.start_time).toLocaleDateString('zh-TW', { month: 'long' })}
                    </p>
                    <p className="font-serif font-semibold text-2xl leading-none" style={{ color: 'var(--charcoal)' }}>
                      {new Date(ev.start_time).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-base mb-1 line-clamp-1" style={{ color: 'var(--charcoal)' }}>{ev.title}</h3>
                    <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--gray)' }}>
                      <CalendarDays size={10} /> {formatDate(ev.start_time)}
                      {ev.organizer_name && <> · {ev.organizer_name}</>}
                      &nbsp;·&nbsp;
                      {ev.is_paid ? `NT$ ${ev.price.toLocaleString()}` : '免費'}
                    </p>
                  </div>
                  <ArrowRight size={14} className="hidden md:block shrink-0" style={{ color: 'var(--gold)' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents && pastEvents.length > 0 && (
        <section className="container-wide mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="label-tag mb-2">Past Events</p>
              <h2 className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--charcoal)' }}>精彩回顧</h2>
            </div>
            <Link href="/events" className="flex items-center gap-2 text-xs tracking-widest pb-1 border-b transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]" style={{ color: 'var(--gray)', borderColor: 'var(--border-color)' }}>
              更多活動 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {pastEvents.map(ev => (
              <Link
                key={ev.id}
                href={`/events/${ev.slug}`}
                className="group block border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden hover:border-[var(--gold)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={ev.cover_image_url!}
                    alt={ev.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="px-5 py-4">
                  <h3 className="font-serif text-base leading-snug mb-2 line-clamp-2" style={{ color: 'var(--charcoal)' }}>{ev.title}</h3>
                  <p className="text-[11px]" style={{ color: 'var(--gray)' }}>
                    {new Date(ev.start_time).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {ev.organizer_name && <> · {ev.organizer_name}</>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-narrow">
        <div className="relative overflow-hidden border border-[var(--border-color)] bg-[var(--card-bg)] px-8 py-12 md:px-14 md:py-16 text-center">
          <div className="absolute inset-x-8 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,160,56,0.45), transparent)' }} />
          <p className="label-tag mb-4">Start Here</p>
          <h2 className="font-serif text-3xl mb-4" style={{ color: 'var(--charcoal)' }}>帶著你的活動來心宇宙</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--gray)' }}>填寫租借申請，一個工作日內確認時段</p>
          <Link href="/rent" className="btn-gold-fill inline-flex items-center gap-2 px-10 py-3 text-xs tracking-widest">
            申請場地租借 <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  )
}
