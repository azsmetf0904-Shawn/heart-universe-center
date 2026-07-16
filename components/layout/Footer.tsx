import Link from 'next/link'
import Image from 'next/image'
import { CTA } from '@/lib/cta'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark-bg)', borderTop: '1px solid var(--dark-border)' }}>
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-4">
              <Image src="/logo-new.png" alt="心宇宙商務中心" width={56} height={56} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 1px rgba(196,160,56,0.40))' }} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--dark-muted)' }}>
              台北市八德路<br />
              精品場地租借 × 活動課程
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--gold)' }}>導覽</p>
            <div className="flex flex-col gap-3">
              {[
                { href: '/venues', label: '場地介紹' },
                { href: '/events', label: '活動課程' },
                { href: '/charity', label: '二手公益' },
                { href: '/news', label: '活動新聞' },
                { href: '/rent', label: CTA.booking.applyRental },
                { href: '/my-booking', label: CTA.rental.queryStatus },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm hover:text-white transition-colors" style={{ color: 'var(--dark-muted)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--gold)' }}>聯絡</p>
            <p className="text-sm leading-loose mb-4" style={{ color: 'var(--dark-muted)' }}>
              如需洽詢請透過租借申請表<br />
              或掃描現場 QR Code 聯繫我們
            </p>
            <a
              href="https://www.instagram.com/love_secondhand_charity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs tracking-widest hover:text-white transition-colors"
              style={{ color: 'var(--dark-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              愛物王公益 IG
            </a>
          </div>
        </div>
        <div
          className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs border-t"
          style={{ borderColor: 'var(--dark-border)', color: 'var(--dark-muted)' }}
        >
          <p>© {new Date().getFullYear()} 心宇宙商務中心 Heart Universe Business Center</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">隱私政策</Link>
            <Link href="/terms" className="hover:text-white transition-colors">服務條款</Link>
            <Link href="/admin" className="hover:text-white transition-colors opacity-40 hover:opacity-100">後台</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
