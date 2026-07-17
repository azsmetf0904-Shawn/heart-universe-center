'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle } from 'lucide-react'
import { CTA } from '@/lib/cta'

type State = 'idle' | 'success' | 'notfound' | 'already'

export default function CheckInPage() {
  const params = useParams()
  const slug = params.slug as string
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [name, setName] = useState('')

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setState('idle')
    const supabase = createClient()

    // find event
    const { data: event } = await supabase
      .from('events').select('id').eq('slug', slug).single()
    if (!event) { setState('notfound'); setSubmitting(false); return }

    // find registration by phone or email
    const { data: reg } = await supabase
      .from('event_registrations')
      .select('id, name, checked_in, status')
      .eq('event_id', event.id)
      .eq('status', 'registered')
      .or(`phone.eq.${query},email.eq.${query}`)
      .single()

    if (!reg) { setState('notfound'); setSubmitting(false); return }
    if (reg.checked_in) { setName(reg.name); setState('already'); setSubmitting(false); return }

    await supabase
      .from('event_registrations')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', reg.id)

    setName(reg.name)
    setState('success')
    setSubmitting(false)
  }

  return (
    <div className="py-20 min-h-[70vh] flex items-center">
      <div className="container-narrow max-w-md w-full">
        <p className="label-tag mb-4">Check-in</p>
        <h1 className="text-3xl mb-4">活動簽到</h1>
        <div className="gold-divider" />
        <p className="text-[var(--gray)] text-sm mt-6 mb-10">
          請輸入報名時填寫的手機號碼或 Email
        </p>

        {state === 'success' && (
          <div className="flex flex-col items-center text-center py-10">
            <CheckCircle2 size={48} className="text-[var(--gold)] mb-4" />
            <h2 className="text-xl mb-2">{CTA.system.checkInSuccess}</h2>
            <p className="text-[var(--gray)] text-sm mb-6">{name}，歡迎參加活動！</p>
            <Link href={`/events/${slug}`} className="text-xs tracking-widest text-[var(--gold)] hover:underline">
              返回活動詳情
            </Link>
          </div>
        )}

        {state === 'already' && (
          <div className="flex flex-col items-center text-center py-10">
            <CheckCircle2 size={48} className="text-[var(--gold)] mb-4" />
            <h2 className="text-xl mb-2">{CTA.system.alreadyCheckedIn}</h2>
            <p className="text-[var(--gray)] text-sm mb-6">{name}，您已簽到過了</p>
            <Link href={`/events/${slug}`} className="text-xs tracking-widest text-[var(--gold)] hover:underline">
              返回活動詳情
            </Link>
          </div>
        )}

        {state === 'notfound' && (
          <div className="flex flex-col items-center text-center py-6 mb-6">
            <XCircle size={40} className="text-red-400 mb-3" />
            <p className="text-sm text-[var(--gray)]">查無報名紀錄，請確認輸入是否正確</p>
          </div>
        )}

        {state !== 'success' && (
          <form onSubmit={handleCheckIn} className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="手機號碼 或 Email"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50"
            >
              {submitting ? CTA.system.searching : CTA.system.checkIn}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
