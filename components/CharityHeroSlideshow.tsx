'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const slides = [
  { src: '/charity/hero.jpg', alt: '愛物王二手公益商店室內入口與展示空間' },
  { src: '/charity/grid-1.jpg', alt: '愛物王二手公益商店精品展示區' },
  { src: '/charity/grid-3.jpg', alt: '愛物王二手公益商店室內全景' },
  { src: '/charity/grid-5.jpg', alt: '愛物王二手公益商店家居與生活用品展示區' },
]

export default function CharityHeroSlideshow() {
  const [active, setActive] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (reducedMotion || paused) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 7200)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion])

  return (
    <div
      className="hu-charity-hero-slideshow"
      aria-label="愛物王店內空間照片"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : 'lazy'}
          sizes="100vw"
          className={`hu-charity-hero-image hu-charity-hero-slide ${index === active ? 'is-active' : ''}`}
        />
      ))}
    </div>
  )
}
