import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, MapPin, Train, Car } from 'lucide-react'
import type { Metadata } from 'next'
import type { VenuePricing, TimeSlot, LayoutType } from '@/lib/types'
import { TIME_SLOT_LABEL, LAYOUT_TYPES } from '@/lib/types'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://heart-universe-center.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('venues').select('name, description').eq('slug', slug).single()
  return {
    title: data?.name ?? '場地詳情',
    description: data?.description ?? `心宇宙商務中心 ${data?.name ?? '場地'} — 台北八德路精品場地租借`,
    openGraph: {
      title: `${data?.name ?? '場地詳情'}｜心宇宙商務中心`,
      description: data?.description ?? '',
      url: `${SITE}/venues/${slug}`,
      type: 'website',
    },
  }
}

function PricingTable({ pricing }: { pricing: VenuePricing[] }) {
  const slots: TimeSlot[] = ['morning', 'afternoon', 'evening']

  function getPrice(dayType: 'weekday' | 'holiday', slot: TimeSlot) {
    return pricing.find(p => p.day_type === dayType && p.time_slot === slot)
  }

  if (!pricing.length) return null

  const overtimePrice = pricing[0]?.overtime_per_30min

  return (
    <div className="mb-10">
      <p className="label-tag mb-3">場地費用</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[var(--border-color)]">
          <thead>
            <tr className="bg-[var(--surface)]">
              <th className="text-left px-4 py-2.5 text-xs text-[var(--gray)] font-normal tracking-widest border-b border-[var(--border-color)]">時段（每時段 3 小時）</th>
              <th className="text-center px-4 py-2.5 text-xs text-[var(--gray)] font-normal tracking-widest border-b border-[var(--border-color)]">平日</th>
              <th className="text-center px-4 py-2.5 text-xs text-[var(--gray)] font-normal tracking-widest border-b border-[var(--border-color)]">假日</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => {
              const wd = getPrice('weekday', slot)
              const hd = getPrice('holiday', slot)
              if (!wd && !hd) return null
              return (
                <tr key={slot} className={i < slots.length - 1 ? 'border-b border-[var(--border-color)]' : ''}>
                  <td className="px-4 py-3 text-[var(--charcoal)]">{TIME_SLOT_LABEL[slot]}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    {wd ? `NT$ ${wd.price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-[var(--gold)]">
                    {hd ? `NT$ ${hd.price.toLocaleString()}` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {overtimePrice > 0 && (
          <p className="text-xs text-[var(--gray)] mt-2">
            超時計費：每 30 分鐘 NT$ {overtimePrice.toLocaleString()}（未稅價）
          </p>
        )}
      </div>
    </div>
  )
}

function LayoutTable({ capacities }: { capacities: Partial<Record<LayoutType, number>> }) {
  const available = LAYOUT_TYPES.filter(t => capacities[t] != null)
  if (!available.length) return null

  return (
    <div className="mb-10">
      <p className="label-tag mb-3">座位配置 / 容納人數</p>
      <div className="flex flex-wrap gap-3">
        {available.map(layout => (
          <div key={layout} className="border border-[var(--border-color)] px-4 py-3 text-center min-w-[90px]">
            <p className="text-xs text-[var(--gray)] mb-1">{layout}</p>
            <p className="text-lg font-medium text-[var(--charcoal)]">{capacities[layout]}</p>
            <p className="text-[10px] text-[var(--gray)]">人</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: venue } = await supabase
    .from('venues')
    .select('*, venue_photos(image_url, alt_text, sort_order), venue_pricing(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!venue) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: venue.name,
    description: venue.description ?? '',
    url: `${SITE}/venues/${slug}`,
    containedInPlace: {
      '@type': 'LocalBusiness',
      name: '心宇宙商務中心',
      url: SITE,
    },
  }

  const photos = (venue.venue_photos ?? []).sort((a: { sort_order: number; alt_text?: string }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  const pricing: VenuePricing[] = venue.venue_pricing ?? []
  const layouts: Partial<Record<LayoutType, number>> = venue.layout_capacities ?? {}
  const suitableFor: string[] = venue.suitable_for ?? []

  return (
    <div className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-narrow mb-10">
        <p className="label-tag mb-4">Venue</p>
        <div className="flex items-end gap-4 flex-wrap">
          <h1 className="text-4xl md:text-5xl">{venue.name}</h1>
          {venue.area_ping && (
            <span className="text-[var(--gray)] text-sm mb-1">{venue.area_ping} 坪</span>
          )}
        </div>
        <div className="gold-divider" />
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="container-wide mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {photos.map((p: { image_url: string; alt_text?: string; sort_order: number }, i: number) => (
              <div key={i} className={`relative aspect-video bg-[var(--surface)] overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}>
                <Image
                  src={p.image_url}
                  alt={p.alt_text ?? `${venue.name} 場地照片 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes={i === 0 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-narrow grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main info */}
        <div className="md:col-span-2">
          {venue.description && (
            <div className="mb-10">
              <p className="label-tag mb-3">空間介紹</p>
              <p className="text-sm text-[var(--gray)] leading-loose">{venue.description}</p>
            </div>
          )}

          {/* Suitable activities */}
          {suitableFor.length > 0 && (
            <div className="mb-10">
              <p className="label-tag mb-3">適合活動</p>
              <div className="flex flex-wrap gap-2">
                {suitableFor.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 border tracking-wide"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--gray)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Layout capacities */}
          {Object.keys(layouts).length > 0 && <LayoutTable capacities={layouts} />}

          {/* Pricing table */}
          {pricing.length > 0 && <PricingTable pricing={pricing} />}

          {/* Equipment */}
          {venue.equipment?.length > 0 && (
            <div className="mb-10">
              <p className="label-tag mb-3">場地配備（全數包含）</p>
              <table className="w-full text-sm border border-[var(--border-color)]">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="text-left px-4 py-2.5 text-xs text-[var(--gray)] font-normal tracking-widest border-b border-[var(--border-color)] w-8">序</th>
                    <th className="text-left px-4 py-2.5 text-xs text-[var(--gray)] font-normal tracking-widest border-b border-[var(--border-color)]">配備項目</th>
                  </tr>
                </thead>
                <tbody>
                  {(venue.equipment as string[]).map((eq: string, i: number) => (
                    <tr key={eq} className={i < venue.equipment.length - 1 ? 'border-b border-[var(--border-color)]' : ''}>
                      <td className="px-4 py-3 text-[var(--gray)] text-xs">{i + 1}</td>
                      <td className="px-4 py-3 text-[var(--charcoal)]">{eq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mb-10">
            <p className="label-tag mb-3">租借須知</p>
            <ul className="text-sm text-[var(--gray)] leading-loose list-disc list-inside space-y-1">
              <li>採自助型場地，申請確認後提供門禁方式</li>
              <li>申請後由工作人員確認時段可用性，一個工作日內回覆</li>
              <li>場地設備全數包含於租借費用中，無需另外加購</li>
              <li>超時使用依每30分鐘計費，請事先告知</li>
              <li>取消請提前 3 天告知，否則視情況酌收費用</li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Quick stats + CTA */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
            {venue.area_ping && (
              <div className="flex justify-between text-sm mb-3">
                <span className="text-[var(--gray)]">坪數</span>
                <span className="font-medium">{venue.area_ping} 坪</span>
              </div>
            )}
            {venue.capacity && (
              <div className="flex justify-between text-sm mb-3">
                <span className="text-[var(--gray)]">最大容納</span>
                <span className="font-medium flex items-center gap-1"><Users size={13} className="text-[var(--gold)]" />{venue.capacity} 人</span>
              </div>
            )}
            {pricing.length > 0 && (
              <div className="flex justify-between text-sm mb-6">
                <span className="text-[var(--gray)]">平日起</span>
                <span className="font-medium text-[var(--gold)]">
                  NT$ {Math.min(...pricing.filter(p => p.day_type === 'weekday').map(p => p.price)).toLocaleString()}
                </span>
              </div>
            )}
            <p className="text-xs text-[var(--gray)] leading-relaxed mb-6">
              申請後由工作人員確認，不直接線上付款。
            </p>
            <Link
              href={`/rent?venue=${venue.slug}`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
            >
              申請租借 <ArrowRight size={14} />
            </Link>
          </div>

          {/* Transport info */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
            <p className="label-tag mb-4">交通資訊</p>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex gap-3">
                <Train size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <div>
                  <p className="text-[var(--charcoal)] mb-0.5">捷運小巨蛋站</p>
                  <p className="text-[var(--gray)] text-xs leading-relaxed">3 號出口，步行約 10 分鐘</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Train size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <div>
                  <p className="text-[var(--charcoal)] mb-0.5">捷運國父紀念館站</p>
                  <p className="text-[var(--gray)] text-xs leading-relaxed">1 號出口，步行約 10 分鐘</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Car size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <div>
                  <p className="text-[var(--charcoal)] mb-0.5">開車</p>
                  <p className="text-[var(--gray)] text-xs leading-relaxed">周邊八德監理站停車場可停車</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
