'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ReviewFormProps = {
  eventId: string
}

export default function ReviewForm({ eventId }: ReviewFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return

    setSubmitting(true)
    setError('')
    setSuccess('')

    const supabase = createClient()
    const { error: insertError } = await supabase.from('event_reviews').insert({
      event_id: eventId,
      reviewer_name: name.trim().slice(0, 20),
      content: content.trim().slice(0, 100),
    })

    if (insertError) {
      setError('送出失敗，請稍後再試')
      setSubmitting(false)
      return
    }

    setName('')
    setContent('')
    setSuccess('感謝你的回饋！')
    setSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 border border-[var(--border-color)] p-6 bg-[var(--card-bg)]">
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="form-label mb-2">姓名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            required
            className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
            placeholder="請輸入姓名"
          />
        </div>

        <div>
          <label className="form-label mb-2">一句話回饋</label>
          <textarea
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={100}
            required
            className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
            placeholder="最多 100 字"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-[var(--gray)]">
          {content.length}/100
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 bg-[var(--gold)] text-white text-xs tracking-widest hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50"
        >
          {submitting ? '送出中…' : '送出回饋'}
        </button>
      </div>

      {success && (
        <p className="mt-4 text-sm text-[var(--gold)]">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
