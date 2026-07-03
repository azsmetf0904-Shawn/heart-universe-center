'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RentalRequest, RentalStatus } from '@/lib/types'
import { RENTAL_STATUS_LABEL } from '@/lib/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_COLORS: Record<RentalStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  payment_pending: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function RentalRequestsClient({ initialData }: { initialData: RentalRequest[] }) {
  const [requests, setRequests] = useState(initialData)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  async function updateStatus(id: string, status: RentalStatus) {
    const supabase = createClient()
    await supabase.from('rental_requests').update({ status }).eq('id', id)
    setRequests(r => r.map(req => req.id === id ? { ...req, status } : req))
  }

  async function saveNote(id: string) {
    const supabase = createClient()
    const note = adminNotes[id] ?? ''
    await supabase.from('rental_requests').update({ admin_note: note }).eq('id', id)
    setRequests(r => r.map(req => req.id === id ? { ...req, admin_note: note } : req))
  }

  function fmt(s: string) {
    return new Date(s).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.length === 0 && (
        <p className="text-sm text-[var(--gray)] py-10 text-center">尚無申請</p>
      )}
      {requests.map(r => (
        <div key={r.id} className="bg-[var(--cream)] border border-[var(--border-color)]">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer"
            onClick={() => setExpanded(e => e === r.id ? null : r.id)}
          >
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-0.5 ${STATUS_COLORS[r.status]}`}>{RENTAL_STATUS_LABEL[r.status]}</span>
              <div>
                <p className="text-sm font-medium">{r.event_title}</p>
                <p className="text-xs text-[var(--gray)]">{r.name} · {fmt(r.start_time)} – {fmt(r.end_time)}</p>
              </div>
            </div>
            {expanded === r.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>

          {expanded === r.id && (
            <div className="border-t border-[var(--border-color)] px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="label-tag mb-3">申請資料</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {[
                    ['姓名', r.name], ['手機', r.phone], ['Email', r.email],
                    ['活動類型', r.event_type ?? '—'], ['預計人數', r.guest_count ?? '—'],
                  ].map(([k, v]) => (
                    <><span key={`k-${k}`} className="text-[var(--gray)] text-xs">{k}</span><span key={`v-${k}`} className="text-xs">{v}</span></>
                  ))}
                </div>
                {r.note && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                    <p className="text-xs text-[var(--gray)] mb-1">備註</p>
                    <p className="text-xs">{r.note}</p>
                  </div>
                )}
                {/* Addons */}
                {r.rental_addons && r.rental_addons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                    <p className="text-xs text-[var(--gray)] mb-2">加購項目</p>
                    {r.rental_addons.map((a: { id: string; venue_addons?: { name: string }; quantity: number; subtotal: number }) => (
                      <div key={a.id} className="flex justify-between text-xs mb-1">
                        <span>{a.venue_addons?.name} × {a.quantity}</span>
                        <span>{a.subtotal === 0 ? '另議' : `NT$ ${a.subtotal.toLocaleString()}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="label-tag mb-3">狀態管理</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.keys(RENTAL_STATUS_LABEL) as RentalStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(r.id, s)}
                      className={`text-xs px-3 py-1.5 border transition-colors ${r.status === s ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-[var(--border-color)] text-[var(--gray)] hover:border-[var(--charcoal)]'}`}
                    >
                      {RENTAL_STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
                <p className="label-tag mb-2">內部備註</p>
                <textarea
                  rows={3}
                  defaultValue={r.admin_note ?? ''}
                  onChange={e => setAdminNotes(p => ({ ...p, [r.id]: e.target.value }))}
                  className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2 text-xs focus:outline-none focus:border-[var(--gold)] resize-none"
                />
                <button
                  onClick={() => saveNote(r.id)}
                  className="mt-2 text-xs px-4 py-1.5 bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] transition-colors"
                >
                  儲存備註
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
