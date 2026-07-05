import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center container-narrow py-24">
        <p className="label-tag mb-6">404</p>
        <h1 className="font-serif text-5xl md:text-7xl text-[var(--charcoal)] mb-4">頁面不存在</h1>
        <div className="gold-divider mx-auto" />
        <p className="text-[var(--gray)] text-sm mt-6 mb-10 leading-relaxed">
          您查詢的頁面已移除或網址有誤。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
          >
            回到首頁 <ArrowRight size={14} />
          </Link>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--charcoal)] text-[var(--charcoal)] text-sm tracking-widest hover:bg-[var(--charcoal)] hover:text-white transition-all"
          >
            瀏覽場地
          </Link>
        </div>
      </div>
    </div>
  )
}
