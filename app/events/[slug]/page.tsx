import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, MapPin, Users, DollarSign } from 'lucide-react'
import type { Metadata } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://heart-universe-center.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('title, description, cover_image_url').eq('slug', slug).single()
  return {
    title: data?.title ?? '活動詳情',
    description: data?.description ?? `心宇宙商務中心活動：${data?.title ?? ''}`,
    openGraph: {
      title: `${data?.title ?? '活動'}｜心宇宙商務中心`,
      description: data?.description ?? '',
      url: `${SITE}/events/${slug}`,
      type: 'website',
      images: data?.cover_image_url ? [{ url: data.cover_image_url }] : [],
    },
  }
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*, venue:venues(name, slug), event_registrations(id, status)')
    .eq('slug', slug)
    .in('status', ['published', 'ended'])
    .single()

  if (!event) notFound()

  const isEnded = event.status === 'ended' || new Date(event.end_time) < new Date()
  const registered = event.event_registrations?.filter((r: { status: string }) => r.status === 'registered').length ?? 0
  const isFull = event.capacity ? registered >= event.capacity : false

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? '',
    startDate: event.start_time,
    endDate: event.end_time,
    eventStatus: isEnded ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue?.name ?? '心宇宙商務中心',
      address: { '@type': 'PostalAddress', addressLocality: '台北市', addressCountry: 'TW' },
    },
    organizer: event.organizer_name
      ? { '@type': 'Organization', name: event.organizer_name }
      : { '@type': 'Organization', name: '心宇宙商務中心', url: SITE },
    offers: {
      '@type': 'Offer',
      price: event.is_paid ? String(event.price) : '0',
      priceCurrency: 'TWD',
      availability: isFull ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: `${SITE}/events/${slug}/register`,
    },
    ...(event.cover_image_url ? { image: event.cover_image_url } : {}),
  }

  return (
    <div className="py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Cover */}
      {event.cover_image_url && (
        <div className="container-wide mb-12">
          <div className="relative aspect-[21/8] bg-[var(--surface)] overflow-hidden">
            <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" sizes="100vw" priority />
          </div>
        </div>
      )}

      <div className="container-narrow grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main */}
        <div className="md:col-span-2">
          <p className="label-tag mb-4">Event</p>
          <h1 className="text-3xl md:text-4xl mb-4">{event.title}</h1>
          <div className="gold-divider" />
          {event.organizer_name && (
            <p className="text-xs text-[var(--gray)] mt-4 tracking-widest">主辦：{event.organizer_name}</p>
          )}
          {event.description && (
            <div className="mt-8 text-sm text-[var(--gray)] leading-loose whitespace-pre-line">
              {event.description}
            </div>
          )}
          {isEnded && (
            <div className="mt-10">
              <Link
                href={`/events/${slug}/gallery`}
                className="inline-flex items-center gap-2 text-sm text-[var(--gold)] tracking-widest hover:gap-4 transition-all"
              >
                查看活動回顧 <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
            <div className="flex flex-col gap-4 text-sm mb-6">
              <div className="flex items-start gap-2">
                <CalendarDays size={14} className="text-[var(--gold)] mt-0.5 shrink-0" />
                <div>
                  <p>{formatDateTime(event.start_time)}</p>
                  <p className="text-[var(--gray)] text-xs mt-1">至 {formatDateTime(event.end_time)}</p>
                </div>
              </div>
              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[var(--gold)] shrink-0" />
                  <span>{event.venue.name}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[var(--gold)] shrink-0" />
                  <span>名額 {registered}/{event.capacity}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-[var(--gold)] shrink-0" />
                <span>{event.is_paid ? `NT$ ${event.price.toLocaleString()}` : '免費參加'}</span>
              </div>
            </div>

            {isEnded ? (
              <div className="text-center text-xs text-[var(--gray)] py-2 border border-[var(--border-color)]">
                活動已結束
              </div>
            ) : isFull ? (
              <div className="text-center text-xs text-[var(--gray)] py-2 border border-[var(--border-color)]">
                名額已滿
              </div>
            ) : (
              <Link
                href={`/events/${slug}/register`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
              >
                立即報名 <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
