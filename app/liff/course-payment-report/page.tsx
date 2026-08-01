'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'

const DEFAULT_LIFF_ID = '2010632211-TAiLlAYX'

type Registration = {
  id: string
  name: string
  status: 'payment_pending'
  payment_last5: string | null
  payment_date: string | null
  payment_amount: number | null
  payment_reported_at: string | null
  events: { title: string; start_time: string; price: number } | { title: string; start_time: string; price: number }[]
}

type FormState = { last5: string; date: string; amount: string }
const initialForm: FormState = { last5: '', date: new Date().toISOString().slice(0, 10), amount: '' }

function eventOf(r: Registration) {
  return Array.isArray(r.events) ? r.events[0] : r.events
}

export default function LiffCoursePaymentReportPage() {
  const [accessToken, setAccessToken] = useState('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

  const selected = useMemo(() => registrations.find(r => r.id === selectedId) ?? null, [registrations, selectedId])

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID ?? DEFAULT_LIFF_ID
    import('@line/liff').then(async ({ default: liff }) => {
      try {
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          setNeedsLogin(true)
          setLoading(false)
          return
        }
        const token = liff.getAccessToken()
        if (!token) throw new Error('LINE access token unavailable')
        setAccessToken(token)

        const res = await fetch('/api/liff/course-payment-report', { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json() as { ok: boolean; registrations?: Registration[] }
        if (!json.ok || !json.registrations?.length) {
          setError('找不到待回報匯款的課程報名，請改用網站查詢。')
        } else {
          setRegistrations(json.registrations)
          setSelectedId(json.registrations[0].id)
        }
      } catch {
        setError('LINE 登入或載入資料失敗，請改用網站查詢。')
      } finally {
        setLoading(false)
      }
    })
  }, [])

  function loginWithLine() {
    import('@line/liff').then(({ default: liff }) => liff.login({ redirectUri: window.location.href }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !accessToken) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/liff/course-payment-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ registrationId: selected.id, ...form }),
    })
    const json = await res.json() as { ok: boolean }
    if (!json.ok) {
      setError('送出失敗，請確認資料後再試，或改用網站查詢。')
    } else {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen px-5 py-12" style={{ background: 'var(--cream)' }}>
      <div className="mx-auto max-w-md">
        <Link href="/events" className="mb-8 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--gray)' }}>
          <ArrowLeft size={14} /> 網站查看所有課程
        </Link>
        <div className="mb-8">
          <p className="mb-3 text-[10px] uppercase tracking-[.35em]" style={{ color: 'var(--gold)' }}>Heart Universe · Course Payment</p>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--charcoal)' }}>回報課程匯款</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>在 LINE 內完成回報，確認入帳後我們會立即通知您。</p>
        </div>

        {loading && <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray)' }}><Loader2 size={16} className="animate-spin" /> 載入中…</div>}

        {!loading && needsLogin && (
          <button onClick={loginWithLine} className="btn-gold-fill w-full justify-center px-5 py-3 text-sm tracking-widest">
            使用 LINE 登入
          </button>
        )}

        {!loading && error && (
          <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>{error}</p>
            <Link href="/events" className="mt-4 inline-flex items-center gap-2 text-xs underline" style={{ color: 'var(--gold)' }}>
              前往網站查詢 <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {!loading && !error && !success && selected && (
          <>
            {registrations.length > 1 && (
              <label className="mb-5 block text-xs" style={{ color: 'var(--gray)' }}>
                選擇報名項目
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                  {registrations.map(r => <option key={r.id} value={r.id}>{eventOf(r)?.title}</option>)}
                </select>
              </label>
            )}
            <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>課程</p>
              <p className="mt-1 text-lg font-medium" style={{ color: 'var(--charcoal)' }}>{eventOf(selected)?.title}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--gold)' }}>費用：NT$ {eventOf(selected)?.price?.toLocaleString()}</p>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>匯款帳號末 5 碼<input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={form.last5} onChange={e => setForm(p => ({ ...p, last5: e.target.value.replace(/\D/g, '').slice(0, 5) }))} className="mt-2 w-full border bg-transparent px-3 py-3 font-mono text-base" style={{ borderColor: 'var(--border-color)' }} placeholder="12345" /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>匯款日期<input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>匯款金額（NT$）<input required type="number" min="1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} placeholder="請輸入金額" /></label>
              <button disabled={submitting} className="btn-gold-fill w-full justify-center px-5 py-3 text-sm tracking-widest disabled:opacity-50">{submitting ? '送出中…' : '確認匯款資訊'}</button>
            </form>
          </>
        )}

        {success && <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'rgba(39,174,96,.3)', background: 'rgba(39,174,96,.06)' }}><CheckCircle2 size={28} className="mx-auto mb-3 text-green-600" /><h2 className="font-serif text-xl" style={{ color: 'var(--charcoal)' }}>已收到匯款資訊</h2><p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>我們確認入帳後會透過 LINE 通知您。</p></div>}
      </div>
    </main>
  )
}
