'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['課程', '講座', '工作坊', '社群活動', '其他']

interface Props {
  venues: { id: string; name: string }[]
  initial?: {
    id: string; title: string; slug: string; description: string; venue_id: string
    organizer_name: string; start_time: string; end_time: string
    price: number; is_paid: boolean; capacity: number | null; status: string
    external_url: string | null; category: string | null
  }
}

export default function EventForm({ venues, initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    venue_id: initial?.venue_id ?? '',
    organizer_name: initial?.organizer_name ?? '',
    start_time: initial?.start_time?.slice(0, 16) ?? '',
    end_time: initial?.end_time?.slice(0, 16) ?? '',
    price: String(initial?.price ?? 0),
    is_paid: initial?.is_paid ?? false,
    capacity: String(initial?.capacity ?? ''),
    status: initial?.status ?? 'draft',
    external_url: initial?.external_url ?? '',
    category: initial?.category ?? CATEGORIES[0],
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function slugify(v: string) {
    return v.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9一-鿿-]/g, '').slice(0, 60)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    const supabase = createClient()
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || null,
      venue_id: form.venue_id || null,
      organizer_name: form.organizer_name || null,
      start_time: form.start_time,
      end_time: form.end_time,
      price: parseFloat(form.price) || 0,
      is_paid: form.is_paid,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      status: form.status,
      external_url: form.external_url || null,
      category: form.category || null,
    }
    const { error } = initial
      ? await supabase.from('events').update(payload).eq('id', initial.id)
      : await supabase.from('events').insert(payload)
    setSaving(false)
    if (error) {
      console.error('[admin/events] save failed:', error)
      setSaveError('儲存失敗，請確認欄位後再試一次。')
      return
    }
    router.push('/admin/events')
    router.refresh()
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'title', label: '活動名稱', type: 'text' },
          { key: 'slug', label: 'URL Slug（自動產生可留空）', type: 'text' },
          { key: 'organizer_name', label: '主辦單位', type: 'text' },
          { key: 'start_time', label: '開始時間', type: 'datetime-local' },
          { key: 'end_time', label: '結束時間', type: 'datetime-local' },
          { key: 'capacity', label: '名額上限（留空=不限）', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-[var(--gray)] mb-1 block">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form] as string}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-[var(--gray)] mb-1 block">分類</label>
        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-[var(--gray)] mb-1 block">場地</label>
        <select value={form.venue_id} onChange={e => setForm(p => ({ ...p, venue_id: e.target.value }))} className="w-full border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]">
          <option value="">不指定</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="is_paid" checked={form.is_paid} onChange={e => setForm(p => ({ ...p, is_paid: e.target.checked }))} className="accent-[var(--gold)]" />
        <label htmlFor="is_paid" className="text-sm">收費活動</label>
        {form.is_paid && (
          <div className="ml-4">
            <input type="number" placeholder="費用" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="border border-[var(--border-color)] px-3 py-1 text-sm w-28 focus:outline-none focus:border-[var(--gold)]" />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-[var(--gray)] mb-1 block">外部連結（IG、報名頁、媒體報導等）</label>
        <input
          type="url"
          placeholder="https://"
          value={form.external_url}
          onChange={e => setForm(p => ({ ...p, external_url: e.target.value }))}
          className="w-full border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-[var(--gray)] mb-1 block">活動介紹</label>
        <textarea rows={5} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)] resize-none" />
      </div>

      <div>
        <label className="text-xs text-[var(--gray)] mb-1 block">狀態</label>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]">
          <option value="draft">草稿</option>
          <option value="published">發布</option>
          <option value="ended">已結束</option>
        </select>
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[var(--gold)] text-white text-sm hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50">
          {saving ? '儲存中…' : '儲存'}
        </button>
        <button onClick={() => router.back()} className="px-6 py-2.5 border border-[var(--border-color)] text-sm text-[var(--gray)] hover:border-[var(--charcoal)] transition-colors">
          取消
        </button>
      </div>
    </div>
  )
}
