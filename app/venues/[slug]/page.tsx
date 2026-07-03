import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Users, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('venues').select('name, description').eq('slug', slug).single()
  return { title: data?.name ?? '場地詳情', description: data?.description ?? '' }
}

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: venue } = await supabase
    .from('venues')
    .select('*, venue_photos(image_url, sort_order)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!venue) notFound()

  const photos = (venue.venue_photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)

  return (
    <div className="py-20">
      <div className="container-narrow mb-10">
        <p className="label-tag mb-4">Venue</p>
        <h1 className="text-4xl md:text-5xl mb-4">{venue.name}</h1>
        <div className="gold-divider" />
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="container-wide mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {photos.map((p: { image_url: string; sort_order: number }, i: number) => (
              <div key={i} className={`aspect-video bg-[var(--surface)] overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}>
                <img src={p.image_url} alt={`${venue.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-narrow grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Info */}
        <div className="md:col-span-2">
          {venue.description && (
            <div className="mb-10">
              <p className="label-tag mb-3">空間介紹</p>
              <p className="text-sm text-[var(--gray)] leading-loose">{venue.description}</p>
            </div>
          )}
          {venue.equipment?.length > 0 && (
            <div className="mb-10">
              <p className="label-tag mb-3">基本設備</p>
              <div className="grid grid-cols-2 gap-2">
                {venue.equipment.map((eq: string) => (
                  <div key={eq} className="flex items-center gap-2 text-sm text-[var(--charcoal)]">
                    <CheckCircle2 size={14} className="text-[var(--gold)]" />
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mb-10">
            <p className="label-tag mb-3">租借須知</p>
            <ul className="text-sm text-[var(--gray)] leading-loose list-disc list-inside space-y-1">
              <li>申請後由工作人員確認時段可用性</li>
              <li>確認後告知費用，付款方式另行通知</li>
              <li>如需加購設備或人力，可於申請表選填</li>
              <li>取消請提前 3 天告知</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
            {venue.capacity && (
              <div className="flex items-center gap-2 text-sm mb-4">
                <Users size={14} className="text-[var(--gold)]" />
                <span>最多容納 <strong>{venue.capacity}</strong> 人</span>
              </div>
            )}
            <p className="text-xs text-[var(--gray)] leading-relaxed mb-6">
              申請後由工作人員與您確認時段，<br />不直接線上付款。
            </p>
            <Link
              href={`/rent?venue=${venue.slug}`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
            >
              申請租借 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
