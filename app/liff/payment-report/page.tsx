'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'

type Booking = {
  id: string
  name: string
  event_title: string
  booking_date: string | null
  time_slot: string | null
  status: 'pending' | 'payment_pending'
  payment_last5: string | null
  payment_date: string | null
  payment_amount: number | null
  payment_reported_at: string | null
}

type FormState = { last5: string; date: string; amount: string }
const DEFAULT_LIFF_ID = '2010632211-TAiLlAYX'

const initialForm: FormState = {
  last5: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
}

export default function LiffPaymentReportPage() {
  const [lineUserId, setLineUserId] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selected = useMemo(() => bookings.find(b => b.id === selectedId) ?? null, [bookings, selectedId])

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID ?? DEFAULT_LIFF_ID
    if (!liffId) {
      setError('LINE 表單尚未完成設定')
      setLoading(false)
      return
    }

    import('@line/liff').then(async ({ default: liff }) => {
      try {
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }
        const profile = await liff.getProfile()
        setLineUserId(profile.userId)
        const res = await fetch(`/api/liff/payment-report?lineUserId=${encodeURIComponent(profile.userId)}`)
        const json = await res.json() as { ok: boolean; bookings?: Booking[] }
        if (!json.ok || !json.bookings?.length) {
          setError('找不到可回報的預約，請改用網站查詢。')
        } else {
          setBookings(json.bookings)
          setSelectedId(json.bookings[0].id)
        }
      } catch {
        setError('LINE 登入或載入預約失敗，請改用網站查詢。')
      } finally {
        setLoading(false)
      }
    })
  }, [])

  function chooseBooking(id: string) {
    setSelectedId(id)
    setSuccess('')
    setError('')
    setForm(initialForm)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !lineUserId) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/liff/payment-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineUserId, bookingId: selected.id, ...form }),
    })
    const json = await res.json() as { ok: boolean; error?: string }
    if (!json.ok) {
      setError(json.error === 'already_reported' ? '這筆預約已回報過匯款。' : '送出失敗，請確認資料後再試。')
    } else {
      setSuccess(selected.id)
      setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, status: 'payment_pending', payment_last5: form.last5, payment_date: form.date, payment_amount: Number(form.amount) } : b))
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen px-5 py-12" style={{ background: 'var(--cream)' }}>
      <div className="mx-auto max-w-md">
        <Link href="/my-booking" className="mb-8 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--gray)' }}>
          <ArrowLeft size={14} /> 網站查詢備援
        </Link>
        <div className="mb-8">
          <p className="mb-3 text-[10px] uppercase tracking-[.35em]" style={{ color: 'var(--gold)' }}>Heart Universe · Payment</p>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--charcoal)' }}>回報匯款資訊</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>在 LINE 內完成回報，確認入帳後我們會立即通知您。</p>
        </div>

        {loading && <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray)' }}><Loader2 size={16} className="animate-spin" /> 正在讀取您的預約…</div>}

        {!loading && error && (
          <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>{error}</p>
            <Link href="/my-booking" className="mt-4 inline-flex items-center gap-2 text-xs underline" style={{ color: 'var(--gold)' }}>
              前往網站查詢 <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {!loading && !error && selected && selected.status === 'pending' && !success && (
          <>
            {bookings.length > 1 && (
              <label className="mb-5 block text-xs" style={{ color: 'var(--gray)' }}>
                選擇預約
                <select value={selectedId} onChange={e => chooseBooking(e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                  {bookings.map(b => <option key={b.id} value={b.id}>{b.event_title}｜{b.booking_date ?? '日期待確認'}</option>)}
                </select>
              </label>
            )}
            <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>預約活動</p>
              <p className="mt-1 text-lg font-medium" style={{ color: 'var(--charcoal)' }}>{selected.event_title}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--gray)' }}>{selected.booking_date ?? '日期待確認'}　{selected.time_slot ?? ''}</p>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>匯款帳號末 5 碼<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={form.last5} onChange={e => setForm(p => ({ ...p, last5: e.target.value.replace(/\D/g, '').slice(0, 5) }))} className="mt-2 w-full border bg-transparent px-3 py-3 font-mono text-base" style={{ borderColor: 'var(--border-color)' }} placeholder="12345" /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>匯款日期<input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>匯款金額（NT$）<input required type="number" min="1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} placeholder="請輸入金額" /></label>
              <button disabled={submitting} className="btn-gold-fill w-full justify-center px-5 py-3 text-sm tracking-widest disabled:opacity-50">{submitting ? '送出中…' : '確認匯款資訊'}</button>
            </form>
          </>
        )}

        {!loading && selected?.status === 'payment_pending' && !success && <p className="mt-5 text-sm" style={{ color: 'var(--gray)' }}>這筆預約已回報，正在等待入帳確認。</p>}
        {success && <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'rgba(39,174,96,.3)', background: 'rgba(39,174,96,.06)' }}><CheckCircle2 size={28} className="mx-auto mb-3 text-green-600" /><h2 className="font-serif text-xl" style={{ color: 'var(--charcoal)' }}>已收到匯款資訊</h2><p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>我們確認入帳後會透過 LINE 通知您。案件編號：<span className="font-mono">{success.slice(0, 8)}</span></p></div>}
      </div>
    </main>
  )
}
