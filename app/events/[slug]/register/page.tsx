'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('events').select('*').eq('slug', slug).single().then(({ data }) => {
      setEvent(data)
      setLoading(false)
    })
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('event_registrations').insert({
      event_id: event.id,
      name: form.name,
      phone: form.phone,
      email: form.email,
      note: form.note || null,
    })
    setSubmitting(false)
    if (!error) setDone(true)
  }

  if (loading) return <div className="py-40 text-center text-[var(--gray)] text-sm">載入中…</div>
  if (!event) return <div className="py-40 text-center text-[var(--gray)] text-sm">活動不存在</div>

  if (done) {
    return (
      <div className="py-40 flex flex-col items-center text-center container-narrow">
        <CheckCircle2 size={40} className="text-[var(--gold)] mb-6" />
        <h2 className="text-2xl mb-4">報名成功</h2>
        <div className="gold-divider mx-auto" />
        <p className="text-[var(--gray)] text-sm mt-6 mb-2">感謝您報名《{event.title}》</p>
        <p className="text-[var(--gray)] text-sm mb-8">活動當天請至現場掃描 QR Code 完成簽到</p>
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
              <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>{f.label}</label>
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
            <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>備註</label>
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
            {submitting ? '送出中…' : '確認報名'}
          </button>
        </form>
      </div>
    </div>
  )
}
