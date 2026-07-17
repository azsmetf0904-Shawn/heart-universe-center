import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function CheckInPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return (
      <CheckInShell>
        <XCircle size={40} className="text-red-400 mb-4 mx-auto" />
        <h1 className="text-xl mb-2">無效連結</h1>
        <p className="text-[var(--gray)] text-sm">此簽到連結缺少 token，請確認 Email 中的連結是否完整。</p>
      </CheckInShell>
    )
  }

  const supabase = await createAdminClient()
  const { data: reg } = await supabase
    .from('event_registrations')
    .select('id, name, checked_in, checked_in_at, status, events(title, start_time)')
    .eq('check_in_token', token)
    .single()

  if (!reg) {
    return (
      <CheckInShell>
        <XCircle size={40} className="text-red-400 mb-4 mx-auto" />
        <h1 className="text-xl mb-2">找不到報名紀錄</h1>
        <p className="text-[var(--gray)] text-sm">Token 無效或已過期，請至活動現場以手機號碼簽到。</p>
      </CheckInShell>
    )
  }

  if (reg.status === 'cancelled') {
    return (
      <CheckInShell>
        <AlertCircle size={40} className="text-amber-400 mb-4 mx-auto" />
        <h1 className="text-xl mb-2">報名已取消</h1>
        <p className="text-[var(--gray)] text-sm">{reg.name}，此報名紀錄已取消。</p>
      </CheckInShell>
    )
  }

  if (reg.checked_in) {
    const at = reg.checked_in_at
      ? new Date(reg.checked_in_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      : '稍早'
    return (
      <CheckInShell>
        <CheckCircle2 size={40} className="text-[var(--gold)] mb-4 mx-auto" />
        <h1 className="text-xl mb-2">已完成簽到</h1>
        <p className="text-[var(--charcoal)] font-medium mb-1">{reg.name}</p>
        <p className="text-[var(--gray)] text-sm mb-1">
          {(reg.events as { title?: string } | null)?.title}
        </p>
        <p className="text-xs text-[var(--gray)]">簽到時間：{at}</p>
      </CheckInShell>
    )
  }

  // 執行簽到（Server Action）— 用 adminClient 確保繞過 RLS SELECT 限制
  async function doCheckIn() {
    'use server'
    const sb = await createAdminClient()
    await sb
      .from('event_registrations')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('check_in_token', token!)
      .eq('checked_in', false) // race condition guard
    revalidatePath('/check-in')
  }

  const event = reg.events as { title?: string; start_time?: string } | null

  return (
    <CheckInShell>
      <p className="label-tag mb-4 text-center">Check-in</p>
      {event?.title && (
        <p className="text-[var(--gray)] text-sm mb-1 text-center">{event.title}</p>
      )}
      {event?.start_time && (
        <p className="text-xs text-[var(--gray)] mb-6 text-center">
          {new Date(event.start_time).toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            month: 'long', day: 'numeric', weekday: 'short',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}
      <h1 className="text-2xl text-center mb-6">{reg.name}</h1>
      <div className="gold-divider mx-auto mb-8" />
      <form action={doCheckIn}>
        <button
          type="submit"
          className="w-full py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
        >
          確認簽到
        </button>
      </form>
      <p className="text-xs text-[var(--gray)] text-center mt-4">
        此 QR Code 僅限本人使用，每人簽到一次
      </p>
    </CheckInShell>
  )
}

function CheckInShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 w-full max-w-sm text-center">
        <p className="text-xs text-[var(--gray)] tracking-widest mb-6">HEART UNIVERSE</p>
        {children}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
          <Link href="/events" className="text-xs text-[var(--gray)] hover:text-[var(--gold)] transition-colors tracking-widest">
            查看活動列表
          </Link>
        </div>
      </div>
    </div>
  )
}
