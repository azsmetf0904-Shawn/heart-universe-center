const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

async function lineApiGet(endpoint: string): Promise<unknown | null> {
  if (!ACCESS_TOKEN) return null
  const res = await fetch(`https://api.line.me/v2/bot/${endpoint}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  }).catch(() => null)
  if (!res?.ok) return null
  return res.json().catch(() => null)
}

export async function getLineGroupMemberName(groupId: string, userId: string): Promise<string | null> {
  const data = await lineApiGet(`group/${groupId}/member/${userId}`) as { displayName?: string } | null
  return data?.displayName ?? null
}

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

export async function lineReplyFlex(replyToken: string, altText: string, contents: unknown) {
  await lineApiPost('message/reply', { replyToken, messages: [{ type: 'flex', altText, contents }] })
}

export function buildCalendarButtonFlex(calUrl: string, year: number, month: number) {
  const MONTH_ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical', backgroundColor: '#C4A038', paddingAll: '16px',
      contents: [
        { type: 'text', text: '心宇宙商務中心', color: '#F0D9B0', size: 'xs' },
        { type: 'text', text: `📅 ${year} 年 ${MONTH_ZH[month]} 月 場地月曆`, color: '#FFFFFF', weight: 'bold', size: 'md' },
      ],
    },
    body: {
      type: 'box', layout: 'vertical', paddingAll: '16px',
      contents: [
        { type: 'text', text: '查看本月所有預約時段、狀態及申請人資訊。', size: 'sm', color: '#888888', wrap: true },
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', paddingAll: '12px',
      contents: [
        { type: 'button', style: 'primary', color: '#C4A038', height: 'sm',
          action: { type: 'uri', label: '開啟月曆', uri: calUrl } },
      ],
    },
  }
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

export function lineWaitlistToPayMsg(name: string, eventTitle: string, bookingDate: string, timeSlot: string) {
  return `🎉 候補已確認！

親愛的 ${name}，好消息！您候補的場地時段已有空缺，申請正式受理。

📋 活動：${eventTitle}
📅 日期：${bookingDate}
🕐 時段：${timeSlot}

請於 3 天內完成匯款，並至官網回報匯款資訊，我們確認入帳後將正式核可。

如有疑問請直接聯繫心宇宙商務中心。`
}

export function lineWaitlistMsg(name: string, eventTitle: string, bookingDate: string, timeSlot: string) {
  return `🔔 候補時段已釋出！

親愛的 ${name}，您候補的時段現有空缺：

📋 活動：${eventTitle}
📅 日期：${bookingDate}
🕐 時段：${timeSlot}

請於 24 小時內回覆確認是否仍有意租借，逾時將保留給下一位候補者。`
}

export function lineAdminSetWaitlistMsg(name: string, eventTitle: string, bookingDate: string, timeSlot: string) {
  return `🕐 申請已列為候補

親愛的 ${name}，感謝您的場地租借申請。

由於 ${bookingDate}（${timeSlot}）目前已有其他預約申請，您的申請暫時列為候補。

📋 活動：${eventTitle}

若原預約取消，我們將第一時間聯繫您確認。如有任何問題，請直接聯繫心宇宙商務中心。`
}

export function buildAdminNewBookingFlex(
  bookingId: string,
  name: string, phone: string, email: string, eventTitle: string,
  bookingDate: string, timeSlot: string,
  venueName: string, guestCount: string | null, note: string | null,
  isWaitlist: boolean, lineUserId: string | null = null,
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
        row('Email', email),
        row('活動名稱', eventTitle),
        row('場地', venueName),
        row('日期', bookingDate),
        row('時段', timeSlot),
        ...(guestCount ? [row('人數', `${guestCount} 人`)] : []),
        ...(note ? [{ type: 'separator', margin: 'md' }, row('備註', note)] : []),
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '12px',
      contents: [
        {
          type: 'box', layout: 'horizontal', spacing: 'sm',
          contents: [
            { type: 'button', style: 'primary', color: '#4ade80', height: 'sm',
              action: { type: 'postback', label: '核可', data: postback('confirm') } },
            { type: 'button', style: 'primary', color: '#c084fc', height: 'sm',
              action: { type: 'postback', label: '候補', data: postback('waitlist') } },
            { type: 'button', style: 'primary', color: '#f87171', height: 'sm',
              action: { type: 'postback', label: '取消', data: postback('cancel') } },
          ],
        },
        {
          type: 'button', style: 'secondary', height: 'sm',
          action: { type: 'uri', label: `撥打電話 ${phone}`, uri: `tel:${phone}` },
        },
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

const SITE_URL = 'https://heart-universe-center.vercel.app'

export function buildCustomerBookingConfirmFlex(
  name: string, eventTitle: string, bookingDate: string, timeSlot: string,
  venueName: string, totalAmount: number | null, phone: string, isWaitlist: boolean,
) {
  const headerColor = isWaitlist ? '#8B5CF6' : '#C4A038'

  const row = (label: string, value: string) => ({
    type: 'box', layout: 'horizontal',
    contents: [
      { type: 'text', text: label, color: '#888888', size: 'sm', flex: 2 },
      { type: 'text', text: value || '—', size: 'sm', flex: 3, wrap: true },
    ],
  })

  const bodyContents: unknown[] = [
    ...(venueName ? [row('場地', venueName)] : []),
    ...(bookingDate ? [row('日期', bookingDate)] : []),
    ...(timeSlot ? [row('時段', timeSlot)] : []),
    ...(totalAmount ? [row('預估金額', `NT$ ${totalAmount.toLocaleString()}`)] : []),
  ]

  if (!isWaitlist) {
    bodyContents.push(
      { type: 'separator', margin: 'md' },
      { type: 'text', text: '匯款資訊', weight: 'bold', size: 'sm', margin: 'md', color: '#C4A038' },
      row('銀行', '中國信託 822 北投'),
      row('帳號', '680541314031'),
      row('戶名', '財富女神股份有限公司'),
      { type: 'text', text: '請於 3 個工作日內完成匯款，並點下方按鈕回報。', size: 'xs', color: '#888888', margin: 'sm', wrap: true },
    )
  } else {
    bodyContents.push(
      { type: 'text', text: '若有空缺我們將優先通知您，請靜候佳音。', size: 'xs', color: '#888888', margin: 'sm', wrap: true },
    )
  }

  const myBookingUrl = `${SITE_URL}/my-booking?phone=${encodeURIComponent(phone)}`

  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical', backgroundColor: headerColor, paddingAll: '16px',
      contents: [
        { type: 'text', text: '心宇宙商務中心', color: '#F0D9B0', size: 'xs' },
        { type: 'text', text: `${name}，${isWaitlist ? '已列入候補' : '申請已收到'}！`, color: '#FFFFFF', weight: 'bold', size: 'md' },
        { type: 'text', text: eventTitle, color: '#FFFFFF', size: 'sm', wrap: true },
      ],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '16px',
      contents: bodyContents,
    },
    footer: {
      type: 'box', layout: 'vertical', paddingAll: '12px',
      contents: [
        { type: 'button', style: 'primary', color: '#C4A038', height: 'sm',
          action: { type: 'uri', label: '查詢申請 / 回報匯款', uri: myBookingUrl } },
      ],
    },
  }
}
