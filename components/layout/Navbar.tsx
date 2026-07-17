'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Settings, ChevronDown } from 'lucide-react'
import { CTA } from '@/lib/cta'

const mainLinks = [
  { href: '/venues', label: '場地介紹' },
  { href: '/events', label: '活動課程' },
  { href: '/charity', label: '二手公益', highlight: true },
  { href: '/rent', label: '租借申請' },
] as const

const moreLinks = [
  { href: '/community', label: '社群' },
  { href: '/availability', label: '可用時段' },
  { href: '/showcase', label: '活動回顧' },
  { href: '/news', label: '新聞連結' },
  { href: '/my-booking', label: '查詢申請狀態' },
] as const

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const desktopMoreRef = useRef<HTMLDivElement | null>(null)
  const mobileMoreRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      const target = e.target as Node
      const desktopInside = desktopMoreRef.current?.contains(target)
      const mobileInside = mobileMoreRef.current?.contains(target)
      if (!desktopInside && !mobileInside) setMoreOpen(false)
    }
    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-[background,box-shadow] duration-300 ${pathname === '/' ? 'hu-home-nav' : ''}`}
      style={{
        background: scrolled ? 'rgba(218,208,190,0.99)' : 'rgba(237,228,212,0.97)',
        borderColor: 'var(--border-color)',
        boxShadow: scrolled ? '0 2px 20px rgba(26,16,8,0.08)' : 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="container-wide flex items-center justify-between h-16">

        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo-new.png"
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
          {mainLinks.map(l => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-xs tracking-widest transition-colors hover:text-[var(--charcoal)]"
                style={{ color: ('highlight' in l && l.highlight) ? 'var(--gold)' : isActive ? 'var(--charcoal)' : 'var(--gray)' }}
              >
                {l.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px" style={{ background: 'var(--gold)' }} />
                )}
              </Link>
            )
          })}
          <div
            ref={desktopMoreRef}
            className="relative"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMoreOpen(v => !v)}
              className="text-xs tracking-widest transition-colors hover:text-[var(--charcoal)] inline-flex items-center gap-1"
              style={{ color: 'var(--gray)' }}
            >
              更多 <ChevronDown size={10} />
            </button>
            {moreOpen && (
              <div
                className="absolute right-0 top-full mt-3 min-w-[140px] rounded-lg border py-2 shadow-lg"
                style={{ background: 'var(--cream)', borderColor: 'var(--border-color)' }}
              >
                {moreLinks.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-xs tracking-widest transition-colors hover:bg-[var(--surface)] hover:text-[var(--charcoal)]"
                    style={{ color: 'var(--gray)' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/rent"
            className="btn-gold-fill text-xs tracking-widest uppercase px-5 py-2"
          >
            {CTA.home.startRental}
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
          className="hu-mobile-menu md:hidden px-6 py-6 flex flex-col gap-6 border-t"
          style={{ background: 'var(--cream)', borderColor: 'var(--border-color)' }}
        >
          {mainLinks.map(l => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => { setOpen(false); setMoreOpen(false) }}
                className="text-sm tracking-widest"
                style={{ color: ('highlight' in l && l.highlight) ? 'var(--gold)' : isActive ? 'var(--charcoal)' : 'var(--gray)' }}
              >
                {('highlight' in l && l.highlight) ? `♡ ${l.label}` : l.label}
              </Link>
            )
          })}
          <div ref={mobileMoreRef} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setMoreOpen(v => !v)}
              className="text-sm tracking-widest inline-flex items-center gap-1"
              style={{ color: 'var(--gray)' }}
            >
              更多 <ChevronDown size={10} />
            </button>
            {moreOpen && (
              <div className="flex flex-col gap-4 pl-4 -mt-2">
                {moreLinks.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => {
                      setOpen(false)
                      setMoreOpen(false)
                    }}
                    className="text-sm tracking-widest"
                    style={{ color: 'var(--gray)' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/rent"
            onClick={() => {
              setOpen(false)
              setMoreOpen(false)
            }}
            className="btn-gold-fill text-xs tracking-widest uppercase px-5 py-2.5 text-center"
          >
            {CTA.home.startRental}
          </Link>
        </div>
      )}
    </header>
  )
}
