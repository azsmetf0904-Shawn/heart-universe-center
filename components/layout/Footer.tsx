import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[var(--charcoal)] text-white/60 mt-24">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-white text-lg tracking-widest mb-4">心宇宙商務中心</h3>
            <div className="gold-divider" />
            <p className="text-sm leading-relaxed mt-4">
              台北市八德路<br />
              精品場地租借 × 活動課程
            </p>
          </div>
          <div>
            <p className="label-tag mb-4" style={{ color: 'var(--gold-light)' }}>導覽</p>
            <div className="flex flex-col gap-3">
              {[
                { href: '/venues', label: '場地介紹' },
                { href: '/events', label: '活動課程' },
                { href: '/rent', label: '租借申請' },
                { href: '/my-booking', label: '查詢申請狀態' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="label-tag mb-4" style={{ color: 'var(--gold-light)' }}>聯絡</p>
            <p className="text-sm leading-loose">
              如需洽詢請透過租借申請表<br />
              或掃描現場 QR Code 聯繫我們
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} 心宇宙商務中心 Heart Universe Business Center</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">隱私政策</Link>
            <Link href="/terms" className="hover:text-white transition-colors">服務條款</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
