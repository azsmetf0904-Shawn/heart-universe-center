'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center container-narrow py-24">
        <p className="label-tag mb-6">Error</p>
        <h1 className="font-serif text-4xl text-[var(--charcoal)] mb-4">發生了一點問題</h1>
        <div className="gold-divider mx-auto" />
        <p className="text-[var(--gray)] text-sm mt-6 mb-10 leading-relaxed">
          頁面載入時遇到錯誤，請稍後再試。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
          >
            重新載入
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 border border-[var(--border-color)] text-[var(--gray)] text-sm tracking-widest hover:border-[var(--charcoal)] hover:text-[var(--charcoal)] transition-all"
          >
            回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}
