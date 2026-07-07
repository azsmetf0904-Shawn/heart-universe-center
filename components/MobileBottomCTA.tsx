'use client'
import Link from 'next/link'

export function MobileBottomCTA() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex gap-0"
      style={{
        background: '#1C1008',
        borderTop: '1px solid rgba(196,160,56,0.2)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Link
        href="/rent"
        className="flex-[2] text-center text-xs tracking-widest py-4"
        style={{ background: '#C4A038', color: '#fff' }}
      >
        立即申請租借
      </Link>
      <Link
        href="/availability"
        className="flex-1 text-center text-[10px] tracking-wider py-4"
        style={{ color: 'rgba(255,255,255,0.6)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
      >
        查詢時段
      </Link>
    </div>
  )
}
