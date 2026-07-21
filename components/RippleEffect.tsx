'use client'
import { useEffect } from 'react'

const RIPPLE_TARGETS = '.btn-gold-fill, .btn-cta-ghost'

// Desktop flourish only. Checked live (not once on mount) so it also
// behaves correctly if a desktop window gets resized narrow.
const isDesktopViewport = () => window.matchMedia('(min-width: 768px)').matches

export function RippleEffect() {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!isDesktopViewport()) return
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(RIPPLE_TARGETS)
      if (!target) return

      const rect = target.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2.6
      const span = document.createElement('span')
      span.className = 'hu-ripple'
      span.style.width = `${size}px`
      span.style.height = `${size}px`
      span.style.left = `${e.clientX - rect.left - size / 2}px`
      span.style.top = `${e.clientY - rect.top - size / 2}px`

      target.appendChild(span)
      setTimeout(() => span.remove(), 800)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return null
}
