type LineProfile = { userId: string }

export async function verifyLineAccessToken(accessToken: string): Promise<LineProfile | null> {
  if (!accessToken) return null
  const verify = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ access_token: accessToken }),
    cache: 'no-store',
  })
  if (!verify.ok) return null

  const profile = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!profile.ok) return null
  const data = await profile.json() as { userId?: string }
  return data.userId ? { userId: data.userId } : null
}
