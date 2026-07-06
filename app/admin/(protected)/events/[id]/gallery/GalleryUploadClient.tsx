'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EventPhoto } from '@/lib/types'
import { Upload, Trash2 } from 'lucide-react'

export default function GalleryUploadClient({
  eventId,
  initialPhotos,
}: {
  eventId: string
  initialPhotos: EventPhoto[]
}) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(files: FileList | null) {
    if (!files || !files.length) return
    setUploading(true)
    const supabase = createClient()
    for (const file of Array.from(files)) {
      const path = `events/${eventId}/${Date.now()}-${file.name}`
      const { data: upload, error } = await supabase.storage.from('event-gallery').upload(path, file)
      if (error || !upload) continue
      const { data: url } = supabase.storage.from('event-gallery').getPublicUrl(upload.path)
      const { data: photo } = await supabase.from('event_photos').insert({
        event_id: eventId,
        image_url: url.publicUrl,
        sort_order: photos.length,
      }).select().single()
      if (photo) setPhotos(p => [...p, photo])
    }
    setUploading(false)
  }

  async function saveCaption(id: string) {
    const supabase = createClient()
    const caption = captions[id] ?? ''
    await supabase.from('event_photos').update({ caption }).eq('id', id)
    setPhotos(p => p.map(ph => ph.id === id ? { ...ph, caption } : ph))
  }

  async function deletePhoto(id: string, imageUrl: string) {
    const supabase = createClient()
    const path = imageUrl.split('/event-gallery/')[1]
    if (path) await supabase.storage.from('event-gallery').remove([path])
    await supabase.from('event_photos').delete().eq('id', id)
    setPhotos(p => p.filter(ph => ph.id !== id))
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-[var(--border-color)] p-10 text-center cursor-pointer hover:border-[var(--gold)] transition-colors mb-8"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={24} className="text-[var(--gray)] mx-auto mb-3" />
        <p className="text-sm text-[var(--gray)]">{uploading ? '上傳中…' : '點擊或拖曳照片到此上傳'}</p>
        <p className="text-xs text-[var(--gray)] mt-1">支援 JPG、PNG、WebP</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleUpload(e.target.files)}
        />
      </div>

      {photos.length === 0 && (
        <p className="text-center text-sm text-[var(--gray)] py-10">尚未上傳照片</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map(p => (
          <div key={p.id} className="flex flex-col gap-2">
            <div className="relative aspect-square bg-[var(--surface)] overflow-hidden">
              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => deletePhoto(p.id, p.image_url)}
                className="absolute top-2 right-2 bg-white/80 p-1 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="圖片說明"
                defaultValue={p.caption ?? ''}
                onChange={e => setCaptions(c => ({ ...c, [p.id]: e.target.value }))}
                className="flex-1 border border-[var(--border-color)] px-2 py-1 text-xs focus:outline-none focus:border-[var(--gold)]"
              />
              <button onClick={() => saveCaption(p.id)} className="text-xs px-2 bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)]">存</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
