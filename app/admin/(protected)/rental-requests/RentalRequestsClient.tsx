'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RentalRequest, RentalStatus } from '@/lib/types'
import { RENTAL_STATUS_LABEL, TIME_SLOT_LABEL } from '@/lib/types'
import { RENTAL_STATUS_TAILWIND } from '@/lib/status-colors'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'

function exportCsv(requests: RentalRequest[]) {
  const headers = ['申請日期', '活動名稱', '申請人', '手機', 'Email', '場地', '租借日期', '時段', '人數', '狀態', '備註']
  const rows = requests.map(r => [
    new Date(r.created_at ?? '').toLocaleDateString('zh-TW'),
    r.event_title,
    r.name,
    r.phone,
    r.email,
    (r as unknown as { venues?: { name: string } }).venues?.name ?? '',
    r.booking_date ?? '',
    r.time_slot ? TIME_SLOT_LABEL[r.time_slot as keyof typeof TIME_SLOT_LABEL] : '',
    r.guest_count ?? '',
    RENTAL_STATUS_LABEL[r.status],
    (r.note ?? '').replace(/,/g, '，'),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rental-requests-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const STATUS_COLORS = RENTAL_STATUS_TAILWIND

export default function RentalRequestsClient({ initialData }: { initialData: RentalRequest[] }) {
  const [requests, setRequests] = useState(initialData)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const [filterStatus, setFilterStatus] = useState<RentalStatus | 'all'>('all')

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus)

  async function updateStatus(id: string, status: RentalStatus) {
    const supabase = createClient()
    const prev = requests.find(r => r.id === id)
    await supabase.from('rental_requests').update({ status }).eq('id', id)
    setRequests(r => r.map(req => req.id === id ? { ...req, status } : req))

    supabase.from('admin_action_logs').insert({
      action: 'status_change',
      resource_type: 'rental_request',
      resource_id: id,
      old_value: prev?.status ?? null,
      new_value: status,
    }).then(() => {})

    const r = prev
    if (!r?.email) return
    const venue = (r as unknown as { venues?: { name: string } }).venues
    const slotLabel = r.time_slot ? TIME_SLOT_LABEL[r.time_slot as keyof typeof TIME_SLOT_LABEL] : ''
    const base = { to: r.email, name: r.name, eventTitle: r.event_title, bookingDate: r.booking_date ?? '', timeSlot: slotLabel, venueName: venue?.name ?? '' }

    const lineId = (prev as unknown as { line_user_id?: string }).line_user_id

    if (status === 'confirmed') {
      fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rental_confirmed', ...base }) }).catch(() => {})
      if (lineId) fetch('/api/line/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'confirmed', lineUserId: lineId, ...base }) }).catch(() => {})
    }

    if (status === 'cancelled') {
      // 通知申請人取消
      fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rental_cancelled', ...base }) }).catch(() => {})
      if (lineId) fetch('/api/line/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cancelled', lineUserId: lineId, ...base }) }).catch(() => {})

      // 若有候補，通知候補者
      if (r.booking_date && r.time_slot) {
        const { data: waitlist } = await supabase
          .from('rental_requests').select('id, name, email, event_title, booking_date, time_slot, line_user_id')
          .eq('booking_date', r.booking_date).eq('time_slot', r.time_slot)
          .eq('status', 'waitlist').order('created_at').limit(1).single()
        if (waitlist?.email) {
          const wlBase = { to: waitlist.email, name: waitlist.name, eventTitle: waitlist.event_title, bookingDate: waitlist.booking_date ?? '', timeSlot: slotLabel, venueName: venue?.name ?? '' }
          fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'waitlist_promoted', ...wlBase }) }).catch(() => {})
          if (waitlist.line_user_id) fetch('/api/line/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'waitlist', lineUserId: waitlist.line_user_id, ...wlBase }) }).catch(() => {})
        }
      }
    }
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
      {/* 篩選列 */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...Object.keys(RENTAL_STATUS_LABEL)] as (RentalStatus | 'all')[]).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="text-[10px] px-3 py-1 border transition-colors"
              style={{
                borderColor: filterStatus === s ? 'var(--gold)' : 'var(--border-color)',
                color: filterStatus === s ? 'var(--gold)' : 'var(--gray)',
                background: filterStatus === s ? 'rgba(196,160,56,0.06)' : 'transparent',
              }}>
              {s === 'all' ? `全部（${requests.length}）` : `${RENTAL_STATUS_LABEL[s]}（${requests.filter(r => r.status === s).length}）`}
            </button>
          ))}
        </div>
        {requests.length > 0 && (
          <button onClick={() => exportCsv(requests)}
            className="flex items-center gap-2 text-xs px-4 py-2 border border-[var(--border-color)] text-[var(--gray)] hover:border-[var(--charcoal)] hover:text-[var(--charcoal)] transition-colors">
            <Download size={13} /> 匯出 CSV
          </button>
        )}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-[var(--gray)] py-10 text-center">
          {requests.length === 0 ? '尚無申請' : '此狀態下無申請'}
        </p>
      )}
      {filtered.map(r => (
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
