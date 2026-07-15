<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Current Progress

**Production URL**: https://heart-universe-center.vercel.app  
**Repo**: `/Users/a123/heart-universe-center` (Next.js App Router)  
**Last updated**: 2026-07-15

---

### Hand-off Notes (DO NOT change without user confirmation)

- **Homepage right-side photo group** — currently showing the original 斷捨離親子日 photo set. Do NOT switch it back to the BOSS training set under any circumstance unless the user explicitly asks.
- **Mobile CTA** — current compact floating card (three feature icons + gold primary button + short support line) has confirmed proportions. Do not alter proportions; if asked for a visual pass, change proportions first before touching colors or content.
- **Desktop hero vertical position** — was intentionally shifted down in multiple increments to sit closer to the stats strip below. This offset is deliberate; do not "fix" it.
- **Live production site** — `https://heart-universe-center.vercel.app`

---

### Executable Backlog

Run the following serially, with a build check after each phase:

1. P1-A Home Past Events
   - Add a `Past Events` section after the Stats block in `app/page.tsx`.
   - Query `events` from the server client with `status = 'ended'`, `cover_image_url` present, ordered by `start_time desc`, limited to 3.
   - Include `organizer_name` in the query.
   - Render 3 linked cards to `/events/[slug]` with cover image, title, date, and organizer.
   - Do not render anything when no data exists.
   - Keep the existing Hero, Stats, Showcase, and other homepage sections unchanged.

2. P1-B Event Reviews
   - Add `supabase/migrations/003_event_reviews.sql`.
   - Make the migration idempotent by dropping policies before recreating them, or otherwise guarding policy creation.
   - Add indexes on `event_id` and `created_at`.
   - Create `app/events/[slug]/ReviewForm.tsx` as a client component.
   - After successful submit, call `router.refresh()` so the list updates immediately.
   - Show the reviews block only when the event status is `ended`.

3. P2-A Brand Manifesto
   - Add the manifesto section after Showcase and before Footer.
   - Keep the rest of the homepage untouched.

4. P2-B Community Page
   - Add `/community`.
   - Prefer adding the link in Footer first unless Navbar layout stays clean.
   - Add the route to `app/sitemap.ts`.

5. P2-C Venue FAQ JSON-LD
   - Add FAQPage JSON-LD to `app/venues/[slug]/page.tsx`.
   - Fix the provided schema so it is valid JSON/TS.
   - Keep the FAQ answers aligned with visible venue copy.

Build/check order:
- After each of P1-A, P1-B, and all P2 items, run `npx tsc --noEmit` and `npm run build`.
- Deploy only after the final build succeeds.

---

### System Architecture

**Framework**: Next.js App Router (TypeScript)  
**Backend**: Supabase (`sdxwufrolnbobstfuvtc`) — Auth, PostgreSQL, Storage  
**Deploy**: Vercel project `heart-universe-center` (azsmetf0904-5469s-projects)  
**Payments**: manual bank transfer (中國信託 822 北投分行，帳號 680541314031，戶名 財富女神股份有限公司)  
**Notifications**: LINE Messaging API + Resend email

---

### Booking Flow (Final — 2026-07-09)

```
/rent → Step1(基本資料) → Step2(加購) → Step3(確認 + LINE 軟提示)
  ↓ 送出
成功頁：申請編號 + 匯款資訊 + 「我已完成匯款」按鈕
  ↓ 客戶填末5碼/日期/金額
管理員 LINE 群組（Cbbe1911fb00445cb5dea273ebf1d7c50）收到 Flex Message
  ↓ 管理員點核可/候補/取消
rental_requests.status 更新 → 客戶 LINE 推播
```

**Status machine**: `pending` → `payment_pending` → `confirmed` / `waitlist` / `cancelled` / `completed`

**Key rules**:
- No LINE login gate before form — soft prompt only on Step 3
- LINE is optional; booking works without it

---

### Pages & Routes

| Path | File | Status |
|------|------|--------|
| `/` | `app/page.tsx` | ✅ |
| `/availability` | `app/availability/page.tsx` | ✅ |
| `/rent` | `app/rent/page.tsx` | ✅ (3-step + success) |
| `/my-booking` | `app/my-booking/page.tsx` | ✅ (匯款回報內嵌) |
| `/admin/*` | `app/admin/(protected)/` | ✅ (月曆＋列表) |
| `/events/*` | `app/events/` | ✅ |
| `/venues` | `app/venues/` | ✅ |
| `/showcase` | `app/showcase/` | ✅ |

### API Routes

| Route | File | Function |
|-------|------|----------|
| `/api/line/webhook` | `app/api/line/webhook/route.ts` | join/postback/message handler |
| `/api/line/notify` | `app/api/line/notify/route.ts` | 推播（客戶＋管理員） |
| `/api/send-email` | `app/api/send-email/route.ts` | Resend 寄信 |
| `/api/availability` | `app/api/availability/` | 可用時段查詢 |

---

### Recently Changed Files (last 7 commits)

| File | What changed |
|------|-------------|
| `app/api/line/notify/route.ts` | 群組推播支援，Emoji 移除防截斷 |
| `app/api/line/webhook/route.ts` | postback 核可/候補/取消按鈕處理，join 事件推 group ID |
| `app/my-booking/page.tsx` | 匯款回報內嵌表單（末5碼/日期/金額），送出後推管理員 |
| `app/rent/page.tsx` | 移除 LINE 強制門檻，成功頁加匯款資訊，LINE OA 加入提示 |
| `lib/line.ts` | Flex Message 樣板，LINE API 輔助函式 |

---

### Design System (quick ref)

```
主金色:   #C4A038 / rgba(196,160,56,X)
深色背景: #1C1008 / #1A0E06
石材牆:   #EDE4D4 → #DDD3C0
Logo:     /public/logo.svg (已去背，金邊 drop-shadow)
  Navbar: filter: drop-shadow(0 0 1px rgba(196,160,56,0.40))
  Hero:   filter: drop-shadow(0 0 2px rgba(196,160,56,0.40))
```

---

### Notes for Next Agent

- If touching the homepage, do not alter the right-side photo grid, mobile CTA layout, or desktop hero vertical offset.
- If adding LINE features, reference `lib/line.ts` for existing helpers and Flex Message templates.
- Admin LINE group ID: `Cbbe1911fb00445cb5dea273ebf1d7c50` (審核群組，優先用這個).
- `rental_requests` table has `payment_last5`, `payment_date`, `payment_amount`, `payment_reported_at` columns (added for payment reporting flow).
- `venue_pricing` stores 6 rows: weekday/holiday × morning/afternoon/evening at NT$15,000/18,000 per 3-hour slot.
