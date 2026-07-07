import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { linePush } from '@/lib/line'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-line-signature') ?? ''

  const hash = createHmac('sha256', process.env.LINE_CHANNEL_SECRET ?? '')
    .update(body).digest('base64')
  if (hash !== signature) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { events } = JSON.parse(body) as { events: LineEvent[] }
  const supabase = await createClient()

  for (const event of events ?? []) {
    if (event.type !== 'message' || event.message?.type !== 'text') continue
    const userId = event.source?.userId
    if (!userId) continue

    const code = event.message.text.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(code)) continue

    const { data } = await supabase
      .from('rental_requests')
      .update({ line_user_id: userId })
      .eq('line_code', code)
      .is('line_user_id', null)
      .select('name')
      .maybeSingle()

    if (data?.name) {
      await linePush(userId, `✅ 驗證成功！${data.name}，LINE 通知已啟用。\n\n審核結果將直接透過此帳號通知您，請耐心等候。😊`)
    } else {
      await linePush(userId, '⚠️ 驗證碼無效或已使用，請確認驗證碼是否正確。')
    }
  }

  return NextResponse.json({ ok: true })
}

type LineEvent = {
  type: string
  source?: { userId?: string }
  message?: { type: string; text: string }
}
