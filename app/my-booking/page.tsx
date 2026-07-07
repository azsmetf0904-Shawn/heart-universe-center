'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RentalRequest } from '@/lib/types'
import { RENTAL_STATUS_LABEL, TIME_SLOT_LABEL } from '@/lib/types'
import type { TimeSlot } from '@/lib/types'
import { RENTAL_STATUS_TAILWIND as STATUS_COLORS } from '@/lib/status-colors'
import { Search } from 'lucide-react'

export default function MyBookingPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RentalRequest[] | null>(null)
  const [searching, setSearching] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('rental_requests')
      .select('*, venue:venues(name)')
      .or(`phone.eq.${query},email.eq.${query}`)
      .order('created_at', { ascending: false })
    setResults(data ?? [])
    setSearching(false)
  }

  return (
    <div className="py-20 min-h-[70vh]">
      <div className="container-narrow max-w-xl">
        <p className="label-tag mb-4">My Booking</p>
        <h1 className="text-3xl mb-4">查詢租借申請</h1>
        <div className="gold-divider" />
        <p className="text-[var(--gray)] text-sm mt-6 mb-10 leading-relaxed">
          輸入申請時填寫的手機號碼或 Email，查詢您的租借申請狀態
        </p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            required
            placeholder="手機號碼 或 Email"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
          />
          <button type="submit" disabled={searching}
            className="px-5 py-3 bg-[var(--gold)] text-white text-sm hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50 flex items-center gap-2">
            <Search size={14} /> {searching ? '查詢中…' : '查詢'}
          </button>
        </form>

        {results !== null && results.length === 0 && (
          <div className="text-center py-10 text-[var(--gray)]">
            <p className="text-sm">查無申請紀錄</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map(r => (
              <div key={r.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium">{r.event_title}</p>
                    {r.venue && <p className="text-xs text-[var(--gray)] mt-0.5">{(r.venue as { name: string }).name}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 shrink-0 ${STATUS_COLORS[r.status]}`}>
                    {RENTAL_STATUS_LABEL[r.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                  {r.booking_date && (
                    <>
                      <span className="text-[var(--gray)]">租借日期</span>
                      <span>{r.booking_date}</span>
                    </>
                  )}
                  {r.time_slot && (
                    <>
                      <span className="text-[var(--gray)]">時段</span>
                      <span>{TIME_SLOT_LABEL[r.time_slot as TimeSlot]}</span>
                    </>
                  )}
                  {r.session_count > 1 && (
                    <>
                      <span className="text-[var(--gray)]">時段數</span>
                      <span>{r.session_count} 個</span>
                    </>
                  )}
                  {r.layout_config && (
                    <>
                      <span className="text-[var(--gray)]">座位配置</span>
                      <span>{r.layout_config}</span>
                    </>
                  )}
                  <span className="text-[var(--gray)]">申請時間</span>
                  <span>{new Date(r.created_at).toLocaleDateString('zh-TW')}</span>
                </div>

                {/* Status hint */}
                <div className={`mt-4 pt-4 border-t border-[var(--border-color)] text-xs leading-relaxed`}>
                  {r.status === 'pending' && <p className="text-[var(--gray)]">申請已收到，工作人員將於一個工作日內與您確認</p>}
                  {r.status === 'confirmed' && <p className="text-blue-600">時段已確認，請等候付款通知</p>}
                  {r.status === 'payment_pending' && <p className="text-orange-600">請依通知完成付款以確保時段</p>}
                  {r.status === 'completed' && <p className="text-green-600">租借已完成，感謝您使用心宇宙商務中心</p>}
                  {r.status === 'cancelled' && <p className="text-[var(--gray)]">此申請已取消</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
