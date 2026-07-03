'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Venue } from '@/lib/types'
import { Plus, Upload, Trash2, Eye, EyeOff } from 'lucide-react'

export default function VenuesAdminClient({ initialData }: { initialData: Venue[] }) {
  const [venues, setVenues] = useState(initialData)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', slug: '', description: '', capacity: '', equipment: '' })
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function slugify(v: string) {
    return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function createVenue() {
    const supabase = createClient()
    const { data } = await supabase.from('venues').insert({
      name: newForm.name,
      slug: newForm.slug || slugify(newForm.name),
      description: newForm.description || null,
      capacity: newForm.capacity ? parseInt(newForm.capacity) : null,
      equipment: newForm.equipment ? newForm.equipment.split('、').map(s => s.trim()) : null,
    }).select('*, venue_photos(id, image_url, sort_order)').single()
    if (data) {
      setVenues(v => [...v, data])
      setShowNew(false)
      setNewForm({ name: '', slug: '', description: '', capacity: '', equipment: '' })
    }
  }

  async function toggleActive(id: string, val: boolean) {
    const supabase = createClient()
    await supabase.from('venues').update({ is_active: val }).eq('id', id)
    setVenues(v => v.map(x => x.id === id ? { ...x, is_active: val } : x))
  }

  async function uploadPhoto(venueId: string, files: FileList | null) {
    if (!files?.length) return
    const supabase = createClient()
    for (const file of Array.from(files)) {
      const path = `venues/${venueId}/${Date.now()}-${file.name}`
      const { data: upload, error } = await supabase.storage.from('venues-photos').upload(path, file)
      if (error || !upload) continue
      const { data: url } = supabase.storage.from('venues-photos').getPublicUrl(upload.path)
      const { data: photo } = await supabase.from('venue_photos').insert({
        venue_id: venueId,
        image_url: url.publicUrl,
        sort_order: 0,
      }).select().single()
      if (photo) {
        setVenues(v => v.map(x => x.id === venueId
          ? { ...x, venue_photos: [...(x.venue_photos ?? []), photo] }
          : x
        ))
      }
    }
  }

  async function deletePhoto(venueId: string, photoId: string, imageUrl: string) {
    const supabase = createClient()
    const path = imageUrl.split('/venues-photos/')[1]
    if (path) await supabase.storage.from('venues-photos').remove([path])
    await supabase.from('venue_photos').delete().eq('id', photoId)
    setVenues(v => v.map(x => x.id === venueId
      ? { ...x, venue_photos: x.venue_photos?.filter(p => p.id !== photoId) }
      : x
    ))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 text-sm px-4 py-2 bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] transition-colors">
          <Plus size={14} /> 新增場地
        </button>
      </div>

      {showNew && (
        <div className="bg-[var(--cream)] border border-[var(--gold)] p-6">
          <p className="label-tag mb-4">新增場地</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { key: 'name', label: '場地名稱' },
              { key: 'slug', label: 'URL Slug（可留空自動產生）' },
              { key: 'capacity', label: '容納人數' },
              { key: 'equipment', label: '基本設備（以「、」分隔）' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-[var(--gray)] mb-1 block">{f.label}</label>
                <input className="w-full border border-[var(--border-color)] px-3 py-2 text-sm" value={newForm[f.key as keyof typeof newForm]} onChange={e => setNewForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--gray)] mb-1 block">場地介紹</label>
              <textarea rows={3} className="w-full border border-[var(--border-color)] px-3 py-2 text-sm resize-none" value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createVenue} className="px-4 py-2 bg-[var(--gold)] text-white text-sm hover:bg-[var(--gold-dark)]">新增</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 border border-[var(--border-color)] text-sm text-[var(--gray)]">取消</button>
          </div>
        </div>
      )}

      {venues.map(v => (
        <div key={v.id} className="bg-[var(--cream)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={() => setExpanded(e => e === v.id ? null : v.id)}>
            <div>
              <p className="text-sm font-medium">{v.name}</p>
              <p className="text-xs text-[var(--gray)] mt-0.5">容納 {v.capacity ?? '—'} 人 · 照片 {v.venue_photos?.length ?? 0} 張</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={e => { e.stopPropagation(); toggleActive(v.id, !v.is_active) }} className={`text-xs px-2 py-0.5 flex items-center gap-1 ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {v.is_active ? <><Eye size={11} /> 上架</> : <><EyeOff size={11} /> 下架</>}
              </button>
              <span className="text-xs text-[var(--gray)]">{expanded === v.id ? '▲' : '▼'}</span>
            </div>
          </div>

          {expanded === v.id && (
            <div className="border-t border-[var(--border-color)] p-6">
              <p className="label-tag mb-3">場地照片</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {(v.venue_photos ?? []).sort((a, b) => a.sort_order - b.sort_order).map(p => (
                  <div key={p.id} className="relative aspect-square bg-[var(--surface)] overflow-hidden">
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => deletePhoto(v.id, p.id, p.image_url)} className="absolute top-1 right-1 bg-white/80 p-0.5 hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <div
                  className="aspect-square border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--gold)] transition-colors"
                  onClick={() => fileRefs.current[v.id]?.click()}
                >
                  <Upload size={16} className="text-[var(--gray)]" />
                  <p className="text-[10px] text-[var(--gray)] mt-1">上傳</p>
                  <input ref={el => { fileRefs.current[v.id] = el }} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadPhoto(v.id, e.target.files)} />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
