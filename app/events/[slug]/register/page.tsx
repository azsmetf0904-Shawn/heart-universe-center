import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RegisterForm from './RegisterForm'

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, slug, status, is_paid, price, capacity, end_time, event_registrations(id, status)')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const registeredCount = (event.event_registrations ?? []).filter(
    (r: { status: string }) => r.status === 'registered'
  ).length
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

  return (
    <RegisterForm
      slug={slug}
      event={{
        id: event.id,
        title: event.title,
        is_paid: event.is_paid,
        price: event.price,
        end_time: event.end_time,
      }}
    />
  )
}
