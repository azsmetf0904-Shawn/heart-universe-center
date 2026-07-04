import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const FROM = process.env.RESEND_FROM ?? 'noreply@heart-universe.tw'
const BRAND = '心宇宙商務中心'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: 'RESEND_API_KEY not set' }, { status: 200 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  const body = await req.json()
  const { type } = body

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
            <p>親愛的 <strong>${name}</strong>，</p>
            <p>您已成功報名《<strong>${eventTitle}</strong>》，感謝您的參與。</p>
            <p style="margin-top:20px">活動當天請前往現場掃描 QR Code，或至以下連結輸入手機號碼完成簽到：</p>
            <p style="margin-top:12px">
              <a href="${checkInUrl}" style="color:#C9A96E">${checkInUrl}</a>
            </p>
            <p style="margin-top:20px;color:#8A8A8A;font-size:13px">如有任何問題，請直接回覆此封 Email。</p>
          `,
        }),
      })
    }

    if (type === 'rental_request') {
      const { to, name, eventTitle, bookingDate, timeSlot, venueName } = body
      await resend.emails.send({
        from: `${BRAND} <${FROM}>`,
        to,
        subject: `【租借申請已收到】${eventTitle}`,
        html: emailHtml({
          title: '租借申請確認',
          content: `
            <p>親愛的 <strong>${name}</strong>，</p>
            <p>我們已收到您的場地租借申請：</p>
            <table style="margin-top:16px;border-collapse:collapse;width:100%">
              <tr><td style="padding:8px 0;color:#8A8A8A;width:100px">活動名稱</td><td>${eventTitle}</td></tr>
              ${venueName ? `<tr><td style="padding:8px 0;color:#8A8A8A">場地</td><td>${venueName}</td></tr>` : ''}
              ${bookingDate ? `<tr><td style="padding:8px 0;color:#8A8A8A">日期</td><td>${bookingDate}</td></tr>` : ''}
              ${timeSlot ? `<tr><td style="padding:8px 0;color:#8A8A8A">時段</td><td>${timeSlot}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px">我們將於一個工作日內與您確認時段可用性及費用，敬請留意 Email 或電話通知。</p>
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
