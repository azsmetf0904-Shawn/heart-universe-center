import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '場地介紹' }

export default async function VenuesPage() {
  const supabase = await createClient()
  const { data: venues } = await supabase
    .from('venues')
    .select('*, venue_photos(image_url, sort_order)')
    .eq('is_active', true)
    .order('created_at')

  return (
    <div className="py-20">
      <div className="container-narrow mb-16">
        <p className="label-tag mb-4">Venue</p>
        <h1 className="text-4xl md:text-5xl mb-4">場地介紹</h1>
        <div className="gold-divider" />
        <p className="text-[var(--gray)] text-sm mt-6 max-w-lg leading-relaxed">
          多功能精品空間，適合各類活動需求。歡迎洽詢客製化佈置方案。
        </p>
      </div>

      {!venues?.length ? (
        <div className="container-narrow text-center py-20 text-[var(--gray)]">
          <p className="text-sm">場地資訊整理中，敬請期待</p>
        </div>
      ) : (
        <div className="container-wide grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map(v => {
            const cover = v.venue_photos?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)[0]?.image_url
            return (
              <Link
                key={v.id}
                href={`/venues/${v.slug}`}
                className="group bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden hover:border-[var(--gold)] hover:shadow-[0_16px_40px_rgba(26,16,8,0.10)] hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300"
              >
                <div className="relative aspect-video bg-[var(--surface)] overflow-hidden">
                  {cover
                    ? <Image src={cover} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                    : <div className="w-full h-full flex items-center justify-center text-[var(--gray)] text-xs tracking-widest">PHOTO</div>
                  }
                </div>
                <div className="p-6">
                  <h2 className="text-xl mb-2">{v.name}</h2>
                  {v.capacity && (
                    <div className="flex items-center gap-1 text-[var(--gray)] text-xs mb-3">
                      <Users size={12} /> 最多 {v.capacity} 人
                    </div>
                  )}
                  {v.description && (
                    <p className="text-sm text-[var(--gray)] leading-relaxed line-clamp-2 mb-4">{v.description}</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--gold)] tracking-widest group-hover:gap-3 transition-all">
                    查看詳情 <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
