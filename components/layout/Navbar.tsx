'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/venues', label: '場地' },
  { href: '/events', label: '活動課程' },
  { href: '/rent', label: '租借申請' },
  { href: '/my-booking', label: '查詢申請' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b"
      style={{ background: 'rgba(13,10,5,0.94)', borderColor: 'var(--dark-border)' }}
    >
      <div className="container-wide flex items-center justify-between h-16">

        <Link href="/" className="flex items-center shrink-0" style={{ isolation: 'isolate' }}>
          <Image
            src="/logo.png"
            alt="心宇宙商務中心"
            width={52}
            height={52}
            priority
            style={{ mixBlendMode: 'screen' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs tracking-widest transition-colors hover:text-[var(--gold)]"
              style={{ color: 'var(--dark-muted)' }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rent"
            className="text-xs tracking-widest uppercase px-5 py-2 border transition-all hover:bg-[var(--gold)] hover:text-[#0D0A05]"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            立即預約
          </Link>
        </nav>

        <button
          className="md:hidden"
          style={{ color: 'var(--dark-muted)' }}
          onClick={() => setOpen(!open)}
          aria-label="選單"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden px-6 py-6 flex flex-col gap-6 border-t"
          style={{ background: '#0D0A05', borderColor: 'var(--dark-border)' }}
        >
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm tracking-widest"
              style={{ color: 'var(--dark-muted)' }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rent"
            onClick={() => setOpen(false)}
            className="text-xs tracking-widest uppercase px-5 py-2 border text-center"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            立即預約
          </Link>
        </div>
      )}
    </header>
  )
}
