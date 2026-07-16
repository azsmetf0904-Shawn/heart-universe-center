const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

async function lineApiPost(endpoint: string, body: unknown) {
  if (!ACCESS_TOKEN) {
    console.error('[LINE] LINE_CHANNEL_ACCESS_TOKEN not set')
    return
  }
  const res = await fetch(`https://api.line.me/v2/bot/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ACCESS_TOKEN}` },
    body: JSON.stringify(body),
  }).catch(err => { console.error('[LINE] fetch error:', err); return null })
  if (res && !res.ok) {
    const errBody = await res.text().catch(() => '')
    console.error(`[LINE] ${endpoint} failed ${res.status}: ${errBody}`)
  }
}

export async function linePush(to: string, text: string) {
  await lineApiPost('message/push', { to, messages: [{ type: 'text', text }] })
}

export async function linePushFlex(to: string, altText: string, contents: unknown) {
  await lineApiPost('message/push', { to, messages: [{ type: 'flex', altText, contents }] })
}

export async function lineReply(replyToken: string, text: string) {
  await lineApiPost('message/reply', { replyToken, messages: [{ type: 'text', text }] })
}

export function lineConfirmedMsg(name: string, eventTitle: string, bookingDate: string, timeSlot: string) {
  return `✅ 場地租借確認！

親愛的 ${name}，您的匯款已確認入帳，場地租借正式核可。

📋 活動：${eventTitle}
📅 日期：${bookingDate}
🕐 時段：${timeSlot}

期待您的到來！如有任何問題請直接聯繫心宇宙商務中心。`
}

export function lineCancelledMsg(name: string, eventTitle: string) {
  return `😔 場地租借申請取消

親愛的 ${name}，您申請的《${eventTitle}》場地租借申請已被取消。

如有疑問請直接聯繫心宇宙商務中心，我們很樂意為您重新安排。`
}

export function lineWaitlistMsg(name: string, eventTitle: string, bookingDate: string, timeSlot: string) {
  return `🔔 候補時段已釋出！

親愛的 ${name}，您候補的時段現有空缺：

📋 活動：${eventTitle}
📅 日期：${bookingDate}
🕐 時段：${timeSlot}

請於 24 小時內回覆確認是否仍有意租借，逾時將保留給下一位候補者。`
}

export function buildAdminNewBookingFlex(
  bookingId: string,
  name: string, phone: string, eventTitle: string,
  bookingDate: string, timeSlot: string,
  venueName: string, guestCount: string | null, note: string | null,
  isWaitlist: boolean,
) {
  const postback = (action: string) => `action=${action}&bookingId=${bookingId}`
  const headerColor = isWaitlist ? '#8B5CF6' : '#C4A038'
  const headerText = isWaitlist ? '🔔 新候補申請' : '📋 新預約申請'

  const row = (label: string, value: string) => ({
    type: 'box', layout: 'horizontal',
    contents: [
      { type: 'text', text: label, color: '#888888', size: 'sm', flex: 2 },
      { type: 'text', text: value || '—', size: 'sm', flex: 3, wrap: true },
    ],
  })

  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical',
      backgroundColor: headerColor, paddingAll: '16px',
      contents: [{ type: 'text', text: headerText, color: '#FFFFFF', weight: 'bold', size: 'md' }],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '16px',
      contents: [
        row('申請人', name),
        row('電話', phone),
        row('活動名稱', eventTitle),
        row('場地', venueName),
        row('日期', bookingDate),
        row('時段', timeSlot),
        ...(guestCount ? [row('人數', `${guestCount} 人`)] : []),
        ...(note ? [{ type: 'separator', margin: 'md' }, row('備註', note)] : []),
      ],
    },
    footer: {
      type: 'box', layout: 'horizontal', spacing: 'sm', paddingAll: '12px',
      contents: [
        { type: 'button', style: 'primary', color: '#4ade80', height: 'sm',
          action: { type: 'postback', label: '核可', data: postback('confirm') } },
        { type: 'button', style: 'primary', color: '#c084fc', height: 'sm',
          action: { type: 'postback', label: '候補', data: postback('waitlist') } },
        { type: 'button', style: 'primary', color: '#f87171', height: 'sm',
          action: { type: 'postback', label: '取消', data: postback('cancel') } },
      ],
    },
  }
}

export function buildAdminPaymentFlex(
  bookingId: string,
  name: string, eventTitle: string, bookingDate: string, timeSlot: string,
  last5: string, paymentDate: string, amount: number,
) {
  const postback = (action: string) =>
    `action=${action}&bookingId=${bookingId}`

  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical',
      backgroundColor: '#C4A038', paddingAll: '16px',
      contents: [{ type: 'text', text: '💰 客戶已回報匯款', color: '#FFFFFF', weight: 'bold', size: 'md' }],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '16px',
      contents: [
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '申請人', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: name, size: 'sm', flex: 3, wrap: true },
        ]},
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '活動', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: eventTitle, size: 'sm', flex: 3, wrap: true },
        ]},
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '日期', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: bookingDate, size: 'sm', flex: 3 },
        ]},
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '時段', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: timeSlot, size: 'sm', flex: 3 },
        ]},
        { type: 'separator', margin: 'md' },
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '末5碼', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: last5, size: 'sm', flex: 3, weight: 'bold' },
        ]},
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '匯款日', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: paymentDate, size: 'sm', flex: 3 },
        ]},
        { type: 'box', layout: 'horizontal', contents: [
          { type: 'text', text: '金額', color: '#888888', size: 'sm', flex: 2 },
          { type: 'text', text: `NT$ ${amount.toLocaleString()}`, size: 'sm', flex: 3, weight: 'bold', color: '#C4A038' },
        ]},
      ],
    },
    footer: {
      type: 'box', layout: 'horizontal', spacing: 'sm', paddingAll: '12px',
      contents: [
        {
          type: 'button', style: 'primary', color: '#4ade80', height: 'sm',
          action: { type: 'postback', label: '核可', data: postback('confirm') },
        },
        {
          type: 'button', style: 'primary', color: '#c084fc', height: 'sm',
          action: { type: 'postback', label: '候補', data: postback('waitlist') },
        },
        {
          type: 'button', style: 'primary', color: '#f87171', height: 'sm',
          action: { type: 'postback', label: '取消', data: postback('cancel') },
        },
      ],
    },
  }
}
