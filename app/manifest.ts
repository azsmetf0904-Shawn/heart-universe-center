import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '心宇宙商務中心',
    short_name: '心宇宙',
    description: '台北八德路精品場地租借 × 活動課程',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#C9A96E',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/favicon.ico', sizes: '192x192', type: 'image/x-icon' },
      { src: '/favicon.ico', sizes: '512x512', type: 'image/x-icon' },
    ],
  }
}
