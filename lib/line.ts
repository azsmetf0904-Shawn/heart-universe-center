const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

export async function linePush(to: string, text: string) {
  if (!ACCESS_TOKEN) return
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: 'text', text }] }),
  }).catch(() => {})
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

export function lineAdminPaymentMsg(
  name: string, eventTitle: string, bookingDate: string, timeSlot: string,
  last5: string, paymentDate: string, amount: number, adminUrl: string,
) {
  return `💰 客戶已回報匯款

申請人：${name}
活動：${eventTitle}
日期：${bookingDate}
時段：${timeSlot}

匯款末5碼：${last5}
匯款日期：${paymentDate}
匯款金額：NT$ ${amount.toLocaleString()}

請至後台確認入帳後核可預約：
${adminUrl}`
}
