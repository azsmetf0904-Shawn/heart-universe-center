'use client'
import Link from 'next/link'
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
      <div className="container-wide flex items-center justify-between h-16">

        <Link href="/" className="flex items-center gap-3 group">
          {/* Circular logo placeholder — swap with <Image> once logo file is ready */}
          <div className="w-8 h-8 rounded-full border border-[var(--charcoal)] flex items-center justify-center shrink-0 transition-colors group-hover:border-[var(--gold)]">
            <span
              className="font-serif text-[13px] leading-none text-[var(--charcoal)] transition-colors group-hover:text-[var(--gold)] select-none"
            >心</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[15px] text-[var(--charcoal)] tracking-widest">心宇宙</span>
            <span className="text-[8px] tracking-[0.22em] text-[var(--gray)] uppercase">Business Center</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm tracking-widest text-[var(--charcoal)] hover:text-[var(--gold)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rent"
            className="text-xs tracking-widest uppercase px-5 py-2 border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white transition-all"
          >
            立即預約
          </Link>
        </nav>

        <button
          className="md:hidden text-[var(--charcoal)]"
          onClick={() => setOpen(!open)}
          aria-label="選單"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[var(--cream)] border-t border-[var(--border-color)] px-6 py-6 flex flex-col gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm tracking-widest text-[var(--charcoal)] hover:text-[var(--gold)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rent"
            onClick={() => setOpen(false)}
            className="text-xs tracking-widest uppercase px-5 py-2 border border-[var(--gold)] text-[var(--gold)] text-center"
          >
            立即預約
          </Link>
        </div>
      )}
    </header>
  )
}
