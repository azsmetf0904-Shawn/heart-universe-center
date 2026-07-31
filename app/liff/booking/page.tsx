'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Venue, TimeSlot } from '@/lib/types'
import { TIME_SLOT_LABEL } from '@/lib/types'

const DEFAULT_LIFF_ID = '2010632211-TAiLlAYX'
const BOOKING_CONFIRM_TRIGGER = '✅ 我已送出場地預約'

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
  const [profile, setProfile] = useState<{ userId: string; displayName: string } | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isWaitlist, setIsWaitlist] = useState(false)

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID ?? DEFAULT_LIFF_ID
    import('@line/liff').then(async ({ default: liff }) => {
      try {
        await liff.init({ liffId })
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }
        const p = await liff.getProfile()
        setProfile({ userId: p.userId, displayName: p.displayName })

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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()

    let waitlist = false
    if (form.booking_date && form.time_slot) {
      const { data: conflicts } = await supabase
        .from('rental_requests')
        .select('id')
        .eq('booking_date', form.booking_date)
        .eq('time_slot', form.time_slot)
        .in('status', ['pending', 'confirmed', 'payment_pending', 'waitlist'])
        .limit(1)
      if (conflicts && conflicts.length > 0) waitlist = true
    }

    const generatedCode = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
    // rental_requests 沒有 public SELECT policy，insert 後不能 .select()
    // 讀回（會撞上 RLS RETURNING 陷阱），id 改用前端產生。
    const bookingUuid = crypto.randomUUID()
    const { error: insertError } = await supabase.from('rental_requests').insert({
      id: bookingUuid,
      line_user_id: profile.userId,
      venue_id: form.venue_id || null,
      name: form.name,
      phone: form.phone,
      email: form.email,
      event_title: form.event_title,
      booking_date: form.booking_date || null,
      time_slot: form.time_slot || null,
      start_time: form.booking_date ? `${form.booking_date}T09:00:00` : new Date().toISOString(),
      end_time: form.booking_date ? `${form.booking_date}T21:30:00` : new Date().toISOString(),
      note: form.note || null,
      status: waitlist ? 'waitlist' : 'pending',
      line_code: generatedCode,
    })

    if (insertError) {
      setError('送出失敗，請確認資料後再試，或改用網站預約。')
      setSubmitting(false)
      return
    }

    setIsWaitlist(waitlist)
    setSuccess(true)
    setSubmitting(false)

    // 送出一則訊息回聊天室，觸發 webhook 收到新的 message event（帶 replyToken），
    // 讓機器人可以用免費的 Reply API 回覆完整確認卡片，不佔用 Push 配額。
    import('@line/liff').then(({ default: liff }) => {
      liff.sendMessages([{ type: 'text', text: BOOKING_CONFIRM_TRIGGER }]).catch(() => {})
    })
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

        {!loading && error && (
          <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>{error}</p>
            <Link href="/rent" className="mt-4 inline-flex items-center gap-2 text-xs underline" style={{ color: 'var(--gold)' }}>
              前往網站預約 <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {!loading && !error && !success && profile && (
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
              <input required value={form.name} onChange={e => set('name', e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} placeholder={profile.displayName} />
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
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>請回到聊天室查看確認訊息，我們審核後會透過 LINE 通知您。</p>
          </div>
        )}
      </div>
    </main>
  )
}
