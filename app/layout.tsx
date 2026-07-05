import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://heart-universe-center.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: '心宇宙商務中心｜場地租借 × 課程活動',
    template: '%s｜心宇宙商務中心',
  },
  description: '位於台北八德路的精品場地空間。提供場地租借、活動課程報名、QR 簽到等服務。適合企業培訓、課程講座、小型展覽。',
  keywords: ['場地租借', '台北場地', '八德路', '商務中心', '企業培訓', '課程講座', '小型展覽', '會議室'],
  openGraph: {
    title: '心宇宙商務中心｜台北精品場地租借',
    description: '台北八德路精品場地 × 課程活動。適合企業培訓、課程講座、展覽展示。',
    locale: 'zh_TW',
    type: 'website',
    url: SITE,
    siteName: '心宇宙商務中心',
  },
  twitter: {
    card: 'summary_large_image',
    title: '心宇宙商務中心',
    description: '台北八德路精品場地租借 × 課程活動',
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
  description: '台北八德路精品場地租借，提供企業培訓、課程講座、小型展覽等空間服務。',
  url: SITE,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '八德路',
    addressLocality: '台北市',
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
  priceRange: 'NT$$$',
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
      </body>
    </html>
  )
}
