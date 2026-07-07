'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Settings } from 'lucide-react'

const links = [
  { href: '/venues', label: '場地' },
  { href: '/availability', label: '可用時段' },
  { href: '/events', label: '活動課程' },
  { href: '/showcase', label: '活動回顧' },
  { href: '/rent', label: '租借申請' },
  { href: '/my-booking', label: '查詢申請' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b"
      style={{ background: 'rgba(237,228,212,0.97)', borderColor: 'var(--border-color)', backdropFilter: 'blur(12px)' }}
    >
      <div className="container-wide flex items-center justify-between h-16">

        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.svg?v=2"
            alt="心宇宙商務中心"
            width={52}
            height={52}
            priority
            style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 1px rgba(196,160,56,0.40))' }}
          />
          <div>
            <p className="font-serif text-sm leading-tight" style={{ color: 'var(--charcoal)', letterSpacing: '0.08em' }}>
              心宇宙商務中心
            </p>
            <p className="text-[9px] leading-tight" style={{ color: 'var(--gray)', letterSpacing: '0.25em' }}>
              HEART UNIVERSE · TAIPEI
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs tracking-widest transition-colors hover:text-[var(--charcoal)]"
              style={{ color: 'var(--gray)' }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rent"
            className="text-xs tracking-widest uppercase px-5 py-2 border transition-all hover:bg-[var(--gold)] hover:text-white"
            style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          >
            立即預約
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <Link href="/admin" aria-label="後台" style={{ color: 'var(--gray)', opacity: 0.35 }}>
            <Settings size={15} />
          </Link>
          <button
            style={{ color: 'var(--gray)' }}
            onClick={() => setOpen(!open)}
            aria-label="選單"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden px-6 py-6 flex flex-col gap-6 border-t"
          style={{ background: 'var(--cream)', borderColor: 'var(--border-color)' }}
        >
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm tracking-widest"
              style={{ color: 'var(--gray)' }}
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
