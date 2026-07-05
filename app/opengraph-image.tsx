import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '心宇宙商務中心'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAFAF8',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold accent bar */}
        <div style={{ width: 60, height: 2, background: '#C9A96E', marginBottom: 32 }} />

        {/* English */}
        <div style={{ fontSize: 16, letterSpacing: '0.2em', color: '#8A8A8A', textTransform: 'uppercase', marginBottom: 16 }}>
          Heart Universe Business Center
        </div>

        {/* Chinese title */}
        <div style={{ fontSize: 72, color: '#2C2C2C', fontWeight: 300, lineHeight: 1.2, marginBottom: 24 }}>
          心宇宙商務中心
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 24, color: '#8A8A8A', letterSpacing: '0.1em' }}>
          台北八德路  ·  場地租借  ·  活動課程
        </div>

        {/* Bottom gold line */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            right: 80,
            height: 1,
            background: '#E8E4DC',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 80,
            fontSize: 14,
            color: '#C9A96E',
            letterSpacing: '0.15em',
          }}
        >
          heart-universe-center.vercel.app
        </div>
      </div>
    ),
    { ...size },
  )
}
