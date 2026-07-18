'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EventRegistration } from '@/lib/types'
import { CheckCircle2, Circle, Download } from 'lucide-react'

export default function RegistrationsClient({
  eventId,
  initialData,
  capacity,
}: {
  eventId: string
  initialData: EventRegistration[]
  capacity: number | null
}) {
  const [regs, setRegs] = useState(initialData)

  const active = regs.filter(r => r.status === 'registered')
  const checkedIn = active.filter(r => r.checked_in).length

  async function toggleCheckIn(id: string, val: boolean) {
    const supabase = createClient()
    await supabase.rpc('check_in_registration', { p_registration_id: id, p_checked_in: val })
    setRegs(r => r.map(reg => reg.id === id ? { ...reg, checked_in: val } : reg))
  }

  function exportCSV() {
    const header = ['姓名', '手機', 'Email', '簽到', '報名時間']
    const rows = active.map(r => [
      r.name, r.phone, r.email,
      r.checked_in ? '已簽到' : '未簽到',
      new Date(r.created_at).toLocaleString('zh-TW'),
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${eventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <span>報名人數：<strong>{active.length}</strong>{capacity ? `/${capacity}` : ''}</span>
        <span>已簽到：<strong className="text-[var(--gold)]">{checkedIn}</strong></span>
        <button onClick={exportCSV} className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[var(--border-color)] text-[var(--gray)] hover:border-[var(--charcoal)] transition-colors">
          <Download size={12} /> 匯出 CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--cream)] border border-[var(--border-color)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--surface)]">
              {['簽到', '姓名', '手機', 'Email', '備註', '報名時間'].map(h => (
                <th key={h} className="text-left py-2.5 px-4 text-xs text-[var(--gray)] font-normal tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(r => (
              <tr key={r.id} className={`border-t border-[var(--border-color)] ${r.checked_in ? 'bg-green-50/30' : ''}`}>
                <td className="py-3 px-4">
                  <button onClick={() => toggleCheckIn(r.id, !r.checked_in)}>
                    {r.checked_in
                      ? <CheckCircle2 size={18} className="text-[var(--gold)]" />
                      : <Circle size={18} className="text-[var(--border-color)]" />
                    }
                  </button>
                </td>
                <td className="py-3 px-4 text-sm">{r.name}</td>
                <td className="py-3 px-4 text-sm text-[var(--gray)]">{r.phone}</td>
                <td className="py-3 px-4 text-sm text-[var(--gray)]">{r.email}</td>
                <td className="py-3 px-4 text-xs text-[var(--gray)]">{r.note ?? '—'}</td>
                <td className="py-3 px-4 text-xs text-[var(--gray)]">
                  {new Date(r.created_at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {active.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-[var(--gray)]">尚無報名</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
