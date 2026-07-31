'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_LIFF_ID = '2010632211-TAiLlAYX'
const COURSE_CONFIRM_TRIGGER = '✅ 我已送出課程報名'

type EventItem = {
  id: string
  title: string
  slug: string
  start_time: string
  is_paid: boolean
  price: number
}

type FormState = { name: string; phone: string; email: string; note: string }
const initialForm: FormState = { name: '', phone: '', email: '', note: '' }

export default function LiffCourseRegistrationPage() {
  const [profile, setProfile] = useState<{ userId: string; displayName: string } | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const selected = useMemo(() => events.find(e => e.id === selectedId) ?? null, [events, selectedId])

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
        const { data } = await supabase
          .from('events')
          .select('id, title, slug, start_time, is_paid, price')
          .eq('status', 'published')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
        if (!data?.length) {
          setError('目前沒有開放報名的課程活動。')
        } else {
          setEvents(data)
          setSelectedId(data[0].id)
        }
      } catch {
        setError('LINE 登入失敗，請改用網站報名。')
      } finally {
        setLoading(false)
      }
    })
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !profile) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const checkInToken = crypto.randomUUID()
    // event_registrations 沒有 public SELECT policy，insert 後不能 .select()
    // 讀回（同一個 RLS RETURNING 陷阱），id/check_in_token 改用前端產生。
    const { error: insertError } = await supabase.from('event_registrations').insert({
      id: crypto.randomUUID(),
      event_id: selected.id,
      line_user_id: profile.userId,
      name: form.name,
      phone: form.phone,
      email: form.email,
      note: form.note || null,
      check_in_token: checkInToken,
    })

    if (insertError) {
      setError('送出失敗，請確認資料後再試，或改用網站報名。')
      setSubmitting(false)
      return
    }

    const QRCode = (await import('qrcode')).default
    const siteUrl = 'https://heart-universe-center.vercel.app'
    const dataUrl = await QRCode.toDataURL(`${siteUrl}/check-in?token=${checkInToken}`, {
      width: 256, margin: 2, color: { dark: '#2C2C2C', light: '#FAFAF8' },
    })
    setQrDataUrl(dataUrl)
    setSuccess(true)
    setSubmitting(false)

    import('@line/liff').then(({ default: liff }) => {
      liff.sendMessages([{ type: 'text', text: COURSE_CONFIRM_TRIGGER }]).catch(() => {})
    })
  }

  return (
    <main className="min-h-screen px-5 py-12" style={{ background: 'var(--cream)' }}>
      <div className="mx-auto max-w-md">
        <Link href="/events" className="mb-8 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--gray)' }}>
          <ArrowLeft size={14} /> 網站查看所有課程活動
        </Link>
        <div className="mb-8">
          <p className="mb-3 text-[10px] uppercase tracking-[.35em]" style={{ color: 'var(--gold)' }}>Heart Universe · Course</p>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--charcoal)' }}>課程報名</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>在 LINE 內直接完成報名，出示 QR Code 即可簽到。</p>
        </div>

        {loading && <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gray)' }}><Loader2 size={16} className="animate-spin" /> 載入中…</div>}

        {!loading && error && (
          <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>{error}</p>
            <Link href="/events" className="mt-4 inline-flex items-center gap-2 text-xs underline" style={{ color: 'var(--gold)' }}>
              前往網站查看課程 <ExternalLink size={12} />
            </Link>
          </div>
        )}

        {!loading && !error && !success && selected && (
          <>
            {events.length > 1 && (
              <label className="mb-5 block text-xs" style={{ color: 'var(--gray)' }}>
                選擇課程
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}｜{new Date(ev.start_time).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: 'rgba(196,160,56,.25)', background: 'rgba(196,160,56,.06)' }}>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>課程活動</p>
              <p className="mt-1 text-lg font-medium" style={{ color: 'var(--charcoal)' }}>{selected.title}</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--gray)' }}>{new Date(selected.start_time).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              {selected.is_paid && <p className="mt-2 text-xs" style={{ color: 'var(--gold)' }}>費用：NT$ {selected.price.toLocaleString()}（匯款資訊將於報名成功後告知）</p>}
            </div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>姓名<input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} placeholder={profile?.displayName} /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>手機號碼<input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>Email<input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-base" style={{ borderColor: 'var(--border-color)' }} /></label>
              <label className="block text-sm" style={{ color: 'var(--charcoal)' }}>備註（選填）<textarea rows={3} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="mt-2 w-full border bg-transparent px-3 py-3 text-sm" style={{ borderColor: 'var(--border-color)' }} /></label>
              <button disabled={submitting} className="btn-gold-fill w-full justify-center px-5 py-3 text-sm tracking-widest disabled:opacity-50">{submitting ? '送出中…' : '確認報名'}</button>
            </form>
          </>
        )}

        {success && (
          <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'rgba(39,174,96,.3)', background: 'rgba(39,174,96,.06)' }}>
            <CheckCircle2 size={28} className="mx-auto mb-3 text-green-600" />
            <h2 className="font-serif text-xl" style={{ color: 'var(--charcoal)' }}>報名成功</h2>
            {qrDataUrl && <img src={qrDataUrl} alt="簽到 QR Code" className="mx-auto mt-4 w-40 h-40" />}
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>活動當天出示此 QR Code 完成簽到，確認訊息已回到聊天室。</p>
          </div>
        )}
      </div>
    </main>
  )
}
