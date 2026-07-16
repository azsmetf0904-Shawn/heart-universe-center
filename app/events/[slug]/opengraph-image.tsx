import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('title, start_time, is_paid, price')
    .eq('slug', slug)
    .single()

  const title = data?.title ?? '活動詳情'
  const date = data?.start_time
    ? new Date(data.start_time).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    : ''
  const price = data?.is_paid ? `NT$ ${Number(data.price).toLocaleString()}` : '免費入場'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(160deg, #1C1008 0%, #261608 50%, #1A0E06 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top gold bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #C4A038 20%, #C4A038 80%, transparent)' }} />

        {/* Label */}
        <div style={{ fontSize: 13, color: 'rgba(196,160,56,0.85)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 40 }}>
          心宇宙商務中心 · EVENT
        </div>

        {/* Title */}
        <div style={{ fontSize: title.length > 20 ? 48 : 60, color: '#fff', fontWeight: 600, lineHeight: 1.25, flex: 1, display: 'flex', alignItems: 'center' }}>
          {title}
        </div>

        {/* Footer meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
          {date && (
            <span style={{ fontSize: 18, color: 'rgba(244,239,230,0.65)', letterSpacing: '0.05em' }}>
              {date}
            </span>
          )}
          <span style={{ fontSize: 20, color: '#C4A038', fontWeight: 500 }}>
            {price}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 14, color: 'rgba(244,239,230,0.35)', letterSpacing: '0.3em' }}>
            heart-universe-center.vercel.app
          </span>
        </div>

        {/* Bottom gold bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #C4A038 20%, #C4A038 80%, transparent)' }} />
      </div>
    ),
    { ...size },
  )
}
