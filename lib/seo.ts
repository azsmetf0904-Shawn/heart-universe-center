export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://heart-universe-center.vercel.app'

// The main building's address. The B1 charity shop shares this street
// address with a different unit suffix -- see app/charity/page.tsx.
export const HEART_UNIVERSE_ADDRESS = {
  '@type': 'PostalAddress' as const,
  streetAddress: '八德路三段223號',
  addressLocality: '松山區',
  addressRegion: '台北市',
  postalCode: '105',
  addressCountry: 'TW',
}
