import type { Metadata } from 'next'

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

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return children
}
