type LineProfile = { userId: string }

export async function verifyLineAccessToken(accessToken: string): Promise<LineProfile | null> {
  if (!accessToken) return null
  // 驗證 access token 要用 GET + query string，不是 POST + body。
  // POST /oauth2/v2.1/verify 是設計給「驗證 id_token」用的（要求欄位是
  // id_token），之前誤用同一支端點驗證 access_token，導致這個函式從
  // 未真正驗證成功過（連既有的 /liff/payment-report 也受影響）。
  const verify = await fetch(`https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(accessToken)}`, {
    cache: 'no-store',
  })
  if (!verify.ok) {
    console.error('[line-auth] /oauth2/v2.1/verify failed:', verify.status, await verify.text().catch(() => ''))
    return null
  }

  const profile = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!profile.ok) {
    console.error('[line-auth] /v2/profile failed:', profile.status, await profile.text().catch(() => ''))
    return null
  }
  const data = await profile.json() as { userId?: string }
  return data.userId ? { userId: data.userId } : null
}
