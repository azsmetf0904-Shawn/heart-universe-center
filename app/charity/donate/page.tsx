import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: '二手物資捐贈規範與流程｜愛物王公益',
  description: '查看愛物王二手公益的物資捐贈規範、可收與不收物品、整理方式及送達流程。位於台北松山八德路三段223號B1，捐贈前請先私訊官方 IG 確認需求。',
  keywords: ['二手物資捐贈', '二手物資捐贈規範', '二手物資捐贈流程', '台北捐物資', '愛物王捐物規範', '愛物王捐物流程'],
  alternates: { canonical: '/charity/donate' },
  openGraph: {
    title: '二手物資捐贈規範與流程｜愛物王公益',
    description: '先確認需求、整理分類，再親自送達愛物王二手公益商店。',
    url: '/charity/donate',
    type: 'article',
    images: [{ url: '/charity/hero.jpg' }],
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '愛物王斷捨離二手公益', item: 'https://heart-universe-center.vercel.app/charity' },
    { '@type': 'ListItem', position: 2, name: '二手物資捐贈規範', item: 'https://heart-universe-center.vercel.app/charity/donate' },
  ],
}

const steps = [
  { num: '01', title: '先確認目前需求', body: '前往官方 Instagram 查看近期需求清單，避免帶來暫時無法處理的物品。大量或大型物品，請先拍照私訊確認。' },
  { num: '02', title: '清潔、分類與標示', body: '衣物請洗淨、去除異味；依性別、季節、尺寸分袋或裝箱，並在外箱標示內容，讓整理工作更有效率。' },
  { num: '03', title: '確認後親自送達', body: '收到官方 IG 確認後，再親自帶到愛物王二手公益商店 B1。現階段不接受郵寄或未確認的直接投遞。' },
]

export default function CharityDonatePage() {
  return (
    <div className="min-h-screen py-20 md:py-28" style={{ background: 'var(--cream)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <main className="container-narrow px-6">
        <Link href="/charity" className="inline-flex items-center gap-2 text-xs tracking-widest mb-12 hover:underline" style={{ color: 'var(--gray)' }}>
          <ArrowLeft size={13} /> 返回愛物王公益
        </Link>

        <header className="max-w-3xl mb-14">
          <p className="label-tag mb-5">DONATION GUIDE</p>
          <h1 className="text-3xl md:text-5xl leading-tight mb-6">二手物資捐贈規範</h1>
          <div className="gold-divider mb-6" />
          <p className="text-base md:text-lg leading-loose" style={{ color: 'var(--gray)' }}>
            把仍然美好的物品，交給真正需要的地方。捐贈前請先確認需求，讓每一份善意都能被妥善接住。
          </p>
        </header>

        <section className="rounded-2xl border p-6 md:p-8 mb-14" style={{ borderColor: 'rgba(192,57,43,.2)', background: 'rgba(192,57,43,.035)' }}>
          <h2 className="text-lg mb-4" style={{ color: '#8f3027' }}>收件標準</h2>
          <p className="leading-loose text-sm md:text-base" style={{ color: 'var(--gray)' }}>
            請以「九成新、自己也願意給家人使用」為標準。破損、泛黃、髒污、有異味的物品，以及內衣褲、毛絨玩具、二手寢具恕不接受。
          </p>
        </section>

        <section id="donate-process" className="mb-16 scroll-mt-24">
          <p className="label-tag mb-8">HOW TO DONATE</p>
          <h2 className="text-2xl md:text-3xl mb-10">二手物資捐贈流程</h2>
          <div className="grid gap-5">
            {steps.map(step => (
              <article key={step.num} className="rounded-2xl border p-6 md:p-8 flex gap-5" style={{ borderColor: 'rgba(196,160,56,.28)', background: 'rgba(255,255,255,.22)' }}>
                <span className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(196,160,56,.13)', color: 'var(--gold)' }}>{step.num}</span>
                <div>
                  <h3 className="text-lg mb-2">{step.title}</h3>
                  <p className="text-sm leading-loose" style={{ color: 'var(--gray)' }}>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-xl mb-4">目前不接受</h2>
            <ul className="space-y-2 text-sm leading-loose" style={{ color: 'var(--gray)' }}>
              <li>・破損、泛黃、髒污或有異味的物品</li>
              <li>・內衣褲、毛絨玩具、二手寢具</li>
              <li>・未經確認的大量或大型物品</li>
              <li>・郵寄或直接放置於店外的物資</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl mb-4">送達資訊</h2>
            <p className="text-sm leading-loose" style={{ color: 'var(--gray)' }}>
              台北市松山區八德路三段 223 號 B1<br />每日 12:00–20:00，全年無休
            </p>
            <a href="https://maps.app.goo.gl/NCZomv2nD1zPsq2B7?g_st=ic" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs mt-4 hover:underline" style={{ color: 'var(--gold)' }}>
              <MapPin size={13} /> 開啟地圖導航
            </a>
          </div>
        </section>

        <section id="confirm" className="rounded-3xl p-8 md:p-12 text-center" style={{ background: 'rgba(196,160,56,.09)', border: '1px solid rgba(196,160,56,.25)' }}>
          <h2 className="text-xl md:text-2xl mb-4">捐贈前，先和我們確認</h2>
          <p className="text-sm leading-loose mb-8" style={{ color: 'var(--gray)' }}>請先查看官方 IG 需求清單並私訊，確認後再親自送達。</p>
          <a href="https://www.instagram.com/love_secondhand_charity?igsh=MXc0ajdrODQxZGNrdA==" target="_blank" rel="noopener noreferrer" className="btn primary inline-flex items-center gap-2 justify-center">
            前往官方 IG <ExternalLink size={13} />
          </a>
        </section>
      </main>
    </div>
  )
}
