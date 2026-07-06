import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ShowcaseClient } from './ShowcaseClient'
import type { PastEvent } from './ShowcaseClient'

export const metadata: Metadata = {
  title: '活動回顧 | 心宇宙商務中心',
  description: '過去在心宇宙舉辦的活動精彩回顧，企業培訓、工作坊、品牌發表、社群聚會一覽。',
}

export default async function ShowcasePage() {
  const supabase = await createClient()

  const { data: rawEvents } = await supabase
    .from('events')
    .select('id, title, slug, start_time, organizer_name, cover_image_url, category, event_photos(image_url, caption, sort_order), venue:venues(name)')
    .eq('status', 'published')
    .lt('start_time', new Date().toISOString())
    .order('start_time', { ascending: false })

  type Photo = { image_url: string; caption: string | null; sort_order: number }

  const events: PastEvent[] = (rawEvents ?? [])
    .map((e: any) => ({
      ...e,
      event_photos: (e.event_photos ?? []).sort((a: Photo, b: Photo) => a.sort_order - b.sort_order),
      venue: Array.isArray(e.venue) ? (e.venue[0] ?? null) : (e.venue ?? null),
    }))
    .filter((e: PastEvent) => e.cover_image_url || e.event_photos.length > 0)

  return (
    <>
      {/* Page header */}
      <section style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-color)', padding: '80px 0 56px' }}>
        <div className="container-narrow">
          <p className="label-tag mb-4">Showcase</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: 'var(--charcoal)', letterSpacing: '0.05em' }}>
            活動回顧
          </h1>
          <div className="gold-divider" />
          <p className="text-sm leading-loose mt-6" style={{ color: 'var(--gray)', letterSpacing: '0.06em' }}>
            心宇宙曾舉辦的精彩活動紀錄，每一場都有它獨特的故事。
          </p>
        </div>
      </section>

      {events.length === 0 ? (
        <section className="py-40 text-center" style={{ background: 'var(--cream)' }}>
          <p className="text-sm" style={{ color: 'var(--gray)' }}>活動回顧整理中，敬請期待</p>
        </section>
      ) : (
        <ShowcaseClient events={events} />
      )}

      {/* CTA */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-color)', padding: '64px 0' }}>
        <div className="container-narrow text-center">
          <p className="font-serif text-2xl mb-3" style={{ color: 'var(--charcoal)' }}>想在這裡舉辦您的活動？</p>
          <p className="text-sm mb-8" style={{ color: 'var(--gray)', letterSpacing: '0.06em' }}>填寫租借申請，一個工作日內確認</p>
          <Link href="/rent" className="btn-gold-fill text-xs tracking-widest px-12 py-3">
            立即申請
          </Link>
        </div>
      </section>
    </>
  )
}
