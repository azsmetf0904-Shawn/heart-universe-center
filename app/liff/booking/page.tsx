'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Venue, TimeSlot } from '@/lib/types'
import { TIME_SLOT_LABEL } from '@/lib/types'

const DEFAULT_LIFF_ID = '2010632211-TAiLlAYX'

type FormState = {
  venue_id: string
  name: string
  phone: string
  email: string
  event_title: string
  booking_date: string
  time_slot: TimeSlot | ''
  note: string
}

const initialForm: FormState = {
  venue_id: '', name: '', phone: '', email: '', event_title: '',
  booking_date: '', time_slot: '', note: '',
}

export default function LiffBookingPage() {
  const [accessToken, setAccessToken] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isWaitlist, setIsWaitlist] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID ?? DEFAULT_LIFF_ID
    import('@line/liff').then(async ({ default: liff }) => {
      try {
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          // 故意不在這裡自動呼叫 liff.login()——經過 liff.init() 這段非同步
          // 流程後，使用者點擊 Flex 按鈕當下的手勢已經不新鮮，LINE 的 OAuth
          // 會把自動觸發的跳轉判定為不合法請求（間歇性 400）。改成顯示按鈕，
          // 讓登入永遠是使用者當下點擊觸發，比照 /rent 既有、穩定的做法。
          setNeedsLogin(true)
          setLoading(false)
          return
        }
        const token = liff.getAccessToken()
        if (!token) throw new Error('LINE access token unavailable')
        setAccessToken(token)
        const p = await liff.getProfile()
        setDisplayName(p.displayName)

        const supabase = createClient()
        const { data } = await supabase.from('venues').select('*').eq('is_active', true)
        setVenues(data ?? [])
      } catch {
        setError('LINE 登入失敗，請改用網站預約。')
      } finally {
        setLoading(false)
      }
    })
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }))
  }

  function loginWithLine() {
    import('@line/liff').then(({ default: liff }) => liff.login({ redirectUri: window.location.href }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/liff/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(form),
    })
    const json = await res.json() as { ok: boolean; isWaitlist?: boolean }
    if (!json.ok) {
      setError('送出失敗，請確認資料後再試，或改用網站預約。')
      setSubmitting(false)
      return
    }

    setIsWaitlist(Boolean(json.isWaitlist))
    setSuccess(true)
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen px-5 py-12" style={{ background: 'var(--cream)' }}>
      <div className="mx-auto max-w-md">
        <Link href="/rent" className="mb-8 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--gray)' }}>
          <ArrowLeft size={14} /> 網站完整預約（含加購）
        </Link>
        <div className="mb-8">
          <p className="mb-3 text-[10px] uppercase tracking-[.35em]" style={{ color: 'var(--gold)' }}>Heart Universe · Booking</p>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--charcoal)' }}>場地預約申請</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>在 LINE 內直接送出，我們確認後會通知您。</p>
        </div>

        {loading && <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray)' }}><Loader2 size={16} className="animate-spin" /> 載入中…</div>}

        {!loading && needsLogin && (
          <button onClick={loginWithLine} className="btn-gold-fill w-full justify-center px-5 py-3 text-sm tracking-widest">
            使用 LINE 登入開始預約
          </button>
        )}

        {!loading && error && (
          <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>{error}</p>
            <Link href="/rent" className="mt-4 inline-flex items-center gap-2 text-xs underline" style={{ color: 'var(--gold)' }}>
              前往網站預約 <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {!loading && !error && !success && accessToken && (
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              場地
              <select required value={form.venue_id} onChange={e => set('venue_id', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                <option value="">請選擇場地</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              活動名稱
              <input required value={form.event_title} onChange={e => set('event_title', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} placeholder="例如：讀書會、企業培訓" />
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              租借日期
              <input required type="date" value={form.booking_date} onChange={e => set('booking_date', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} />
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              時段
              <select required value={form.time_slot} onChange={e => set('time_slot', e.target.value as TimeSlot)} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                <option value="">請選擇時段</option>
                {(Object.keys(TIME_SLOT_LABEL) as TimeSlot[]).map(k => <option key={k} value={k}>{TIME_SLOT_LABEL[k]}</option>)}
              </select>
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              聯絡人姓名
              <input required value={form.name} onChange={e => set('name', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} placeholder={displayName} />
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              手機號碼
              <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} />
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              Email
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} />
            </label>
            <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>
              備註（選填）
              <textarea rows={3} value={form.note} onChange={e => set('note', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }} />
            </label>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
              需要投影機、音響、餐飲等加購項目，請改用
              <Link href="/rent" className="underline" style={{ color: 'var(--gold)' }}> 網站完整預約表單</Link>。
            </p>
            <button disabled={submitting} className="btn-gold-fill w-full justify-center px-5 py-3 text-sm tracking-widest disabled:opacity-50">{submitting ? '送出中…' : '送出預約申請'}</button>
          </form>
        )}

        {success && (
          <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'rgba(39,174,96,.3)', background: 'rgba(39,174,96,.06)' }}>
            <CheckCircle2 size={28} className="mx-auto mb-3 text-green-600" />
            <h2 className="font-serif text-xl" style={{ color: 'var(--charcoal)' }}>{isWaitlist ? '已加入候補' : '申請已送出'}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>確認訊息已透過 LINE 通知您，我們審核後會再次通知。</p>
          </div>
        )}
      </div>
    </main>
  )
}
