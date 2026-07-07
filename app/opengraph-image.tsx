import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '心宇宙商務中心'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SITE = 'https://heart-universe-center.vercel.app'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(160deg, #1C1008 0%, #261608 40%, #2E1C0C 70%, #1A0E06 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top gold line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #C4A038 20%, #C4A038 80%, transparent)',
        }} />

        {/* Logo */}
        <img
          src={`${SITE}/logo.svg?v=2`}
          width={280}
          height={280}
          style={{ objectFit: 'contain', marginBottom: 32 }}
        />

        {/* Brand name */}
        <div style={{
          fontSize: 56, color: 'rgba(244,239,230,0.92)',
          letterSpacing: '0.18em', marginBottom: 12, fontWeight: 300,
        }}>
          心宇宙商務中心
        </div>

        {/* English */}
        <div style={{
          fontSize: 18, color: 'rgba(196,160,56,0.9)',
          letterSpacing: '0.35em', marginBottom: 32,
        }}>
          HEART UNIVERSE · TAIPEI
        </div>

        {/* Divider */}
        <div style={{ width: 60, height: 1, background: '#C4A038', opacity: 0.6, marginBottom: 32 }} />

        {/* Subtitle */}
        <div style={{
          fontSize: 22, color: 'rgba(244,239,230,0.55)',
          letterSpacing: '0.15em',
        }}>
          台北八德路 · 場地租借 · 課程活動
        </div>

        {/* Bottom gold line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #C4A038 20%, #C4A038 80%, transparent)',
        }} />
      </div>
    ),
    { ...size },
  )
}
