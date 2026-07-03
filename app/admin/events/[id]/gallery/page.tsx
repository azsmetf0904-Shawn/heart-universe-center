import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GalleryUploadClient from './GalleryUploadClient'

export default async function AdminGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: event }, { data: photos }] = await Promise.all([
    supabase.from('events').select('title').eq('id', id).single(),
    supabase.from('event_photos').select('*').eq('event_id', id).order('sort_order'),
  ])
  if (!event) notFound()
  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-2">{event.title}</h1>
      <p className="text-sm text-[var(--gray)] mb-8">活動回顧照片</p>
      <GalleryUploadClient eventId={id} initialPhotos={photos ?? []} />
    </div>
  )
}
