import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('title').eq('slug', slug).single()
  return { title: `${data?.title ?? ''} 活動回顧` }
}

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*, event_photos(image_url, caption, sort_order)')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const photos = (event.event_photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)

  return (
    <div className="py-20">
      <div className="container-narrow mb-12">
        <p className="label-tag mb-4">Gallery</p>
        <h1 className="text-3xl md:text-4xl mb-2">{event.title}</h1>
        <p className="text-[var(--gray)] text-sm mb-4">活動回顧</p>
        <div className="gold-divider" />
      </div>

      {!photos.length ? (
        <div className="container-narrow text-center py-20 text-[var(--gray)]">
          <p className="text-sm">回顧照片整理中，敬請期待</p>
        </div>
      ) : (
        <div className="container-wide grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((p: { image_url: string; caption: string | null; sort_order: number }, i: number) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-square bg-[var(--surface)] overflow-hidden relative">
                <Image
                  src={p.image_url}
                  alt={p.caption ?? `照片 ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
              </div>
              {p.caption && (
                <p className="text-xs text-[var(--gray)] mt-2 px-1">{p.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
