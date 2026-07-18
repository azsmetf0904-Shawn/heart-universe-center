import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://heart-universe-center.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: '台北場地租借｜心宇宙商務中心・質感活動場地',
    template: '%s｜心宇宙商務中心',
  },
  description: '心宇宙商務中心位於台北松山八德路，提供企業培訓、講座、工作坊、課程與品牌活動場地租借，最多容納150人，歡迎預約看場地。',
  keywords: ['台北場地租借', '台北活動場地', '松山區場地租借', '八德路場地租借', '企業培訓場地', '講座場地', '工作坊場地', '文創教室租借'],
  openGraph: {
    title: '台北場地租借｜心宇宙商務中心・質感活動場地',
    description: '台北松山八德路質感活動場地，適合企業培訓、講座、工作坊、品牌活動與公益活動。',
    locale: 'zh_TW',
    type: 'website',
    url: SITE,
    siteName: '心宇宙商務中心',
    images: [{ url: `${SITE}/home-hero/event-family-day-1.jpg` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '心宇宙商務中心',
    description: '台北八德路精品場地租借 × 課程活動',
    images: [`${SITE}/home-hero/event-family-day-1.jpg`],
  },
  alternates: {
    canonical: SITE,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: '心宇宙商務中心',
  alternateName: 'Heart Universe Business Center',
  description: '台北松山八德路精品場地租借，提供企業培訓、課程講座、工作坊、品牌活動與小型展覽空間。',
  url: SITE,
  image: `${SITE}/home-hero/event-family-day-1.jpg`,
  logo: `${SITE}/logo-new.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '八德路三段223號',
    addressLocality: '松山區',
    addressRegion: '台北市',
    postalCode: '105',
    addressCountry: 'TW',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '21:30',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '09:00',
      closes: '21:30',
    },
  ],
  priceRange: 'NT$15,000+',
  hasMap: 'https://maps.app.goo.gl/NCZomv2nD1zPsq2B7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
