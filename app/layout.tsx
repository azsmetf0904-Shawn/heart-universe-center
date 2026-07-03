import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: '心宇宙商務中心｜場地租借 × 課程活動',
    template: '%s｜心宇宙商務中心',
  },
  description: '位於台北八德路的精品場地空間。提供場地租借、活動課程報名、QR 簽到等服務。適合企業培訓、課程講座、小型展覽。',
  openGraph: {
    title: '心宇宙商務中心',
    description: '台北精品場地租借 × 課程活動',
    locale: 'zh_TW',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
