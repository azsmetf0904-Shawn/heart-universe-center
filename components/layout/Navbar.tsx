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

function LogoMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Circle frame */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="var(--charcoal)" strokeWidth="2"/>

      {/* 4-pointed star at top */}
      <path
        d="M100 12L102.4 18.2L109 20L102.4 21.8L100 28L97.6 21.8L91 20L97.6 18.2Z"
        fill="var(--gold)"
      />

      {/* Heart trunk — filled silhouette */}
      <path
        d="M96 162 L96 132
           Q83 127 74 117 Q65 107 67 97 Q69 87 79 88 Q89 89 95 97
           L100 92
           L105 97
           Q111 89 121 88 Q131 87 133 97 Q135 107 126 117 Q117 127 104 132
           L104 162 Z"
        fill="var(--charcoal)"
      />

      {/* Left branches */}
      <path d="M93 100 Q78 93 55 88"   stroke="var(--charcoal)" strokeWidth="5"   strokeLinecap="round" fill="none"/>
      <path d="M95 96  Q78 82 62 65"   stroke="var(--charcoal)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M97 94  Q88 76 84 56"   stroke="var(--charcoal)" strokeWidth="4"   strokeLinecap="round" fill="none"/>

      {/* Right branches */}
      <path d="M107 100 Q122 93 145 88" stroke="var(--charcoal)" strokeWidth="5"   strokeLinecap="round" fill="none"/>
      <path d="M105 96  Q122 82 138 65" stroke="var(--charcoal)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M103 94  Q112 76 116 56" stroke="var(--charcoal)" strokeWidth="4"   strokeLinecap="round" fill="none"/>

      {/* Center branch */}
      <path d="M100 92 Q100 74 100 55"  stroke="var(--charcoal)" strokeWidth="4"   strokeLinecap="round" fill="none"/>

      {/* Leaf clusters */}
      <ellipse cx="47"  cy="84" rx="21" ry="14" fill="var(--leaf)" transform="rotate(-22 47 84)"/>
      <ellipse cx="57"  cy="59" rx="18" ry="13" fill="var(--leaf)" transform="rotate(-14 57 59)"/>
      <ellipse cx="81"  cy="47" rx="17" ry="13" fill="var(--leaf)"/>
      <ellipse cx="100" cy="43" rx="19" ry="13" fill="var(--leaf)"/>
      <ellipse cx="119" cy="47" rx="17" ry="13" fill="var(--leaf)"/>
      <ellipse cx="143" cy="59" rx="18" ry="13" fill="var(--leaf)" transform="rotate(14 143 59)"/>
      <ellipse cx="153" cy="84" rx="21" ry="14" fill="var(--leaf)" transform="rotate(22 153 84)"/>
      <ellipse cx="69"  cy="50" rx="16" ry="12" fill="var(--leaf)" transform="rotate(-8 69 50)"/>
      <ellipse cx="131" cy="50" rx="16" ry="12" fill="var(--leaf)" transform="rotate(8 131 50)"/>
      <ellipse cx="100" cy="56" rx="17" ry="12" fill="var(--leaf)"/>
      <ellipse cx="78"  cy="64" rx="15" ry="11" fill="var(--leaf)"/>
      <ellipse cx="122" cy="64" rx="15" ry="11" fill="var(--leaf)"/>
    </svg>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
      <div className="container-wide flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-base text-[var(--charcoal)] tracking-widest">心宇宙</span>
            <span className="text-[10px] tracking-[0.2em] text-[var(--gray)] uppercase">Business Center</span>
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

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--cream)] border-t border-[var(--border-color)] px-6 py-6 flex flex-col gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm tracking-widest text-[var(--charcoal)]"
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
