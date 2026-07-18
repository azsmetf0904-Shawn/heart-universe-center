import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ExternalLink, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import CharityHeroSlideshow from '@/components/CharityHeroSlideshow'

export const metadata: Metadata = {
  title: '愛物王斷捨離二手公益｜台北二手物資捐贈',
  description:
    '愛物王斷捨離二手公益商店位於台北松山八德路三段223號B1，每日12:00-20:00營運，接收高品質二手物資義賣，扣除管銷後全數捐出。捷運小巨蛋站或國父紀念館站步行10分鐘。',
  keywords: ['愛物王', '愛物王斷捨離二手公益', '台北二手公益', '松山二手公益', '二手物資捐贈', '二手物資捐贈規範', '捐物流程'],
  alternates: {
    canonical: '/charity',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: '愛物王斷捨離二手公益｜台北二手物資捐贈',
    description: '斷捨離，讓愛傳下去。台北松山二手公益——接收9成新物資義賣，全數捐出。每日 12:00-20:00，八德路三段223號B1。',
    url: '/charity',
    type: 'website',
    images: [{ url: '/charity/hero.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '愛物王斷捨離二手公益',
    description: '台北松山二手公益商店：斷捨離，讓愛傳下去。',
    images: ['/charity/hero.jpg'],
  },
}

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: '愛物王斷捨離二手公益商店',
  description: '接收高品質二手物資整理義賣，扣除人事管銷後全數捐出的在地公益商店',
  slogan: '斷捨離，讓愛傳下去',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '八德路三段223號B1',
    addressLocality: '松山區',
    addressRegion: '台北市',
    postalCode: '105',
    addressCountry: 'TW',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '12:00',
      closes: '20:00',
    },
  ],
    url: 'https://heart-universe-center.vercel.app/charity',
  image: 'https://heart-universe-center.vercel.app/charity/hero.jpg',
  logo: 'https://heart-universe-center.vercel.app/charity/logo.jpg',
  sameAs: ['https://www.instagram.com/love_secondhand_charity'],
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '愛物王二手公益商店在哪裡？什麼時候可以去？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '位於台北市松山區八德路三段223號B1，捷運小巨蛋站或國父紀念館站步行約10分鐘。每日 12:00-20:00 營運，無公休。',
      },
    },
    {
      '@type': 'Question',
      name: '如何捐贈二手物資？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '請先至官方 IG（@love_secondhand_charity）確認目前需要的物資項目，整理清潔並分類後，私訊官方 IG 確認沒問題再親自帶至愛物王二手公益商店（B1）。不接受寄送。大量或大體積物品需事先拍照聯絡確認。',
      },
    },
    {
      '@type': 'Question',
      name: '什麼物資不收？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '不收破損、泛黃、髒污的物品，也不收內衣褲、毛絨玩具、二手寢具。請以「9成新、自己也願意給家人用」的品質為標準。',
      },
    },
    {
      '@type': 'Question',
      name: '義賣所得怎麼用？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '義賣所得扣除人事與管銷成本後，100% 全數捐出，公開透明。',
      },
    },
    {
      '@type': 'Question',
      name: '可以在心宇宙舉辦公益活動嗎？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '非常歡迎！心宇宙商務中心提供精品場地租借，公益性質活動請前往租借申請頁面，我們會優先協助安排。',
      },
    },
  ],
}

const gallery = [
  { src: '/charity/grid-1.jpg', alt: '愛物王精品展示區' },
  { src: '/charity/grid-2.jpg', alt: '愛物王苔蘚樹牆藝術裝置' },
  { src: '/charity/grid-3.jpg', alt: '愛物王店內全景' },
  { src: '/charity/grid-4.jpg', alt: '愛物王活動人潮' },
  { src: '/charity/grid-5.jpg', alt: '愛物王家居餐具區' },
  { src: '/charity/grid-6.jpg', alt: '愛物王服飾陳列區' },
]

const steps = [
  {
    num: '01',
    title: '確認物資與需求',
    desc: '先至官方 IG 確認當時確實需要的項目，避免機構無法處理的廢棄物。',
    link: { label: '查看 IG 需求清單', href: 'https://www.instagram.com/love_secondhand_charity?igsh=MXc0ajdrODQxZGNrdA==' },
    notes: [
      { type: 'warn' as const, text: '大體積或大量物品，需事先拍照聯絡確認空間（LINE 水柔 0960591267）' },
    ],
  },
  {
    num: '02',
    title: '物品整理與分類',
    desc: '整理好再帶來，讓志工能更有效率地幫助更多人。',
    notes: [
      { type: 'ok' as const, text: '衣物請清洗乾淨、去除異味；書籍物資需整理乾淨' },
      { type: 'ok' as const, text: '按性別、季節、尺寸分類裝袋／裝箱' },
      { type: 'ok' as const, text: '在紙箱外標示內容（如：「二手冬裝-女M-10件」）' },
    ],
  },
  {
    num: '03',
    title: '私訊確認，親自送達',
    desc: '確認沒問題後，親自帶物資至愛物王二手公益商店 B1。不接受寄送。',
    link: { label: '查看 Google 地圖', href: 'https://maps.app.goo.gl/NCZomv2nD1zPsq2B7?g_st=ic' },
    notes: [
      { type: 'ok' as const, text: '先私訊官方 IG 確認，再帶至店面' },
    ],
  },
]

function IgIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function CharityPage() {
  return (
    <div className="hu-charity-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="hu-charity-spirit-field" aria-hidden="true">
        {Array.from({ length: 30 }, (_, i) => <i key={i} />)}
      </div>

      {/* ── HERO ── */}
      <section className="hu-charity-hero relative w-full" style={{ height: 'min(90vh, 680px)' }}>
        <CharityHeroSlideshow />
        <div
          className="hu-charity-hero-shade absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(28,16,8,0.35) 0%, rgba(28,16,8,0.65) 100%)' }}
        />
        <div className="hu-charity-organic-orb" aria-hidden="true" />
        <div className="hu-charity-hero-copy absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-5" style={{ color: 'rgba(196,160,56,0.9)' }}>
            Heart Universe · Charity
          </p>
          <h1 className="text-3xl md:text-5xl font-serif mb-4 text-white leading-snug">
            愛物王斷捨離<br />二手公益
          </h1>
          <p className="text-base md:text-lg tracking-widest" style={{ color: 'rgba(255,255,255,0.75)' }}>
            斷捨離，讓愛傳下去
          </p>
          <div className="hu-charity-location mt-8 flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <MapPin size={12} />
            <span>台北松山・八德路三段 223 號 B1</span>
            <span>｜</span>
            <span>每日 12:00–20:00</span>
          </div>
          <div className="hu-charity-hero-actions mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/charity/donate#donate-process" className="btn-gold-fill inline-flex min-h-12 items-center justify-center rounded-full px-7 text-xs tracking-[0.16em] shadow-lg">
              我要捐物資
            </a>
            <a href="/charity/donate" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 bg-white/5 px-7 text-xs tracking-[0.14em] text-white transition-colors hover:bg-white/10">
              查看捐贈規範
            </a>
          </div>
          <p className="hu-charity-hero-hint mt-3 text-[9px] tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.52)' }}>
            先確認收件規範，再讓物品延續它的生命
          </p>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="hu-charity-about py-20">
        <div className="container-narrow text-center max-w-2xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden" style={{ background: '#f5ede4' }}>
              <Image src="/charity/logo.jpg" alt="台灣愛物王公益協會" fill className="object-cover" sizes="112px" />
            </div>
          </div>
          <div className="hu-charity-about-copy">
            <p className="label-tag mb-4">關於我們</p>
            <h2 className="text-2xl md:text-3xl mb-6 leading-snug">
              9 成新，才是有溫度的分享
            </h2>
            <p className="text-sm leading-loose" style={{ color: 'var(--gray)' }}>
              愛物王斷捨離二手公益由心宇宙商務中心發起，接收高品質二手物資、用心整理分類後公開義賣。
              扣除人事與管銷成本，所有收入全數捐出。每一件物品，都在延續它的生命；每一筆消費，都是一份流動的善意。
            </p>
            <div className="gold-divider mt-8" />
          </div>
        </div>
      </section>

      {/* ── DONATION PHILOSOPHY ── */}
      <section className="hu-charity-philosophy py-16 md:py-20">
        <div className="container-narrow px-6">
          <p className="text-xs tracking-[0.35em] uppercase mb-5" style={{ color: 'var(--gold)' }}>Why We Share</p>
          <h2 className="text-2xl md:text-3xl leading-snug mb-5">每一件物品，<br />都值得被好好對待</h2>
          <p className="max-w-2xl text-sm leading-loose" style={{ color: 'var(--gray)' }}>
            你捐出的不只是物品，而是一段被延續的生命，也是下一個人重新開始時，收到的一份溫柔支持。
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              ['延續物品生命', '讓仍然美好的物品，繼續被需要、被珍惜。'],
              ['讓資源再次流動', '透過整理與義賣，讓善意走得更遠。'],
              ['把愛送到需要的地方', '義賣收入扣除管銷後，全數投入公益。'],
            ].map(([title, desc]) => (
              <div key={title} className="border-t pt-4" style={{ borderColor: 'rgba(196,160,56,.28)' }}>
                <p className="font-serif text-sm mb-2" style={{ color: 'var(--gold)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="hu-charity-gallery pb-20">
        <div className="container-wide px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl"
                style={{ aspectRatio: '4/3' }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 不收清單 ── */}
      <section className="pb-6" id="donate-rules">
        <div className="container-narrow px-6">
          <div
            className="rounded-2xl p-5 border flex gap-4 items-start"
            style={{ borderColor: 'rgba(220,50,50,0.18)', background: 'rgba(220,50,50,0.03)' }}
          >
            <XCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#c0392b' }} />
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: '#c0392b' }}>以下物品恕不接受</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
                破損・泛黃・髒污物品、內衣褲、毛絨玩具、二手寢具
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--gray)' }}>
                請勿將物資當作資源回收，以免增加志工整理上的負擔，謝謝大家的體諒與支持。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 捐贈流程 ── */}
      <section className="hu-charity-process py-16" id="donate-process">
        <div className="container-narrow px-6">
          <p className="text-xs tracking-[0.35em] uppercase mb-10" style={{ color: 'var(--gold)' }}>
            物資捐贈流程
          </p>
          <div className="flex flex-col gap-10">
            {steps.map(({ num, title, desc, link, notes }) => (
              <div key={num} className="flex gap-5">
                <div
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-semibold"
                  style={{ background: 'rgba(196,160,56,0.12)', color: 'var(--gold)' }}
                >
                  {num}
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="text-sm font-semibold mb-1">{title}</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--gray)' }}>{desc}</p>
                  {notes && (
                    <ul className="space-y-1.5 mb-3">
                      {notes.map(n => (
                        <li key={n.text} className="flex items-start gap-2 text-xs" style={{ color: 'var(--gray)' }}>
                          {n.type === 'ok'
                            ? <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: '#27ae60' }} />
                            : <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: '#e67e22' }} />
                          }
                          <span>{n.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {link && (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: 'var(--gold)' }}
                    >
                      <ExternalLink size={11} /> {link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 地址 / 時間 ── */}
      <section className="hu-charity-details py-16" style={{ background: 'var(--bg-surface, #f5f0eb)' }}>
        <div className="container-narrow px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--gold)' }}>地址</p>
            <p className="text-sm mb-1">台北市松山區八德路三段 223 號 B1</p>
            <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>捷運小巨蛋站・國父紀念館站 步行約 10 分鐘</p>
            <a
              href="https://maps.app.goo.gl/NCZomv2nD1zPsq2B7?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              <MapPin size={11} /> 開啟地圖導航
            </a>
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--gold)' }}>營業時間</p>
            <p className="text-sm mb-1">每日　12:00 – 20:00</p>
            <p className="text-xs" style={{ color: 'var(--gray)' }}>全年無休</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--gold)' }}>官方 IG</p>
            <a
              href="https://www.instagram.com/love_secondhand_charity?igsh=MXc0ajdrODQxZGNrdA=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:underline mb-1"
              style={{ color: 'var(--gold)' }}
            >
              <IgIcon size={13} /> @love_secondhand_charity
            </a>
            <p className="text-xs" style={{ color: 'var(--gray)' }}>查看需求清單・私訊預約捐贈</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hu-charity-cta py-20">
        <div className="container-narrow px-6">
          <div
            className="rounded-3xl p-8 md:p-12 text-center border"
            style={{ borderColor: 'rgba(196,160,56,0.2)', background: 'rgba(196,160,56,0.04)' }}
          >
            <h2 className="text-xl md:text-2xl mb-3">準備好讓愛流動了嗎？</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--gray)' }}>
              先至 IG 確認需求清單，整理好物資後私訊預約，確認後親自帶來 B1。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.instagram.com/love_secondhand_charity?igsh=MXc0ajdrODQxZGNrdA=="
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary inline-flex items-center gap-2 justify-center"
              >
                <IgIcon size={14} /> 前往官方 IG
              </a>
              <a
                href="https://maps.app.goo.gl/NCZomv2nD1zPsq2B7?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex items-center gap-2 justify-center"
              >
                <MapPin size={14} /> 地圖導航
              </a>
            </div>
            <p className="text-xs mt-8" style={{ color: 'var(--gray)' }}>
              <Link href="/charity/donate" className="hover:underline" style={{ color: 'var(--gold)' }}>
                查看完整捐贈規範
              </Link>{' '}
              ・{' '}
              也歡迎{' '}
              <Link href="/rent" className="hover:underline" style={{ color: 'var(--gold)' }}>
                租借場地
              </Link>{' '}
              舉辦公益活動
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hu-charity-faq pb-16">
        <div className="container-narrow px-6">
          <p className="text-xs tracking-[0.35em] uppercase mb-8" style={{ color: 'var(--gold)' }}>
            常見問題
          </p>
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {faqLd.mainEntity.map(q => (
              <div key={q.name} className="py-6">
                <h3 className="text-sm font-medium mb-2">{q.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
                  {q.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 場地租借 crosslink ── */}
      <section className="py-12 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container-narrow px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--gray)' }}>
            想舉辦公益活動或課程？心宇宙場地可租借使用。
          </p>
          <Link
            href="/rent"
            className="shrink-0 inline-flex items-center gap-2 text-xs tracking-widest border px-6 py-2.5 transition-all hover:border-[var(--charcoal)] hover:text-[var(--charcoal)]"
            style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}
          >
            了解場地租借 <ArrowRight size={12} />
          </Link>
        </div>
      </section>
    </div>
  )
}
