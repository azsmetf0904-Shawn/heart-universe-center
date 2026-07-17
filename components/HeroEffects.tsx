'use client'
import { useEffect } from 'react'

export function HeroEffects({ heroId, leftId }: { heroId: string; leftId: string }) {
  useEffect(() => {
    const heroEl = document.getElementById(heroId)
    const leftEl = document.getElementById(leftId)
    if (!heroEl || !leftEl) return

    // ── Gold particles ──
    const left = leftEl
    const hero = heroEl

    const kf = document.createElement('style')
    kf.textContent =
      '@keyframes hu-float{0%{opacity:0;transform:translateY(0) translateX(0)}10%{opacity:.65}90%{opacity:.22}100%{opacity:0;transform:translateY(-120vh) translateX(var(--dx))}}'
    document.head.appendChild(kf)

    const alive: HTMLDivElement[] = []
    function spawn() {
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1
      const dx = (Math.random() - 0.5) * 80
      const dur = Math.random() * 6 + 5
      const delay = Math.random() * 4
      p.style.cssText = `position:absolute;border-radius:50%;background:#C4A038;pointer-events:none;z-index:1;width:${size}px;height:${size}px;left:${Math.random() * 80 + 5}%;bottom:-10px;opacity:0;--dx:${dx}px;animation:hu-float ${dur}s ${delay}s ease-in infinite;`
      left.appendChild(p)
      alive.push(p)
      setTimeout(() => {
        p.remove()
        const i = alive.indexOf(p)
        if (i > -1) alive.splice(i, 1)
      }, (dur + delay) * 1000 * 2)
    }
    for (let i = 0; i < 12; i++) spawn()
    const ticker = setInterval(spawn, 1200)

    // ── Mouse parallax ──
    const textEls = hero.querySelectorAll<HTMLElement>('[data-hp="text"]')
    const photoEls = hero.querySelectorAll<HTMLElement>('[data-hp="photo"]')

    function onMove(e: MouseEvent) {
      const r = hero.getBoundingClientRect()
      if (e.clientY < r.top || e.clientY > r.bottom) return
      const rx = (e.clientX / window.innerWidth - 0.5) * 14
      const ry = (e.clientY / window.innerHeight - 0.5) * 10
      textEls.forEach(el => { el.style.transform = `translate(${-rx * 0.4}px, ${-ry * 0.3}px)` })
      photoEls.forEach(el => { el.style.transform = `scale(1.04) translate(${rx * 0.6}px, ${ry * 0.5}px)` })
    }

    document.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      clearInterval(ticker)
      document.removeEventListener('mousemove', onMove)
      try { document.head.removeChild(kf) } catch {}
      alive.forEach(p => p.remove())
    }
  }, [heroId, leftId])

  return null
}
