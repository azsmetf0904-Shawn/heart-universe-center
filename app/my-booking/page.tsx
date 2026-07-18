'use client'
import { useState, useEffect, useCallback } from 'react'
import { CTA } from '@/lib/cta'
import type { RentalRequest } from '@/lib/types'
import { RENTAL_STATUS_LABEL, TIME_SLOT_LABEL } from '@/lib/types'
import type { TimeSlot } from '@/lib/types'
import { RENTAL_STATUS_TAILWIND as STATUS_COLORS } from '@/lib/status-colors'
import { Search, CheckCircle2 } from 'lucide-react'

type PaymentForm = { last5: string; date: string; amount: string }

const STATUS_LEFT_BORDER: Record<string, string> = {
  pending:         '#F59E0B',
  payment_pending: '#3B82F6',
  confirmed:       '#22C55E',
  waitlist:        '#A855F7',
  cancelled:       '#9CA3AF',
  completed:       '#15803D',
}

export default function MyBookingPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RentalRequest[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ last5: '', date: '', amount: '' })
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentDoneIds, setPaymentDoneIds] = useState<Set<string>>(new Set())
  const [paymentError, setPaymentError] = useState('')

  async function handlePaymentReport(bookingId: string) {
    if (!paymentForm.last5 || !paymentForm.date || !paymentForm.amount) {
      setPaymentError('請填寫所有欄位')
      return
    }
    setPaymentSubmitting(true)
    setPaymentError('')

    const res = await fetch('/api/payment-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        contact: query,
        last5: paymentForm.last5,
        date: paymentForm.date,
        amount: paymentForm.amount,
      }),
    })
    const json = await res.json() as { ok: boolean }

    if (!json.ok) {
      setPaymentError('送出失敗，請稍後再試。')
    } else {
      setPaymentDoneIds(s => new Set([...s, bookingId]))
      setReportingId(null)
      setPaymentForm({ last5: '', date: '', amount: '' })
      doSearch(query)
    }
    setPaymentSubmitting(false)
  }

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setSearching(true)
    const res = await fetch('/api/my-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    })
    const json = await res.json() as { data: RentalRequest[] }
    setResults(json.data ?? [])
    setSearching(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const phone = params.get('phone')
    if (phone) {
      queueMicrotask(() => setQuery(phone))
      doSearch(phone)
    }
  }, [doSearch])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await doSearch(query)
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
            placeholder="0912345678 或 your@email.com"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
          />
          <button type="submit" disabled={searching}
            className="px-5 py-3 bg-[var(--gold)] text-white text-sm hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50 flex items-center gap-2">
            <Search size={14} /> {searching ? CTA.booking.searching : CTA.booking.query}
          </button>
        </form>
        <p className="-mt-7 mb-8 text-xs text-[var(--gray)]">
          請輸入申請時填寫的手機號碼或 Email
        </p>

        {results === null && (
          <div className="py-4 text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
            還沒有申請記錄？{' '}
            <a href="/rent" className="underline underline-offset-4 hover:text-[var(--gold)] transition-colors" style={{ color: 'var(--charcoal)' }}>
              前往申請租借
            </a>
          </div>
        )}

        {results !== null && results.length === 0 && (
          <div className="py-10 border border-[var(--border-color)] px-6 bg-[var(--card-bg)] text-center">
            <Search size={28} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--gray)' }} />
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--charcoal)' }}>查無申請記錄</p>
            <p className="text-xs leading-loose text-left" style={{ color: 'var(--gray)' }}>
              請確認以下資訊：
              <br />• 手機格式（例：0912345678，不含空格）
              <br />• Email 與申請時填寫的完全一致
              <br />• 如確認填寫無誤，請直接<a href="tel:" className="underline" style={{ color: 'var(--gold)' }}>來電洽詢</a>
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map(r => (
              <div key={r.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 card-hover"
                style={{ borderLeftWidth: 4, borderLeftColor: STATUS_LEFT_BORDER[r.status] ?? 'var(--border-color)' }}>
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
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-xs leading-relaxed">
                  {r.status === 'pending' && (
                    <div>
                      <p className="text-[var(--gray)] mb-3">申請已收到，請先完成匯款，我們確認入帳後將正式核可。</p>
                      {paymentDoneIds.has(r.id) ? (
                        <div className="flex items-center gap-2 text-[var(--gold)]">
                          <CheckCircle2 size={13} /><span>匯款資訊已回報，等待確認中</span>
                        </div>
                      ) : reportingId === r.id ? (
                        <div className="border border-[var(--border-color)] p-4 bg-[var(--card-bg)] flex flex-col gap-3">
                          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                            <div>
                              <p className="form-label mb-1 text-[var(--gray)]">帳號末5碼</p>
                              <input type="text" maxLength={5} placeholder="12345" value={paymentForm.last5}
                                onChange={e => setPaymentForm(p => ({ ...p, last5: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                                className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2 text-xs focus:outline-none focus:border-[var(--gold)] font-mono" />
                            </div>
                            <div>
                              <p className="form-label mb-1 text-[var(--gray)]">匯款日期</p>
                              <input type="date" value={paymentForm.date}
                                onChange={e => setPaymentForm(p => ({ ...p, date: e.target.value }))}
                                className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2 text-xs focus:outline-none focus:border-[var(--gold)]" />
                            </div>
                          </div>
                          <div>
                            <p className="form-label mb-1 text-[var(--gray)]">匯款金額（NT$）</p>
                            <input type="number" placeholder="請輸入" value={paymentForm.amount}
                              onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                              className="w-full border border-[var(--border-color)] bg-transparent px-3 py-2 text-xs focus:outline-none focus:border-[var(--gold)]" />
                          </div>
                          {paymentError && <p className="text-[11px] text-red-500">{paymentError}</p>}
                          <div className="flex gap-2">
                            <button onClick={() => { setReportingId(null); setPaymentError('') }}
                              className="flex-1 py-2 text-xs border border-[var(--border-color)] text-[var(--gray)]">取消</button>
                            <button onClick={() => handlePaymentReport(r.id)}
                              disabled={paymentSubmitting}
                              className="flex-1 py-2 text-xs text-white disabled:opacity-50" style={{ background: 'var(--gold)' }}>
                              {paymentSubmitting ? '送出中…' : '確認送出'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReportingId(r.id); setPaymentError('') }}
                          className="w-full py-3 text-xs border border-[var(--gold)] tracking-widest hover:bg-[var(--gold)] hover:text-white transition-colors"
                          style={{ color: 'var(--gold)' }}>
                          我已完成匯款 → 點此回報
                        </button>
                      )}
                    </div>
                  )}
                  {r.status === 'payment_pending' && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                      <CheckCircle2 size={13} /><span>匯款資訊已回報，我們確認入帳後將通知您</span>
                    </div>
                  )}
                  {r.status === 'confirmed' && <p className="text-green-600">匯款已確認入帳，預約正式核可 ✅</p>}
                  {r.status === 'completed' && <p className="text-green-600">租借已完成，感謝您使用心宇宙商務中心</p>}
                  {r.status === 'cancelled' && <p className="text-[var(--gray)]">此申請已取消，如有疑問請來電洽詢</p>}
                  {r.status === 'waitlist' && <p className="text-purple-600">此時段目前為候補，若有空缺我們將優先通知您</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
