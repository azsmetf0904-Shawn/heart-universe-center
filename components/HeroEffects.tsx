'use client'
import { useEffect } from 'react'

export function HeroEffects({ heroId }: { heroId: string; leftId?: string }) {
  useEffect(() => {
    const heroEl = document.getElementById(heroId)
    if (!heroEl) return

    const hero = heroEl

    // ── Mouse parallax ──
    const textEls = hero.querySelectorAll<HTMLElement>('[data-hp="text"]')
    const photoEls = hero.querySelectorAll<HTMLElement>('[data-hp="photo"]')

    function onMove(e: MouseEvent) {
      const r = hero.getBoundingClientRect()
      if (e.clientY < r.top || e.clientY > r.bottom) return
      const rx = (e.clientX / window.innerWidth - 0.5) * 14
      const ry = (e.clientY / window.innerHeight - 0.5) * 10
      textEls.forEach(el => { el.style.transform = `translate(${-rx * 0.4}px, ${-ry * 0.3}px)` })
      // Keep the parallax on the frame only. Scaling the frame here and the
      // image in CSS at the same time creates a soft, resampled photograph.
      photoEls.forEach(el => { el.style.transform = `translate3d(${rx * 0.38}px, ${ry * 0.3}px, 0)` })
    }

    document.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
    }
  }, [heroId])

  return null
}
