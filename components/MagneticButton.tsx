'use client'
import Link from 'next/link'
import { useRef, type ReactNode } from 'react'

export function MagneticButton({
  href,
  children,
  style,
}: {
  href: string
  children: ReactNode
  style?: React.CSSProperties
}) {
  const wrapRef = useRef<HTMLDivElement>(null)

  function link() {
    return wrapRef.current?.querySelector('a') as HTMLAnchorElement | null
  }

  return (
    <div
      ref={wrapRef}
      style={{ display: 'inline-block' }}
      onMouseMove={e => {
        const a = link()
        const w = wrapRef.current
        if (!a || !w) return
        const r = w.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.35
        const y = (e.clientY - r.top - r.height / 2) * 0.35
        a.style.transition = 'transform .1s linear'
        a.style.transform = `translate(${x}px, ${y}px)`
      }}
      onMouseLeave={() => {
        const a = link()
        if (!a) return
        a.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)'
        a.style.transform = 'translate(0,0)'
      }}
    >
      <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
        {children}
      </Link>
    </div>
  )
}
