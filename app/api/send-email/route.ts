import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/rate-limit'

const FROM = process.env.RESEND_FROM ?? 'noreply@heart-universe.tw'
const BRAND = '心宇宙商務中心'

function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ))
}

// Only admins (RentalRequestsClient.tsx, under /admin/(protected)/) trigger these three.
const ADMIN_ONLY_TYPES = new Set(['rental_confirmed', 'rental_cancelled', 'waitlist_promoted'])

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: 'RESEND_API_KEY not set' }, { status: 200 })
  }

  const limiter = rateLimit(`send-email:${requestIp(req)}`, 10, 60_000)
  if (!limiter.allowed) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const body = await req.json()
  const { type } = body

  if (ADMIN_ONLY_TYPES.has(type)) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // Validate that the recipient is tied to a real booking before sending.
  // This prevents arbitrary email abuse without requiring an external rate-limit store.
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  if (type === 'rental_request' || type === 'admin_rental_notification') {
    const supabase = await createAdminClient()
    const email = body.to ?? body.email
    if (email) {
      const { count } = await supabase
        .from('rental_requests')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneHourAgo)
      if (!count) return NextResponse.json({ ok: false, error: 'no_booking' }, { status: 400 })
    }
  }
  if (type === 'event_registration') {
    const supabase = await createAdminClient()
    const email = body.to
    if (email) {
      const { count } = await supabase
        .from('event_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneHourAgo)
      if (!count) return NextResponse.json({ ok: false, error: 'no_registration' }, { status: 400 })
    }
  }

  try {
    if (type === 'event_registration') {
      const { to, name, eventTitle, checkInUrl } = body
      await resend.emails.send({
        from: `${BRAND} <${FROM}>`,
        to,
        subject: `【報名成功】${eventTitle}`,
        html: emailHtml({
          title: '報名確認',
          content: `
            <p>親愛的 <strong>${esc(name)}</strong>，</p>
            <p>您已成功報名《<strong>${esc(eventTitle)}</strong>》，感謝您的參與。</p>
            <p style="margin-top:20px">活動當天請前往現場掃描 QR Code，或至以下連結輸入手機號碼完成簽到：</p>
            <p style="margin-top:12px">
              <a href="${esc(checkInUrl)}" style="color:#C9A96E">${esc(checkInUrl)}</a>
            </p>
            <p style="margin-top:20px;color:#8A8A8A;font-size:13px">如有任何問題，請直接回覆此封 Email。</p>
          `,
        }),
      })
    }

    if (type === 'rental_request') {
      const { to, name, eventTitle, bookingDate, timeSlot, venueName, amount } = body
      await resend.emails.send({
        from: `${BRAND} <${FROM}>`,
        to,
        subject: `【租借申請已收到】${eventTitle} — 請完成匯款`,
        html: emailHtml({
          title: '租借申請確認 — 請完成匯款',
          content: `
            <p>親愛的 <strong>${esc(name)}</strong>，</p>
            <p>我們已收到您的場地租借申請，請依下方帳號完成匯款，我們確認入帳後將正式核可您的預約。</p>
            <table style="margin-top:16px;border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE;width:120px">活動名稱</td><td style="padding:8px 12px"><strong>${esc(eventTitle)}</strong></td></tr>
              ${venueName ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">場地</td><td style="padding:8px 12px">${esc(venueName)}</td></tr>` : ''}
              ${bookingDate ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">日期</td><td style="padding:8px 12px">${esc(bookingDate)}</td></tr>` : ''}
              ${timeSlot ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">時段</td><td style="padding:8px 12px">${esc(timeSlot)}</td></tr>` : ''}
              ${amount ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">應匯金額</td><td style="padding:8px 12px"><strong style="color:#C9A96E">NT$ ${esc(Number(amount).toLocaleString())}</strong></td></tr>` : ''}
            </table>
            <div style="margin-top:28px;padding:20px 24px;background:#FAFAF0;border:1px solid #E8E4DC;border-left:3px solid #C9A96E">
              <p style="margin:0 0 6px;font-size:13px;color:#8A8A8A;letter-spacing:0.1em">✨ 匯款帳號</p>
              <p style="margin:4px 0;font-size:15px;color:#2C2C2C"><strong>中國信託銀行（822）北投分行</strong></p>
              <p style="margin:4px 0;font-size:15px;color:#2C2C2C">帳號：<strong>680541314031</strong></p>
              <p style="margin:4px 0;font-size:15px;color:#2C2C2C">戶名：<strong>財富女神股份有限公司</strong></p>
            </div>
            <p style="margin-top:20px;font-size:13px;color:#8A8A8A">
              完成匯款後，請回覆此封 Email 或來電告知，我們將於確認入帳後寄發收據並正式核可預約。
            </p>
          `,
        }),
      })
    }

    if (type === 'admin_rental_notification') {
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        const { name, phone, email, eventTitle, venueName, bookingDate, timeSlot, guestCount, eventType, note } = body
        await resend.emails.send({
          from: `${BRAND} <${FROM}>`,
          to: adminEmail,
          subject: `【新租借申請】${eventTitle} — ${name}`,
          html: emailHtml({
            title: '新場地租借申請通知',
            content: `
              <p>有一筆新的租借申請，請儘速確認：</p>
              <table style="margin-top:16px;border-collapse:collapse;width:100%;font-size:14px">
                <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE;width:120px">申請人</td><td style="padding:8px 12px">${esc(name)}</td></tr>
                <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">手機</td><td style="padding:8px 12px">${esc(phone)}</td></tr>
                <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">Email</td><td style="padding:8px 12px">${esc(email)}</td></tr>
                <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">活動名稱</td><td style="padding:8px 12px"><strong>${esc(eventTitle)}</strong></td></tr>
                ${venueName ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">場地</td><td style="padding:8px 12px">${esc(venueName)}</td></tr>` : ''}
                ${bookingDate ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">日期</td><td style="padding:8px 12px">${esc(bookingDate)}</td></tr>` : ''}
                ${timeSlot ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">時段</td><td style="padding:8px 12px">${esc(timeSlot)}</td></tr>` : ''}
                ${guestCount ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">人數</td><td style="padding:8px 12px">${esc(guestCount)} 人</td></tr>` : ''}
                ${eventType ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">活動類型</td><td style="padding:8px 12px">${esc(eventType)}</td></tr>` : ''}
                ${note ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">備註</td><td style="padding:8px 12px">${esc(note)}</td></tr>` : ''}
              </table>
              <p style="margin-top:20px"><a href="${esc(process.env.NEXT_PUBLIC_SITE_URL ?? '')}/admin/rental-requests" style="color:#C9A96E">前往後台查看申請</a></p>
            `,
          }),
        })
      }
    }

    if (type === 'rental_cancelled') {
      const { to, name, eventTitle, bookingDate, timeSlot } = body
      await resend.emails.send({
        from: `${BRAND} <${FROM}>`,
        to,
        subject: `【場地租借取消】${eventTitle}`,
        html: emailHtml({
          title: '場地租借申請已取消',
          content: `
            <p>親愛的 <strong>${esc(name)}</strong>，</p>
            <p>您申請的場地租借已被取消：</p>
            <table style="margin-top:16px;border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE;width:120px">活動名稱</td><td style="padding:8px 12px">${esc(eventTitle)}</td></tr>
              ${bookingDate ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">日期</td><td style="padding:8px 12px">${esc(bookingDate)}</td></tr>` : ''}
              ${timeSlot ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">時段</td><td style="padding:8px 12px">${esc(timeSlot)}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px;font-size:13px;color:#8A8A8A">如有疑問，請回覆此封 Email 或重新提交申請。感謝您的諒解。</p>
          `,
        }),
      })
    }

    if (type === 'waitlist_promoted') {
      const { to, name, eventTitle, bookingDate, timeSlot, venueName } = body
      await resend.emails.send({
        from: `${BRAND} <${FROM}>`,
        to,
        subject: `【候補通知】您的候補時段已有空缺 — ${eventTitle}`,
        html: emailHtml({
          title: '候補時段已釋出，請盡速確認',
          content: `
            <p>親愛的 <strong>${esc(name)}</strong>，</p>
            <p>好消息！您候補的時段現在有空缺了，請盡速回覆確認是否仍有意租借：</p>
            <table style="margin-top:16px;border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE;width:120px">活動名稱</td><td style="padding:8px 12px"><strong>${esc(eventTitle)}</strong></td></tr>
              ${venueName ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">場地</td><td style="padding:8px 12px">${esc(venueName)}</td></tr>` : ''}
              ${bookingDate ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">日期</td><td style="padding:8px 12px">${esc(bookingDate)}</td></tr>` : ''}
              ${timeSlot ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">時段</td><td style="padding:8px 12px">${esc(timeSlot)}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px;color:#C9A96E;font-weight:bold">請於 24 小時內回覆此 Email 確認，逾時將保留給下一位候補者。</p>
            <p style="margin-top:12px;font-size:13px;color:#8A8A8A">直接回覆此封 Email 告知「確認租借」即可，我們將盡快為您完成手續。</p>
          `,
        }),
      })
    }

    if (type === 'rental_confirmed') {
      const { to, name, eventTitle, bookingDate, timeSlot, venueName } = body
      await resend.emails.send({
        from: `${BRAND} <${FROM}>`,
        to,
        subject: `【預約核可】${eventTitle} — 場地租借已正式確認`,
        html: emailHtml({
          title: '場地租借已正式核可',
          content: `
            <p>親愛的 <strong>${esc(name)}</strong>，</p>
            <p>恭喜！您的匯款已確認入帳，場地租借預約正式核可。</p>
            <table style="margin-top:16px;border-collapse:collapse;width:100%;font-size:14px">
              <tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE;width:120px">活動名稱</td><td style="padding:8px 12px"><strong>${esc(eventTitle)}</strong></td></tr>
              ${venueName ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">場地</td><td style="padding:8px 12px">${esc(venueName)}</td></tr>` : ''}
              ${bookingDate ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">日期</td><td style="padding:8px 12px">${esc(bookingDate)}</td></tr>` : ''}
              ${timeSlot ? `<tr><td style="padding:8px 12px;color:#8A8A8A;background:#F4F2EE">時段</td><td style="padding:8px 12px">${esc(timeSlot)}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px;font-size:13px;color:#8A8A8A">
              期待您的到來！如有任何問題，請回覆此封 Email 或直接聯繫心宇宙商務中心。
            </p>
          `,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Email send error:', e)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}

function emailHtml({ title, content }: { title: string; content: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#F4F2EE;font-family:'Noto Sans TC',sans-serif">
      <div style="max-width:560px;margin:40px auto;background:#FAFAF8;border:1px solid #E8E4DC">
        <div style="padding:32px 40px;border-bottom:1px solid #E8E4DC">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#8A8A8A;text-transform:uppercase">Heart Universe Business Center</p>
          <p style="margin:4px 0 0;font-size:18px;color:#2C2C2C">心宇宙商務中心</p>
        </div>
        <div style="padding:32px 40px">
          <h2 style="margin:0 0 8px;font-size:20px;color:#2C2C2C">${title}</h2>
          <div style="width:40px;height:1px;background:#C9A96E;margin-bottom:24px"></div>
          ${content}
        </div>
        <div style="padding:20px 40px;border-top:1px solid #E8E4DC;text-align:center">
          <p style="margin:0;font-size:11px;color:#8A8A8A">© ${new Date().getFullYear()} 心宇宙商務中心</p>
        </div>
      </div>
    </body>
    </html>
  `
}
