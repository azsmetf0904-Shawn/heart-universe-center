import { createClient } from '@/lib/supabase/server'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CTA } from '@/lib/cta'

export const metadata = {
  title: '場地可用時段查詢 | 心宇宙商務中心',
  description: '查詢心宇宙商務中心多功能大廳的可預約時段，早場、午場、晚場一目瞭然。',
}

export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('created_at')
    .limit(1)

  const venue = venues?.[0] ?? null

  return (
    <>
      {/* Header */}
      <section
        className="pt-28 pb-12 text-center"
        style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="container-narrow">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
            Availability
          </p>
          <h1 className="font-serif text-4xl mb-4" style={{ color: 'var(--charcoal)' }}>
            場地可用時段查詢
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--gold)', letterSpacing: '0.05em' }}>
            選擇一個可用日期，可直接進入申請表單
          </p>
          <p className="text-sm leading-loose" style={{ color: 'var(--gray)', letterSpacing: '0.06em' }}>
            點選日期可查看早場、午場、晚場的預約狀況
          </p>
        </div>
      </section>

      {/* Calendar */}
      <section className="py-16" style={{ background: 'var(--card-bg)' }}>
        <div className="container-narrow">
          {venue ? (
            <AvailabilityCalendar venueId={venue.id} />
          ) : (
            <p className="text-center text-sm py-16" style={{ color: 'var(--gray)' }}>
              場地資訊載入中，請稍後
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-12 text-center"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-color)' }}
      >
        <div className="container-narrow">
          <p className="text-sm mb-6" style={{ color: 'var(--gray)', letterSpacing: '0.05em' }}>
            確認好日期與時段後，填寫租借申請表，我們將於一個工作日內回覆
          </p>
          <Link
            href="/rent"
            className="btn-gold-fill inline-flex items-center gap-2 text-xs tracking-widest px-10 py-3"
          >
            {CTA.venue.applyFromAvailability} <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </>
  )
}
