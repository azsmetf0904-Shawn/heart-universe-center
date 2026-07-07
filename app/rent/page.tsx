'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Venue, VenueAddon, VenuePricing } from '@/lib/types'
import {
  ADDON_CATEGORY_LABEL, TIME_SLOT_LABEL, LAYOUT_TYPES,
  isHoliday,
} from '@/lib/types'
import type { TimeSlot, LayoutType, AddonCategory } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'
import { BookingCalendar } from '@/components/BookingCalendar'
import type { CalendarSelection } from '@/components/BookingCalendar'

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

type LineProfile = { userId: string; displayName: string; pictureUrl?: string }

function RentForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null)
  const [liffLoading, setLiffLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [venues, setVenues] = useState<Venue[]>([])
  const [addons, setAddons] = useState<VenueAddon[]>([])
  const [selected, setSelected] = useState<Record<string, SelectedAddon>>({})
  const [done, setDone] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isWaitlistDone, setIsWaitlistDone] = useState(false)
  const [lineCode, setLineCode] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedTotal, setSubmittedTotal] = useState<number | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [calSel, setCalSel] = useState<CalendarSelection | null>(null) // slots = multi-select
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

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
    time_slots: [] as TimeSlot[],
    session_count: '1',
    layout_config: '講座型' as LayoutType | '',
    note: '',
  })

  // LIFF 初始化
  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID
    if (!liffId) { setLiffLoading(false); return }
    import('@line/liff').then(({ default: liff }) => {
      liff.init({ liffId }).then(() => {
        if (liff.isLoggedIn()) {
          liff.getProfile().then(p => {
            setLineProfile({ userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl })
            setLiffLoading(false)
          })
        } else {
          // 不自動跳轉，讓用戶主動點按鈕
          setLiffLoading(false)
        }
      }).catch(() => setLiffLoading(false))
    })
  }, [])

  const handleLineLogin = useCallback(() => {
    import('@line/liff').then(({ default: liff }) => liff.login())
  }, [])

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
    setCalSel(null)
  }

  function handleCalendarSelect(sel: CalendarSelection | null) {
    setCalSel(sel)
    if (!sel || sel.slots.length === 0) {
      setForm(p => ({ ...p, booking_date: '', time_slot: '' as TimeSlot | '', time_slots: [] }))
      return
    }
    const orderedSlots: TimeSlot[] = ['morning', 'afternoon', 'evening']
    const sorted = orderedSlots.filter(s => sel.slots.includes(s))
    setForm(p => ({
      ...p,
      booking_date: sel.dateStr,
      time_slot: sorted[0],   // first slot for backward compat
      time_slots: sorted,
      session_count: String(sorted.length),
    }))
    setErrors(p => ({ ...p, booking_date: '', time_slot: '' }))
  }

  // 即時計算費用（多時段加總）
  const estimatedPrice = (() => {
    if (!selectedVenue?.venue_pricing || !calSel || calSel.slots.length === 0) return null
    const pricing: VenuePricing[] = selectedVenue.venue_pricing
    const dayType = isHoliday(calSel.date) ? 'holiday' : 'weekday'
    return calSel.slots.reduce((sum, slot) => {
      const p = pricing.find(x => x.day_type === dayType && x.time_slot === slot)
      return sum + (p?.price ?? 0)
    }, 0)
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

  const isHolidayDate = calSel ? isHoliday(calSel.date) : false

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    const supabase = createClient()
    try {

    // 檢查同日所有選取時段是否已有有效預約
    let isWaitlist = false
    const slotsToCheck = form.time_slots.length > 0 ? form.time_slots : (form.time_slot ? [form.time_slot] : [])
    if (form.booking_date && slotsToCheck.length > 0) {
      const { data: conflicts } = await supabase
        .from('rental_requests')
        .select('id')
        .eq('booking_date', form.booking_date)
        .in('time_slot', slotsToCheck)
        .in('status', ['pending', 'confirmed', 'payment_pending', 'waitlist'])
        .limit(1)
      if (conflicts && conflicts.length > 0) isWaitlist = true
    }

    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data: req, error } = await supabase.from('rental_requests').insert({
      line_user_id: lineProfile?.userId ?? null,
      venue_id: form.venue_id || null,
      name: form.name,
      phone: form.phone,
      email: form.email,
      event_title: form.event_title,
      event_type: form.event_type || null,
      guest_count: form.guest_count ? parseInt(form.guest_count) : null,
      booking_date: form.booking_date || null,
      time_slot: form.time_slot || null,
      time_slots: form.time_slots.length > 0 ? form.time_slots : null,
      session_count: parseInt(form.session_count || '1'),
      layout_config: form.layout_config || null,
      is_holiday: isHolidayDate,
      start_time: form.booking_date ? `${form.booking_date}T09:00:00` : new Date().toISOString(),
      end_time: form.booking_date ? `${form.booking_date}T21:30:00` : new Date().toISOString(),
      note: form.note || null,
      status: isWaitlist ? 'waitlist' : 'pending',
      line_code: generatedCode,
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
    if (!error && req) { setBookingId(req.id); setLineCode(generatedCode) }
    if (!error) {
      const emailPayload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        eventTitle: form.event_title,
        venueName: selectedVenue?.name,
        bookingDate: form.booking_date,
        timeSlot: form.time_slots.length > 0 ? form.time_slots.map(s => TIME_SLOT_LABEL[s]).join('、') : (form.time_slot ? TIME_SLOT_LABEL[form.time_slot as TimeSlot] : null),
        guestCount: form.guest_count,
        eventType: form.event_type,
        note: form.note,
      }
      const totalAmount = (estimatedPrice ?? 0) + addonTotal
      setSubmittedTotal(totalAmount > 0 ? totalAmount : null)
      // 通知申請者
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rental_request', to: form.email, amount: totalAmount || null, ...emailPayload }),
      }).catch(() => {})
      // 通知管理員
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin_rental_notification', ...emailPayload }),
      }).catch(() => {})
      setIsWaitlistDone(isWaitlist)
      setDone(true)
    } else if (error) {
      setSubmitError('送出失敗，請稍後再試或直接來電洽詢。')
    }
    } catch {
      setSubmitError('網路異常，請確認連線後再試。')
    }
    setSubmitting(false)
  }

  // LIFF 載入中
  if (liffLoading) return (
    <div className="py-40 flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm" style={{ color: 'var(--gray)' }}>連線 LINE 中…</p>
    </div>
  )

  // LINE 未登入（LIFF ID 沒設或 fallback）
  if (!lineProfile && process.env.NEXT_PUBLIC_LINE_LIFF_ID) return (
    <div className="py-40 flex flex-col items-center text-center container-narrow gap-6">
      <div style={{ width: 64, height: 64, background: '#06C755', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="white"><path d="M12 2C6.477 2 2 6.036 2 11.04c0 4.502 3.656 8.267 8.593 8.936.334.072.789.22.904.505.103.26.068.668.033.931l-.146.892c-.044.261-.203 1.02.893.556 1.095-.465 5.908-3.48 8.066-5.96C21.608 15.12 22 13.134 22 11.04 22 6.036 17.523 2 12 2"/></svg>
      </div>
      <div>
        <h2 className="text-xl mb-2" style={{ color: 'var(--charcoal)' }}>請先登入 LINE</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          預約系統使用 LINE 帳號驗證身份，<br />登入後即可接收審核通知。
        </p>
      </div>
      <button onClick={handleLineLogin}
        className="flex items-center gap-3 px-8 py-3 text-white text-sm font-medium"
        style={{ background: '#06C755' }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M12 2C6.477 2 2 6.036 2 11.04c0 4.502 3.656 8.267 8.593 8.936.334.072.789.22.904.505.103.26.068.668.033.931l-.146.892c-.044.261-.203 1.02.893.556 1.095-.465 5.908-3.48 8.066-5.96C21.608 15.12 22 13.134 22 11.04 22 6.036 17.523 2 12 2"/></svg>
        使用 LINE 登入
      </button>
    </div>
  )

  if (done) return (
    <div className="py-40 flex flex-col items-center text-center container-narrow">
      <CheckCircle2 size={48} className={isWaitlistDone ? 'text-orange-400 mb-6' : 'text-[var(--gold)] mb-6'} />
      <h2 className="text-2xl mb-4">{isWaitlistDone ? '申請已列入候補' : '申請已送出'}</h2>
      <div className="gold-divider mx-auto" />
      {isWaitlistDone && (
        <div className="mt-6 mb-2 bg-orange-50 border border-orange-200 px-6 py-4 text-sm text-orange-800 leading-relaxed max-w-sm">
          此時段目前已有其他預約申請，您的申請已自動列為<strong>候補</strong>。<br />
          若原預約取消，我們將優先聯繫您確認。
        </div>
      )}
      {bookingId && (
        <div className="mt-4 bg-[var(--card-bg)] border border-[var(--border-color)] px-6 py-3">
          <p className="text-xs text-[var(--gray)] mb-1">申請編號</p>
          <p className="text-xs font-mono text-[var(--charcoal)] select-all">{bookingId}</p>
        </div>
      )}
      <p className="text-[var(--gray)] text-sm mt-6 mb-4 leading-relaxed">
        {isWaitlistDone
          ? '敬請留意電話或 Email，有消息我們會第一時間通知您。'
          : <>請依下方匯款資訊完成付款，<br />我們確認入帳後將正式核可您的預約。</>}
      </p>

      {/* LINE 通知狀態 */}
      {lineProfile ? (
        <div className="w-full max-w-sm mb-8 border border-[#06C755] p-4 flex items-center gap-3" style={{ background: 'rgba(6,199,85,0.05)' }}>
          {lineProfile.pictureUrl && <img src={lineProfile.pictureUrl} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />}
          <div>
            <p className="text-xs font-medium" style={{ color: '#06C755' }}>LINE 通知已啟用</p>
            <p className="text-xs" style={{ color: 'var(--gray)' }}>{lineProfile.displayName}，審核結果將直接推播給您</p>
          </div>
        </div>
      ) : lineCode ? (
        <div className="w-full max-w-sm mb-8 border border-[var(--gold)] p-5" style={{ background: 'rgba(196,160,56,0.04)' }}>
          <p className="text-xs tracking-widest mb-3" style={{ color: 'var(--gold)' }}>LINE 通知啟用（選填）</p>
          <div className="flex items-center justify-between mb-4 px-4 py-3 bg-white border border-[var(--border-color)]">
            <span className="text-xs" style={{ color: 'var(--gray)' }}>您的驗證碼</span>
            <span className="font-mono text-lg tracking-widest font-bold" style={{ color: 'var(--charcoal)' }}>{lineCode}</span>
          </div>
          <ol className="text-xs leading-relaxed space-y-1.5" style={{ color: 'var(--gray)' }}>
            <li>1. <a href="https://lin.ee/RlmKDmn" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--gold)' }}>點此加入心宇宙官方帳號</a></li>
            <li>2. 傳送驗證碼 <strong style={{ color: 'var(--charcoal)' }}>{lineCode}</strong> 給官方帳號</li>
            <li>3. 收到確認訊息後即完成綁定 ✅</li>
          </ol>
        </div>
      ) : null}
      {/* 匯款資訊 */}
      {!isWaitlistDone && (
        <div className="w-full max-w-sm mb-8 border border-[var(--border-color)]" style={{ background: 'var(--card-bg)' }}>
          <div className="px-5 py-3 border-b border-[var(--border-color)]" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-xs tracking-widest" style={{ color: 'var(--gold)' }}>匯款帳號</p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--gray)' }}>銀行</span>
              <span style={{ color: 'var(--charcoal)' }}>中國信託銀行（822）北投分行</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--gray)' }}>帳號</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--charcoal)' }}>680541314031</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--gray)' }}>戶名</span>
              <span style={{ color: 'var(--charcoal)' }}>財富女神股份有限公司</span>
            </div>
            {submittedTotal && submittedTotal > 0 && (
              <div className="flex justify-between text-sm font-semibold mt-1 pt-2 border-t border-[var(--border-color)]">
                <span style={{ color: 'var(--gray)' }}>應匯金額</span>
                <span style={{ color: 'var(--gold)' }}>NT$ {submittedTotal.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-[var(--border-color)]">
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--gray)' }}>
              完成匯款後，請來電或 Email 告知，我們確認入帳後將正式核可您的預約。
            </p>
          </div>
        </div>
      )}

      {/* LINE OA 加入提示（已登入 LINE 者不顯示） */}
      {!isWaitlistDone && !lineProfile && (
        <div className="w-full max-w-sm mb-8 flex items-start gap-3 px-4 py-3 border border-[#06C755]" style={{ background: 'rgba(6,199,85,0.04)' }}>
          <div style={{ width: 32, height: 32, background: '#06C755', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M12 2C6.477 2 2 6.036 2 11.04c0 4.502 3.656 8.267 8.593 8.936.334.072.789.22.904.505.103.26.068.668.033.931l-.146.892c-.044.261-.203 1.02.893.556 1.095-.465 5.908-3.48 8.066-5.96C21.608 15.12 22 13.134 22 11.04 22 6.036 17.523 2 12 2"/></svg>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#06C755' }}>加入官方 LINE，接收審核通知</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--gray)' }}>
              加入心宇宙官方帳號，匯款確認後我們將第一時間推播通知給您。
            </p>
            <a href="https://lin.ee/RlmKDmn" target="_blank" rel="noopener noreferrer"
              className="inline-block mt-2 text-[11px] px-3 py-1 text-white"
              style={{ background: '#06C755' }}>
              + 加入官方 LINE
            </a>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={() => router.push('/my-booking')} className="text-sm text-[var(--gold)] tracking-widest hover:underline">
          查詢申請狀態
        </button>
        <span className="text-[var(--border-color)]">|</span>
        <button onClick={() => router.push('/')} className="text-sm text-[var(--gray)] tracking-widest hover:underline">
          返回首頁
        </button>
      </div>
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
                    onChange={e => {
                      setForm(p => ({ ...p, [f.key]: e.target.value }))
                      if (errors[f.key as keyof typeof form]) setErrors(p => ({ ...p, [f.key]: '' }))
                    }}
                    onBlur={e => {
                      if (f.required && !e.target.value.trim()) {
                        setErrors(p => ({ ...p, [f.key]: `請填寫${f.label}` }))
                      } else if (f.key === 'email' && e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                        setErrors(p => ({ ...p, [f.key]: 'Email 格式不正確' }))
                      } else if (f.key === 'phone' && e.target.value && !/^[\d\-+]{8,}$/.test(e.target.value)) {
                        setErrors(p => ({ ...p, [f.key]: '請輸入有效電話號碼' }))
                      }
                    }}
                    className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none transition-colors ${errors[f.key as keyof typeof form] ? 'border-red-400 focus:border-red-400' : 'border-[var(--border-color)] focus:border-[var(--gold)]'}`}
                  />
                  {errors[f.key as keyof typeof form] && (
                    <p className="text-xs text-red-500 mt-1">{errors[f.key as keyof typeof form]}</p>
                  )}
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

            {/* Booking Calendar */}
            <div>
              <label className="label-tag mb-3 block" style={{ color: 'var(--charcoal)' }}>選擇日期與時段</label>
              {(errors.booking_date || errors.time_slot) && (
                <p className="text-xs text-red-500 mb-2">請在日曆上選擇日期與時段</p>
              )}
              <div className="border border-[var(--border-color)] p-4 bg-[var(--card-bg)]">
                <BookingCalendar
                  venueId={form.venue_id}
                  pricing={selectedVenue?.venue_pricing ?? []}
                  onSelect={handleCalendarSelect}
                  selected={calSel}
                />
              </div>
              {calSel && calSel.slots.length > 0 && (
                <p className="text-xs text-[var(--gray)] mt-2">
                  已選：{calSel.dateStr}（{isHoliday(calSel.date) ? '假日' : '平日'}）
                  · {calSel.slots.map(s => TIME_SLOT_LABEL[s]).join('、')}
                </p>
              )}
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
                <div className="w-full border border-[var(--border-color)] bg-transparent px-4 py-3 text-sm"
                  style={{ color: 'var(--charcoal)' }}>
                  講座型（100–150 人）
                </div>
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
              const newErrors: Partial<Record<keyof typeof form, string>> = {}
              if (!form.name) newErrors.name = '請填寫申請人姓名'
              if (!form.phone) newErrors.phone = '請填寫手機號碼'
              if (!form.email) newErrors.email = '請填寫 Email'
              else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email 格式不正確'
              if (!form.event_title) newErrors.event_title = '請填寫活動名稱'
              if (!form.booking_date) newErrors.booking_date = '請選擇租借日期'
              if (!form.time_slot) newErrors.time_slot = '請選擇租借時段'
              if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
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
                                {a.price === 0 ? '免費' : `NT$ ${a.price.toLocaleString()}`}
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
            {estimatedPrice !== null && (estimatedPrice > 0 || addonTotal > 0) && (
              <div className="border-t-2 border-[var(--gold)] pt-4 text-sm flex justify-between">
                <span className="font-medium" style={{ color: 'var(--charcoal)' }}>預估合計（未稅）</span>
                <span className="font-bold text-base" style={{ color: 'var(--gold)' }}>NT$ {(estimatedPrice + addonTotal).toLocaleString()}</span>
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
                  ['租借時段', form.time_slots.length > 0 ? form.time_slots.map(s => TIME_SLOT_LABEL[s]).join('、') : (form.time_slot ? TIME_SLOT_LABEL[form.time_slot as TimeSlot] : '—')],
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
                    <span>{s.addon.price === 0 ? '免費' : `NT$ ${(s.addon.price * s.qty).toLocaleString()}`}</span>
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

            {estimatedPrice !== null && (
              <div className="border border-[var(--gold)] p-4 flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>預估總金額（未稅）</span>
                <span className="text-xl font-bold" style={{ color: 'var(--gold)' }}>NT$ {(estimatedPrice + addonTotal).toLocaleString()}</span>
              </div>
            )}

            <div className="bg-[var(--surface)] p-4 text-xs text-[var(--gray)] leading-relaxed">
              費用僅供參考，正式費用由工作人員確認後通知。目前不提供線上付款。
            </div>

            {submitError && (
              <p className="text-sm text-red-500 text-center mb-2">{submitError}</p>
            )}
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
