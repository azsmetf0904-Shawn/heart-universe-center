'use client'
import { useEffect, useRef } from 'react'

export function ScrollRevealSection({
  children,
  className = '',
  delay = 0,
  style,
  shimmer = false,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
  /** Play a single gold light sweep once the card finishes revealing. */
  shimmer?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function playShimmer() {
      if (!shimmer || !el) return
      const sweep = document.createElement('div')
      sweep.className = 'hu-shimmer-sweep'
      el.appendChild(sweep)
      setTimeout(() => sweep.remove(), 950)
    }

    // Check if element is already in viewport (above the fold) — skip animation
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(22px)'
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          setTimeout(playShimmer, 650 + delay)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, shimmer])

  return (
    <div
      ref={ref}
      className={className}
      style={shimmer ? { position: 'relative', overflow: 'hidden', ...style } : style}
    >
      {children}
    </div>
  )
}
