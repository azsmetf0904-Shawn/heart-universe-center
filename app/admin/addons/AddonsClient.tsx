'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { VenueAddon, AddonCategory } from '@/lib/types'
import { ADDON_CATEGORY_LABEL } from '@/lib/types'
import { Plus, Pencil, Check, X } from 'lucide-react'

const UNITS = [
  { value: 'per_session', label: '/場' },
  { value: 'per_hour', label: '/小時' },
  { value: 'per_person', label: '/人' },
  { value: 'per_unit', label: '/個' },
]

type EditRow = Partial<VenueAddon> & { isNew?: boolean }

export default function AddonsClient({ initialData }: { initialData: VenueAddon[] }) {
  const [addons, setAddons] = useState(initialData)
  const [editing, setEditing] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<EditRow>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newRow, setNewRow] = useState<EditRow>({
    name: '', category: 'equipment', description: '', price: 0,
    unit: 'per_session', quantity: undefined, is_available: true, sort_order: 0,
  })

  const supabase = createClient()

  async function saveEdit(id: string) {
    await supabase.from('venue_addons').update({
      name: editRow.name,
      description: editRow.description,
      price: editRow.price,
      unit: editRow.unit,
      quantity: editRow.quantity ?? null,
      is_available: editRow.is_available,
      sort_order: editRow.sort_order,
    }).eq('id', id)
    setAddons(a => a.map(x => x.id === id ? { ...x, ...editRow } as VenueAddon : x))
    setEditing(null)
  }

  async function addNew() {
    const { data } = await supabase.from('venue_addons').insert({
      name: newRow.name,
      category: newRow.category,
      description: newRow.description || null,
      price: newRow.price ?? 0,
      unit: newRow.unit ?? 'per_session',
      quantity: newRow.quantity ?? null,
      is_available: true,
      sort_order: newRow.sort_order ?? 0,
    }).select().single()
    if (data) {
      setAddons(a => [...a, data])
      setShowAdd(false)
      setNewRow({ name: '', category: 'equipment', description: '', price: 0, unit: 'per_session', quantity: undefined, is_available: true, sort_order: 0 })
    }
  }

  async function toggleAvailable(id: string, val: boolean) {
    await supabase.from('venue_addons').update({ is_available: val }).eq('id', id)
    setAddons(a => a.map(x => x.id === id ? { ...x, is_available: val } : x))
  }

  const grouped = (Object.keys(ADDON_CATEGORY_LABEL) as AddonCategory[]).map(cat => ({
    cat,
    items: addons.filter(a => a.category === cat),
  })).filter(g => g.items.length > 0)

  function EditableRow({ a }: { a: VenueAddon }) {
    const isEdit = editing === a.id
    return (
      <tr className="border-t border-[var(--border-color)]">
        <td className="py-3 px-4 text-sm">
          {isEdit ? <input className="border border-[var(--border-color)] px-2 py-1 text-sm w-full" value={editRow.name ?? ''} onChange={e => setEditRow(p => ({ ...p, name: e.target.value }))} /> : a.name}
        </td>
        <td className="py-3 px-4 text-sm text-[var(--gray)]">
          {isEdit ? <input type="number" className="border border-[var(--border-color)] px-2 py-1 text-sm w-20" value={editRow.price ?? 0} onChange={e => setEditRow(p => ({ ...p, price: parseFloat(e.target.value) }))} /> : `NT$ ${a.price.toLocaleString()}`}
        </td>
        <td className="py-3 px-4 text-sm text-[var(--gray)]">
          {isEdit
            ? <select className="border border-[var(--border-color)] px-2 py-1 text-xs" value={editRow.unit ?? 'per_session'} onChange={e => setEditRow(p => ({ ...p, unit: e.target.value as VenueAddon['unit'] }))}>
                {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            : UNITS.find(u => u.value === a.unit)?.label
          }
        </td>
        <td className="py-3 px-4 text-sm text-[var(--gray)]">
          {isEdit ? <input type="number" className="border border-[var(--border-color)] px-2 py-1 text-sm w-16" placeholder="不限" value={editRow.quantity ?? ''} onChange={e => setEditRow(p => ({ ...p, quantity: e.target.value ? parseInt(e.target.value) : undefined }))} /> : (a.quantity ?? '不限')}
        </td>
        <td className="py-3 px-4">
          <button onClick={() => toggleAvailable(a.id, !a.is_available)} className={`text-xs px-2 py-0.5 ${a.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {a.is_available ? '上架' : '下架'}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {isEdit
              ? <>
                  <button onClick={() => saveEdit(a.id)} className="text-[var(--gold)]"><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} className="text-[var(--gray)]"><X size={14} /></button>
                </>
              : <button onClick={() => { setEditing(a.id); setEditRow({ ...a }) }} className="text-[var(--gray)] hover:text-[var(--gold)]"><Pencil size={13} /></button>
            }
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] transition-colors"
        >
          <Plus size={14} /> 新增品項
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--cream)] border border-[var(--gold)] p-6">
          <p className="label-tag mb-4">新增加購品項</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {[
              { key: 'name', label: '品項名稱', type: 'text' },
              { key: 'description', label: '說明', type: 'text' },
              { key: 'price', label: '單價', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-[var(--gray)] mb-1 block">{f.label}</label>
                <input type={f.type} className="w-full border border-[var(--border-color)] px-3 py-2 text-sm" value={String(newRow[f.key as keyof EditRow] ?? '')} onChange={e => setNewRow(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-xs text-[var(--gray)] mb-1 block">分類</label>
              <select className="w-full border border-[var(--border-color)] px-3 py-2 text-sm" value={newRow.category ?? 'equipment'} onChange={e => setNewRow(p => ({ ...p, category: e.target.value as AddonCategory }))}>
                {(Object.entries(ADDON_CATEGORY_LABEL) as [AddonCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--gray)] mb-1 block">計費單位</label>
              <select className="w-full border border-[var(--border-color)] px-3 py-2 text-sm" value={newRow.unit ?? 'per_session'} onChange={e => setNewRow(p => ({ ...p, unit: e.target.value as VenueAddon['unit'] }))}>
                {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--gray)] mb-1 block">庫存數量（空白=不限）</label>
              <input type="number" className="w-full border border-[var(--border-color)] px-3 py-2 text-sm" value={newRow.quantity ?? ''} onChange={e => setNewRow(p => ({ ...p, quantity: e.target.value ? parseInt(e.target.value) : undefined }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addNew} className="px-4 py-2 bg-[var(--gold)] text-white text-sm hover:bg-[var(--gold-dark)] transition-colors">新增</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[var(--border-color)] text-sm text-[var(--gray)] hover:border-[var(--charcoal)]">取消</button>
          </div>
        </div>
      )}

      {grouped.map(({ cat, items }) => (
        <div key={cat}>
          <p className="label-tag mb-3">{ADDON_CATEGORY_LABEL[cat]}</p>
          <div className="bg-[var(--cream)] border border-[var(--border-color)] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--surface)]">
                  {['品項', '單價', '單位', '數量', '狀態', ''].map(h => (
                    <th key={h} className="text-left py-2 px-4 text-xs text-[var(--gray)] font-normal tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(a => <EditableRow key={a.id} a={a} />)}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
