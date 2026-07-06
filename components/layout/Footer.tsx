import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark-bg)', borderTop: '1px solid var(--dark-border)' }}>
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-base tracking-widest mb-4" style={{ color: 'var(--dark-text)' }}>
              心宇宙商務中心
            </h3>
            <div className="w-10 h-px mb-5" style={{ background: 'var(--gold)' }} />
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
                { href: '/rent', label: '租借申請' },
                { href: '/my-booking', label: '查詢申請狀態' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm hover:text-white transition-colors" style={{ color: 'var(--dark-muted)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--gold)' }}>聯絡</p>
            <p className="text-sm leading-loose" style={{ color: 'var(--dark-muted)' }}>
              如需洽詢請透過租借申請表<br />
              或掃描現場 QR Code 聯繫我們
            </p>
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
          </div>
        </div>
      </div>
    </footer>
  )
}
