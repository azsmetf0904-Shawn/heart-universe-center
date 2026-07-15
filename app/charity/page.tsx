import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

function IgIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

export const metadata: Metadata = {
  title: '愛物王二手公益 | 心宇宙商務中心 B1',
  description:
    '愛物王二手公益商店位於台北松山八德路三段223號B1，週二至週日12:00-20:00，接收高品質二手物資義賣，扣除管銷後全數捐出。捷運小巨蛋步行10分鐘。',
  openGraph: {
    title: '愛物王二手公益商店',
    description: '台北松山二手公益——接收9成新物資義賣，全數捐出。週二至週日 12:00-20:00，八德路三段223號B1。',
  },
}

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: '愛物王二手公益商店',
  description: '接收高品質二手物資整理義賣，扣除人事管銷後全數捐出的在地公益商店',
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
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '12:00',
      closes: '20:00',
    },
  ],
  url: 'https://heart-universe-center.vercel.app/charity',
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
        text: '位於台北市松山區八德路三段223號B1，捷運小巨蛋站步行約10分鐘。週二至週日 12:00-20:00 營運，週一公休。',
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

const steps = [
  {
    num: '01',
    title: '確認物資與需求',
    desc: '先至官方 IG 確認當時確實需要的項目，避免機構無法處理的廢棄物。',
    link: { label: '查看 IG 需求清單', href: 'https://www.instagram.com/love_secondhand_charity?igsh=MXc0ajdrODQxZGNrdA==' },
    notes: [
      { type: 'warn', text: '大體積或大量物品，需事先拍照聯絡確認空間（LINE 水柔 0960591267）' },
    ],
  },
  {
    num: '02',
    title: '物品整理與分類',
    desc: '整理好再帶來，讓志工能更有效率地幫助更多人。',
    notes: [
      { type: 'ok', text: '衣物請清洗乾淨、去除異味；書籍物資需整理乾淨' },
      { type: 'ok', text: '按性別、季節、尺寸分類裝袋／裝箱' },
      { type: 'ok', text: '在紙箱外標示內容（如：「二手冬裝-女M-10件」）' },
    ],
  },
  {
    num: '03',
    title: '私訊確認，親自送達',
    desc: '確認沒問題後，親自帶物資至愛物王二手公益商店 B1。不接受寄送。',
    link: { label: '查看 Google 地圖', href: 'https://maps.app.goo.gl/NCZomv2nD1zPsq2B7?g_st=ic' },
    notes: [
      { type: 'ok', text: '先私訊官方 IG 確認，再帶至店面' },
    ],
  },
]

const notAccepted = [
  '破損、泛黃、髒污物品',
  '內衣褲',
  '毛絨玩具',
  '二手寢具',
]

export default function CharityPage() {
  return (
    <div className="py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Header */}
      <div className="container-narrow mb-14">
        <p className="label-tag mb-4">Charity</p>
        <h1 className="text-4xl md:text-5xl mb-5">愛物王二手公益</h1>
        <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--gray)' }}>
          捐贈物資請以「9成新、我也會想給家人用」的高品質為主，這才是最有溫度的分享。
          義賣所得扣除人事管銷後，全數捐出。
        </p>
        <div className="gold-divider" />
      </div>

      {/* Location + Hours */}
      <div className="container-narrow mb-14">
        <div
          className="rounded-2xl p-6 md:p-8 border flex flex-col md:flex-row gap-6 md:gap-12"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card, #fff)' }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--gold)' }}>
              <MapPin size={14} />
              <span className="text-xs tracking-[0.2em] uppercase">地址</span>
            </div>
            <p className="text-sm mb-1">台北市松山區八德路三段 223 號 B1</p>
            <p className="text-xs mb-3" style={{ color: 'var(--gray)' }}>捷運小巨蛋站 步行約 10 分鐘</p>
            <a
              href="https://maps.app.goo.gl/NCZomv2nD1zPsq2B7?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              <ExternalLink size={11} /> 開啟地圖導航
            </a>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--gold)' }}>
              <span className="text-xs tracking-[0.2em] uppercase">營業時間</span>
            </div>
            <p className="text-sm mb-1">週二 ─ 週日　12:00 – 20:00</p>
            <p className="text-xs" style={{ color: 'var(--gray)' }}>週一公休</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--gold)' }}>
              <IgIcon size={14} />
              <span className="text-xs tracking-[0.2em] uppercase">官方 IG</span>
            </div>
            <a
              href="https://www.instagram.com/love_secondhand_charity?igsh=MXc0ajdrODQxZGNrdA=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: 'var(--gold)' }}
            >
              @love_secondhand_charity
            </a>
            <p className="text-xs mt-1" style={{ color: 'var(--gray)' }}>
              查看需求清單 · 私訊預約捐贈
            </p>
          </div>
        </div>
      </div>

      {/* Not accepted */}
      <div className="container-narrow mb-14">
        <div
          className="rounded-2xl p-5 border flex flex-col sm:flex-row gap-4 items-start"
          style={{ borderColor: 'rgba(220,50,50,0.15)', background: 'rgba(220,50,50,0.03)' }}
        >
          <XCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#c0392b' }} />
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#c0392b' }}>以下物品恕不接受</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
              {notAccepted.join('、')}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--gray)' }}>
              請勿將物資當作資源回收，以免增加志工整理上的負擔，謝謝大家的體諒與支持。
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="container-narrow mb-16">
        <h2 className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: 'var(--gold)' }}>
          物資捐贈流程
        </h2>
        <div className="flex flex-col gap-8">
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
                        {n.type === 'ok' && <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: '#27ae60' }} />}
                        {n.type === 'warn' && <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: '#e67e22' }} />}
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

      {/* CTA */}
      <div className="container-narrow mb-16">
        <div
          className="rounded-3xl p-8 md:p-10 text-center border"
          style={{ borderColor: 'rgba(196,160,56,0.2)', background: 'rgba(196,160,56,0.04)' }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
            準備好了嗎？
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--gray)' }}>
            先至 IG 確認需求清單，整理好物資後私訊官方帳號預約，確認後親自帶來 B1。
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
          <p className="text-xs mt-6" style={{ color: 'var(--gray)' }}>
            也歡迎{' '}
            <Link href="/rent" className="hover:underline" style={{ color: 'var(--gold)' }}>
              租借場地
            </Link>{' '}
            舉辦公益活動
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="container-narrow">
        <h2 className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: 'var(--gold)' }}>
          常見問題
        </h2>
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
    </div>
  )
}
