'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Venue, VenueAddon, VenuePricing } from '@/lib/types'
import {
  ADDON_CATEGORY_LABEL, TIME_SLOT_LABEL, LAYOUT_TYPES,
  isHoliday, getPriceForSlot,
} from '@/lib/types'
import type { TimeSlot, LayoutType, AddonCategory } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

interface SelectedAddon { addon: VenueAddon; qty: number }

function groupBy<T>(arr: T[], key: keyof T) {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']

const EVENT_TYPES = ['課程講座', '企業培訓', '讀書會', '工作坊', '展覽展示', '社群聚會', '其他']

function RentForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [venues, setVenues] = useState<Venue[]>([])
  const [addons, setAddons] = useState<VenueAddon[]>([])
  const [selected, setSelected] = useState<Record<string, SelectedAddon>>({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  const [form, setForm] = useState({
    venue_id: '',
    name: '',
    phone: '',
    email: '',
    event_title: '',
    event_type: '',
    guest_count: '',
    booking_date: '',
    time_slot: '' as TimeSlot | '',
    session_count: '1',
    layout_config: '' as LayoutType | '',
    note: '',
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('venues').select('*, venue_pricing(*)').eq('is_active', true),
      supabase.from('venue_addons').select('*').eq('is_available', true).order('sort_order'),
    ]).then(([{ data: v }, { data: a }]) => {
      setVenues(v ?? [])
      setAddons(a ?? [])
      const venueSlug = searchParams.get('venue')
      if (venueSlug && v) {
        const match = v.find((venue: Venue) => venue.slug === venueSlug)
        if (match) {
          setForm(p => ({ ...p, venue_id: match.id }))
          setSelectedVenue(match)
        }
      }
    })
  }, [searchParams])

  function handleVenueChange(id: string) {
    const v = venues.find(x => x.id === id) ?? null
    setForm(p => ({ ...p, venue_id: id, time_slot: '', layout_config: '' }))
    setSelectedVenue(v)
    if (form.booking_date) fetchAvailability(id, form.booking_date)
  }

  async function fetchAvailability(venueId: string, date: string) {
    if (!date) return
    const params = new URLSearchParams({ date })
    if (venueId) params.set('venue_id', venueId)
    const res = await fetch(`/api/availability?${params}`)
    const { booked } = await res.json()
    setBookedSlots(booked)
  }

  // 即時計算費用
  const estimatedPrice = (() => {
    if (!selectedVenue?.venue_pricing || !form.booking_date || !form.time_slot) return null
    const date = new Date(form.booking_date)
    const pricing: VenuePricing[] = selectedVenue.venue_pricing
    const slot = getPriceForSlot(pricing, date, form.time_slot as TimeSlot)
    if (!slot) return null
    return slot.price * parseInt(form.session_count || '1')
  })()

  function toggleAddon(addon: VenueAddon) {
    setSelected(p => {
      if (p[addon.id]) { const n = { ...p }; delete n[addon.id]; return n }
      return { ...p, [addon.id]: { addon, qty: 1 } }
    })
  }

  function setQty(id: string, qty: number) {
    if (qty < 1) return
    setSelected(p => ({ ...p, [id]: { ...p[id], qty } }))
  }

  const addonTotal = Object.values(selected).reduce((sum, s) => sum + s.addon.price * s.qty, 0)
  const grouped = groupBy(addons, 'category')

  const selectedDate = form.booking_date ? new Date(form.booking_date) : null
  const isHolidayDate = selectedDate ? isHoliday(selectedDate) : false

  async function handleSubmit() {
    setSubmitting(true)
    const supabase = createClient()
    const { data: req, error } = await supabase.from('rental_requests').insert({
      venue_id: form.venue_id || null,
      name: form.name,
      phone: form.phone,
      email: form.email,
      event_title: form.event_title,
      event_type: form.event_type || null,
      guest_count: form.guest_count ? parseInt(form.guest_count) : null,
      booking_date: form.booking_date || null,
      time_slot: form.time_slot || null,
      session_count: parseInt(form.session_count || '1'),
      layout_config: form.layout_config || null,
      is_holiday: isHolidayDate,
      start_time: form.booking_date ? `${form.booking_date}T09:00:00` : new Date().toISOString(),
      end_time: form.booking_date ? `${form.booking_date}T21:30:00` : new Date().toISOString(),
      note: form.note || null,
    }).select('id').single()

    if (!error && req && Object.keys(selected).length > 0) {
      await supabase.from('rental_addons').insert(
        Object.values(selected).map(s => ({
          rental_request_id: req.id,
          addon_id: s.addon.id,
          quantity: s.qty,
          unit_price: s.addon.price,
          subtotal: s.addon.price * s.qty,
        }))
      )
    }
    if (!error) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rental_request',
          to: form.email,
          name: form.name,
          eventTitle: form.event_title,
          venueName: selectedVenue?.name,
          bookingDate: form.booking_date,
          timeSlot: form.time_slot ? TIME_SLOT_LABEL[form.time_slot as TimeSlot] : null,
        }),
      }).catch(() => {})
      setDone(true)
    }
    setSubmitting(false)
  }

  if (done) return (
    <div className="py-40 flex flex-col items-center text-center container-narrow">
      <CheckCircle2 size={48} className="text-[var(--gold)] mb-6" />
      <h2 className="text-2xl mb-4">申請已送出</h2>
      <div className="gold-divider mx-auto" />
      <p className="text-[var(--gray)] text-sm mt-6 mb-8 leading-relaxed">
        我們將於一個工作日內與您確認時段，<br />敬請留意電話或 Email 通知。
      </p>
      <button onClick={() => router.push('/')} className="text-sm text-[var(--gold)] tracking-widest hover:underline">
        返回首頁
      </button>
    </div>
  )

  // 可用佈置類型（依選定場地）
  const availableLayouts = selectedVenue?.layout_capacities
    ? LAYOUT_TYPES.filter(l => (selectedVenue.layout_capacities?.[l] ?? 0) > 0)
    : LAYOUT_TYPES

  return (
    <div className="py-20">
      <div className="container-narrow max-w-2xl">
        <p className="label-tag mb-4">Reservation</p>
        <h1 className="text-3xl mb-4">場地租借申請</h1>
        <div className="gold-divider" />

        {/* Step indicator */}
        <div className="flex items-center gap-4 mt-8 mb-10">
          {['基本資料', '選加購', '確認送出'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > i + 1 ? 'bg-[var(--gold)] text-white' : step === i + 1 ? 'bg-[var(--charcoal)] text-white' : 'border border-[var(--border-color)] text-[var(--gray)]'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs tracking-widest ${step === i + 1 ? 'text-[var(--charcoal)]' : 'text-[var(--gray)]'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-[var(--border-color)]" />}
            </div>
          ))}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'name', label: '申請人姓名', type: 'text', required: true },
                { key: 'phone', label: '手機號碼', type: 'tel', required: true },
                { key: 'email', label: 'Email', type: 'email', required: true },
                { key: 'event_title', label: '活動名稱', type: 'text', required: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>{f.label}</label>
                  <input type={f.type} required={f.required}
                    value={form[f.key as keyof typeof form] as string}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Venue selector */}
            {venues.length > 0 && (
              <div>
                <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>選擇場地</label>
                <select value={form.venue_id} onChange={e => handleVenueChange(e.target.value)}
                  className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors">
                  <option value="">請選擇</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}{v.area_ping ? ` (${v.area_ping}坪)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date + time slot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>租借日期</label>
                <input type="date" required value={form.booking_date}
                  onChange={e => {
                    const date = e.target.value
                    setForm(p => ({ ...p, booking_date: date, time_slot: '' }))
                    fetchAvailability(form.venue_id, date)
                  }}
                  className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                />
                {form.booking_date && (
                  <p className={`text-xs mt-1 ${isHolidayDate ? 'text-[var(--gold)]' : 'text-[var(--gray)]'}`}>
                    {isHolidayDate ? '假日計費' : '平日計費'}
                  </p>
                )}
              </div>
              <div>
                <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>租借時段</label>
                <div className="flex flex-col gap-2">
                  {TIME_SLOTS.map(slot => {
                    const pricing = selectedVenue?.venue_pricing ?? []
                    const dayType = isHolidayDate ? 'holiday' : 'weekday'
                    const p = pricing.find((x: VenuePricing) => x.day_type === dayType && x.time_slot === slot)
                    const isBooked = bookedSlots.includes(slot)
                    return (
                      <label key={slot} className={`flex items-center justify-between border px-4 py-2.5 transition-colors
                        ${isBooked ? 'border-[var(--border-color)] bg-[var(--surface)] opacity-50 cursor-not-allowed' :
                          form.time_slot === slot ? 'border-[var(--gold)] bg-[var(--card-bg)] cursor-pointer' :
                          'border-[var(--border-color)] cursor-pointer hover:border-[var(--gold)]/50'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="time_slot" value={slot}
                            checked={form.time_slot === slot}
                            disabled={isBooked}
                            onChange={() => !isBooked && setForm(pr => ({ ...pr, time_slot: slot }))}
                            className="accent-[var(--gold)]"
                          />
                          <span className="text-sm">{TIME_SLOT_LABEL[slot]}</span>
                        </div>
                        <span className="text-xs">
                          {isBooked
                            ? <span className="text-[var(--gray)]">已被預約</span>
                            : p ? <span className="text-[var(--gold)]">NT$ {p.price.toLocaleString()}</span> : null
                          }
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>租借時段數</label>
                <select value={form.session_count} onChange={e => setForm(p => ({ ...p, session_count: e.target.value }))}
                  className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]">
                  {[1, 2, 3].map(n => <option key={n} value={n}>{n} 個時段{n > 1 ? '（連租）' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>座位配置</label>
                <select value={form.layout_config} onChange={e => setForm(p => ({ ...p, layout_config: e.target.value as LayoutType }))}
                  className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]">
                  <option value="">不指定</option>
                  {availableLayouts.map(l => (
                    <option key={l} value={l}>
                      {l}{selectedVenue?.layout_capacities?.[l] ? ` (${selectedVenue.layout_capacities[l]}人)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>預計人數</label>
                <input type="number" min="1" value={form.guest_count}
                  onChange={e => setForm(p => ({ ...p, guest_count: e.target.value }))}
                  className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>

            <div>
              <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>活動類型</label>
              <select value={form.event_type} onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}
                className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="">請選擇</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label-tag mb-2 block" style={{ color: 'var(--charcoal)' }}>備註需求</label>
              <textarea rows={3} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
              />
            </div>

            {/* Price estimate */}
            {estimatedPrice !== null && (
              <div className="bg-[var(--card-bg)] border border-[var(--gold)]/30 p-4 flex justify-between items-center text-sm">
                <span className="text-[var(--gray)]">預估費用（未稅，供參考）</span>
                <span className="font-medium text-[var(--gold)] text-base">NT$ {estimatedPrice.toLocaleString()}</span>
              </div>
            )}

            <button onClick={() => {
              if (!form.name || !form.phone || !form.email || !form.event_title || !form.booking_date || !form.time_slot) {
                alert('請填寫必填欄位（含日期與時段）')
                return
              }
              setStep(2)
            }} className="w-full py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors">
              下一步：選加購
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="flex flex-col gap-8">
            <p className="text-sm text-[var(--gray)]">加購項目為選填，依需求勾選</p>
            {(Object.keys(ADDON_CATEGORY_LABEL) as AddonCategory[]).map(cat => {
              const items = grouped[cat] ?? []
              if (!items.length) return null
              return (
                <div key={cat}>
                  <p className="label-tag mb-4">{ADDON_CATEGORY_LABEL[cat]}</p>
                  <div className="flex flex-col gap-3">
                    {items.map((a: VenueAddon) => {
                      const sel = selected[a.id]
                      return (
                        <div key={a.id}
                          className={`border p-4 cursor-pointer transition-colors ${sel ? 'border-[var(--gold)] bg-[var(--card-bg)]' : 'border-[var(--border-color)]'}`}
                          onClick={() => toggleAddon(a)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-4 h-4 border mt-0.5 flex items-center justify-center shrink-0 ${sel ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-[var(--gray)]'}`}>
                                {sel && <span className="text-white text-[10px]">✓</span>}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[var(--charcoal)]">{a.name}</p>
                                {a.description && <p className="text-xs text-[var(--gray)] mt-0.5">{a.description}</p>}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm text-[var(--charcoal)]">
                                {a.price === 0 ? '另議' : `NT$ ${a.price.toLocaleString()}`}
                              </p>
                              <p className="text-xs text-[var(--gray)]">
                                {{ per_session: '/場', per_hour: '/小時', per_person: '/人', per_unit: '/個' }[a.unit]}
                              </p>
                            </div>
                          </div>
                          {sel && a.unit === 'per_unit' && (
                            <div className="mt-3 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                              <span className="text-xs text-[var(--gray)]">數量</span>
                              <button onClick={() => setQty(a.id, sel.qty - 1)} className="w-6 h-6 border border-[var(--border-color)] text-sm flex items-center justify-center hover:border-[var(--gold)]">−</button>
                              <span className="text-sm w-6 text-center">{sel.qty}</span>
                              <button onClick={() => setQty(a.id, sel.qty + 1)} className="w-6 h-6 border border-[var(--border-color)] text-sm flex items-center justify-center hover:border-[var(--gold)]">+</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {addonTotal > 0 && (
              <div className="border-t border-[var(--border-color)] pt-4 text-sm flex justify-between">
                <span className="text-[var(--gray)]">加購小計</span>
                <span className="font-medium">NT$ {addonTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-[var(--border-color)] text-sm tracking-widest hover:border-[var(--charcoal)] transition-colors">上一步</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors">下一步：確認</button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
              <p className="label-tag mb-4">申請資料確認</p>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {[
                  ['姓名', form.name],
                  ['手機', form.phone],
                  ['Email', form.email],
                  ['活動名稱', form.event_title],
                  ['活動類型', form.event_type || '—'],
                  ['預計人數', form.guest_count || '—'],
                  ['租借日期', `${form.booking_date}（${isHolidayDate ? '假日' : '平日'}）`],
                  ['租借時段', form.time_slot ? TIME_SLOT_LABEL[form.time_slot as TimeSlot] : '—'],
                  ['時段數', `${form.session_count} 個`],
                  ['座位配置', form.layout_config || '不指定'],
                ].map(([k, v]) => (
                  <>
                    <span key={`k-${k}`} className="text-[var(--gray)]">{k}</span>
                    <span key={`v-${k}`}>{v}</span>
                  </>
                ))}
              </div>
              {form.note && (
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                  <p className="text-xs text-[var(--gray)] mb-1">備註</p>
                  <p className="text-sm">{form.note}</p>
                </div>
              )}
            </div>

            {estimatedPrice !== null && (
              <div className="bg-[var(--card-bg)] border border-[var(--gold)]/30 p-4 flex justify-between text-sm">
                <span className="text-[var(--gray)]">場地費用預估（未稅）</span>
                <span className="font-medium text-[var(--gold)]">NT$ {estimatedPrice.toLocaleString()}</span>
              </div>
            )}

            {Object.keys(selected).length > 0 && (
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
                <p className="label-tag mb-4">加購項目</p>
                {Object.values(selected).map(s => (
                  <div key={s.addon.id} className="flex justify-between text-sm mb-2">
                    <span>{s.addon.name} × {s.qty}</span>
                    <span>{s.addon.price === 0 ? '另議' : `NT$ ${(s.addon.price * s.qty).toLocaleString()}`}</span>
                  </div>
                ))}
                {addonTotal > 0 && (
                  <div className="border-t border-[var(--border-color)] pt-3 flex justify-between text-sm font-medium mt-2">
                    <span>加購小計</span>
                    <span>NT$ {addonTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-[var(--surface)] p-4 text-xs text-[var(--gray)] leading-relaxed">
              費用僅供參考，正式費用由工作人員確認後通知。目前不提供線上付款。
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-[var(--border-color)] text-sm tracking-widest hover:border-[var(--charcoal)] transition-colors">上一步</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors disabled:opacity-50">
                {submitting ? '送出中…' : '確認送出申請'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RentPage() {
  return (
    <Suspense fallback={<div className="py-40 text-center text-sm text-[var(--gray)]">載入中…</div>}>
      <RentForm />
    </Suspense>
  )
}
