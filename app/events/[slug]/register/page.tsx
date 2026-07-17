'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/types'
import QRCode from 'qrcode'
import { CTA } from '@/lib/cta'

type State = 'form' | 'success'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<State>('form')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [regName, setRegName] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('events')
      .select('*, event_registrations(id, status)')
      .eq('slug', slug).single().then(({ data }) => {
        setEvent(data)
        setLoading(false)
      })
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    setSubmitting(true)
    const supabase = createClient()

    // insert 後取回 check_in_token
    const { data: reg, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: event.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        note: form.note || null,
      })
      .select('check_in_token')
      .single()

    if (!error && reg) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
      // token-based 個人化 QR（每人不同）
      const checkInUrl = `${siteUrl}/check-in?token=${reg.check_in_token}`
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#2C2C2C', light: '#FAFAF8' },
      })
      setQrDataUrl(dataUrl)
      setRegName(form.name)

      // 寄含 QR 的確認信
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_registration',
          to: form.email,
          name: form.name,
          eventTitle: event.title,
          checkInUrl,
        }),
      }).catch(() => {})

      setState('success')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="py-40 text-center text-[var(--gray)] text-sm">載入中…</div>
  if (!event) return <div className="py-40 text-center text-[var(--gray)] text-sm">活動不存在</div>

  const registeredCount = (event.event_registrations ?? []).filter((r: { status: string }) => r.status === 'registered').length
  const isFull = !!event.capacity && registeredCount >= event.capacity
  const isUnavailable = event.status !== 'published' || new Date(event.end_time) < new Date() || isFull
  if (isUnavailable) {
    return (
      <div className="py-40 text-center container-narrow max-w-md">
        <p className="label-tag mb-4">Registration Closed</p>
        <h2 className="text-2xl mb-4">{isFull ? '名額已滿' : '報名已截止'}</h2>
        <div className="gold-divider mx-auto" />
        <p className="text-sm text-[var(--gray)] mt-6 mb-8">
          {isFull ? '此活動名額已額滿，感謝您的支持。' : '此活動已結束或不開放報名。'}
        </p>
        <Link href={`/events/${slug}`} className="text-xs tracking-widest text-[var(--gold)] hover:underline">
          返回活動詳情
        </Link>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="py-20 flex flex-col items-center text-center container-narrow max-w-md">
        <Link
          href={`/events/${slug}`}
          className="mb-4 inline-flex items-center gap-1 text-xs tracking-widest text-[var(--gray)] hover:text-[var(--gold)] transition-colors"
        >
          ← 返回活動詳情
        </Link>
        <p className="label-tag mb-4">Registration Complete</p>
        <h2 className="text-2xl mb-2">報名成功</h2>
        <div className="gold-divider mx-auto" />
        <p className="text-[var(--gray)] text-sm mt-6">{regName}，感謝您報名</p>
        <p className="font-serif text-lg mt-1 mb-8">《{event.title}》</p>

        {/* QR Code */}
        <div className="border border-[var(--border-color)] p-6 mb-4">
          {qrDataUrl && <img src={qrDataUrl} alt="簽到 QR Code" className="w-48 h-48 mx-auto" />}
          <p className="text-xs text-[var(--gray)] mt-4 text-center leading-relaxed">
            活動當天出示此 QR Code<br />或至現場掃碼頁面輸入手機號碼完成簽到
          </p>
        </div>

        <p className="text-xs text-[var(--gray)] mb-8">確認信已寄至您的 Email，請留意收件匣</p>

        <button
          onClick={() => router.push('/events')}
          className="text-sm text-[var(--gold)] tracking-widest hover:underline"
        >
          返回活動列表
        </button>
      </div>
    )
  }

  return (
    <div className="py-20">
      <div className="container-narrow max-w-xl">
        <Link
          href={`/events/${slug}`}
          className="mb-4 inline-flex items-center gap-1 text-xs tracking-widest text-[var(--gray)] hover:text-[var(--gold)] transition-colors"
        >
          ← 返回活動詳情
        </Link>
        <p className="label-tag mb-4">Register</p>
        <h1 className="text-3xl mb-2">{event.title}</h1>
        <div className="gold-divider" />
        <p className="text-[var(--gray)] text-sm mt-4 mb-10">填寫以下資料完成報名</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {[
            { key: 'name', label: '姓名', type: 'text', required: true },
            { key: 'phone', label: '手機號碼', type: 'tel', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label mb-2">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="form-label mb-2">備註（選填）</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
            />
          </div>
          {event.is_paid && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 text-sm text-[var(--gray)]">
              本活動費用 <strong className="text-[var(--charcoal)]">NT$ {event.price.toLocaleString()}</strong>，
              付款方式於確認後另行通知。
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50"
          >
            {submitting ? '送出中…' : CTA.events.confirmRegister}
          </button>
        </form>
      </div>
    </div>
  )
}
