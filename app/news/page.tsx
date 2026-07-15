import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ExternalLink, CalendarDays, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '活動新聞與連結',
  description: '心宇宙商務中心舉辦活動的新聞報導、媒體連結、IG 精選與活動回顧。',
}

function formatDate(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

export default async function NewsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, start_time, external_url, status, cover_image_url, organizer_name')
    .not('external_url', 'is', null)
    .order('start_time', { ascending: false })

  const withLinks = events?.filter(e => e.external_url) ?? []

  return (
    <div className="py-20">
      <div className="container-narrow mb-12">
        <p className="label-tag mb-4">News</p>
        <h1 className="text-4xl md:text-5xl mb-4">活動新聞與連結</h1>
        <p className="text-sm text-[var(--gray)] leading-relaxed">
          心宇宙商務中心舉辦的活動報導、媒體連結與精選回顧。
        </p>
        <div className="gold-divider" />
      </div>

      {!withLinks.length ? (
        <div className="container-narrow text-center py-20 text-[var(--gray)]">
          <p className="text-sm">目前暫無外部連結，請持續關注</p>
        </div>
      ) : (
        <div className="container-narrow flex flex-col divide-y divide-[var(--border-color)]">
          {withLinks.map(ev => (
            <div key={ev.id} className="py-6 flex items-start gap-6 group">
              <div className="flex-1 min-w-0">
                <p className="text-[var(--gold)] text-xs mb-1 flex items-center gap-1">
                  <CalendarDays size={11} /> {formatDate(ev.start_time)}
                  {ev.organizer_name && (
                    <span className="text-[var(--gray)] ml-2">· {ev.organizer_name}</span>
                  )}
                </p>
                <h2 className="text-base mb-2 leading-snug truncate">{ev.title}</h2>
                <div className="flex items-center gap-4">
                  <a
                    href={ev.external_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--gold)] hover:underline transition-colors"
                  >
                    <ExternalLink size={11} /> 查看連結
                  </a>
                  {ev.status !== 'draft' && (
                    <Link
                      href={`/events/${ev.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-[var(--gray)] hover:text-[var(--charcoal)] transition-colors"
                    >
                      活動詳情 <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
