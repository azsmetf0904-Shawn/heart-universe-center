import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: '台北企業培訓場地租借｜場地申請',
  description: '申請台北松山八德路企業培訓、講座、工作坊與品牌活動場地租借，線上選擇場地、日期、時段與設備。',
  keywords: ['台北企業培訓場地', '企業內訓場地', '企業活動場地租借', '台北講座場地', '台北工作坊場地', '場地租借預約'],
  alternates: { canonical: '/rent' },
  openGraph: {
    title: '台北企業培訓場地租借｜心宇宙商務中心',
    description: '線上申請台北松山八德路企業培訓、講座與工作坊場地。',
    url: '/rent',
    type: 'website',
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '場地租借申請', item: `${SITE_URL}/rent` },
  ],
}

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {children}
    </>
  )
}
