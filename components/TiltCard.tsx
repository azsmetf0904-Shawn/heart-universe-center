'use client'
import { useRef, type ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  intensity?: number
  className?: string
  style?: React.CSSProperties
}

export function TiltCard({ children, intensity = 6, className = '', style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(800px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateY(-4px) scale(1.01)`
    el.style.boxShadow = `${-x * 12}px ${-y * 8}px 32px rgba(26,16,8,.12)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ willChange: 'transform', ...style }}
    >
      {children}
    </div>
  )
}
