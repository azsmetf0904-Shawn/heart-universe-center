'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'
import { CTA } from '@/lib/cta'

type EventProp = {
  id: string
  title: string
  is_paid: boolean
  price: number
  end_time: string
}

type State = 'form' | 'success'

export default function RegisterForm({ event, slug }: { event: EventProp; slug: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<State>('form')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [regName, setRegName] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()

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
      const checkInUrl = `${siteUrl}/check-in?token=${reg.check_in_token}`
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#2C2C2C', light: '#FAFAF8' },
      })
      setQrDataUrl(dataUrl)
      setRegName(form.name)

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
            <div className="border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
              <p className="label-tag mb-3">費用與付款方式</p>
              <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
                <span className="text-[var(--gray)]">活動費用</span>
                <span className="font-medium text-[var(--charcoal)]">NT$ {event.price.toLocaleString()}</span>
                <span className="text-[var(--gray)]">付款方式</span>
                <span className="text-[var(--charcoal)]">銀行匯款</span>
                <span className="text-[var(--gray)]">銀行</span>
                <span className="text-[var(--charcoal)]">中國信託（822）北投</span>
                <span className="text-[var(--gray)]">帳號</span>
                <span className="font-mono font-semibold text-[var(--charcoal)]">680541314031</span>
                <span className="text-[var(--gray)]">戶名</span>
                <span className="text-[var(--charcoal)]">財富女神股份有限公司</span>
              </div>
              <p className="text-[10px] text-[var(--gray)] leading-relaxed">
                報名送出後請於 3 天內完成匯款，並回覆確認信告知末 5 碼，我們確認入帳後將正式核可。
              </p>
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
