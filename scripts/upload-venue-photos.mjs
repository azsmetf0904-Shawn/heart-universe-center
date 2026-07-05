import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import ws from 'ws'

const SUPABASE_URL = 'https://sdxwufrolnbobstfuvtc.supabase.co'
const SERVICE_ROLE_KEY = 'REDACTED_SERVICE_ROLE_KEY'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
})

// 照片清單：本地路徑 → SEO 優化檔名 → alt text
const PHOTOS = [
  // 夏米雅瑜伽課
  {
    local: '/Users/a123/Downloads/夏米雅瑜伽課/S__117080154_0.jpg',
    seoName: 'xinyu-venue-yoga-class-taipei-1.jpg',
    alt: '心宇宙商務中心多功能空間 瑜伽課程 台北場地租借',
    sortOrder: 1,
  },
  {
    local: '/Users/a123/Downloads/夏米雅瑜伽課/S__117080155_0.jpg',
    seoName: 'xinyu-venue-yoga-class-taipei-2.jpg',
    alt: '心宇宙商務中心多功能空間 瑜伽教室 台北課程場地',
    sortOrder: 2,
  },
  // 斷捨離親子日
  {
    local: '/Users/a123/Downloads/斷捨離親子日活動照片/S__117080141_0.jpg',
    seoName: 'xinyu-venue-children-event-taipei-1.jpg',
    alt: '心宇宙商務中心 親子活動 大型活動場地 台北八德路',
    sortOrder: 3,
  },
  {
    local: '/Users/a123/Downloads/斷捨離親子日活動照片/S__117080142_0.jpg',
    seoName: 'xinyu-venue-children-event-taipei-2.jpg',
    alt: '心宇宙商務中心 親子講座 投影螢幕 台北活動空間',
    sortOrder: 4,
  },
  {
    local: '/Users/a123/Downloads/斷捨離親子日活動照片/S__117080143_0.jpg',
    seoName: 'xinyu-venue-children-event-taipei-3.jpg',
    alt: '心宇宙商務中心 多功能空間 台北親子活動租借',
    sortOrder: 5,
  },
  {
    local: '/Users/a123/Downloads/斷捨離親子日活動照片/S__117080144_0.jpg',
    seoName: 'xinyu-venue-children-event-taipei-4.jpg',
    alt: '心宇宙商務中心 活動場地 台北八德路場地租借',
    sortOrder: 6,
  },
  // 嗨營業中記者會
  {
    local: '/Users/a123/Downloads/嗨營業中第七集開播記者會/S__117080147_0.jpg',
    seoName: 'xinyu-venue-press-conference-taipei-1.jpg',
    alt: '心宇宙商務中心 記者會場地 台北媒體發表會空間',
    sortOrder: 7,
  },
  {
    local: '/Users/a123/Downloads/嗨營業中第七集開播記者會/S__117080148_0.jpg',
    seoName: 'xinyu-venue-press-conference-taipei-2.jpg',
    alt: '心宇宙商務中心 發表會佈置 投影布幕 台北場地',
    sortOrder: 8,
  },
  {
    local: '/Users/a123/Downloads/嗨營業中第七集開播記者會/S__117080150_0.jpg',
    seoName: 'xinyu-venue-press-conference-taipei-3.jpg',
    alt: '心宇宙商務中心 氣球佈置 多功能空間 台北八德路',
    sortOrder: 9,
  },
  {
    local: '/Users/a123/Downloads/嗨營業中第七集開播記者會/S__117080151_0.jpg',
    seoName: 'xinyu-venue-press-conference-taipei-4.jpg',
    alt: '心宇宙商務中心 活動租借 台北商務中心場地',
    sortOrder: 10,
  },
]

async function main() {
  // ── 1. 建立場地記錄 ──
  console.log('建立場地記錄…')
  const { data: existing } = await supabase.from('venues').select('id, slug').limit(1)
  let venueId

  if (existing && existing.length > 0) {
    venueId = existing[0].id
    console.log(`已有場地：${existing[0].slug}，使用其 ID`)
  } else {
    const { data: venue, error: venueErr } = await supabase
      .from('venues')
      .insert({
        name: '多功能大廳',
        slug: 'main-hall',
        description: '心宇宙商務中心旗艦場地。寬敞明亮的工業風開放空間，挑高天花板搭配大型投影設備，可彈性切換瑜伽課程、工作坊、親子活動、記者會等多種佈置形式。適合 10–100 人各規模活動。',
        area_ping: 95,
        capacity: 100,
        is_active: true,
        layout_capacities: { 教室型: 60, 蜈蚣型: 50, 分組型: 40, 講座型: 100, U型: 30 },
        equipment: ['大型投影設備', '音響系統', '白板', '冷暖氣', '無線網路', '獨立門禁'],
      })
      .select('id')
      .single()

    if (venueErr) { console.error('場地建立失敗:', venueErr.message); process.exit(1) }
    venueId = venue.id
    console.log(`場地建立成功：${venueId}`)
  }

  // ── 2. 上傳照片到 Supabase Storage ──
  const uploadedUrls = []

  for (const photo of PHOTOS) {
    const file = readFileSync(photo.local)
    const storagePath = `venues/${venueId}/${photo.seoName}`

    process.stdout.write(`上傳 ${photo.seoName}… `)

    const { error: uploadErr } = await supabase.storage
      .from('venues-photos')
      .upload(storagePath, file, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '31536000',
      })

    if (uploadErr) {
      console.log(`❌ ${uploadErr.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('venues-photos')
      .getPublicUrl(storagePath)

    uploadedUrls.push({ url: publicUrl, alt: photo.alt, sortOrder: photo.sortOrder })
    console.log('✓')
  }

  // ── 3. 寫入 venue_photos 記錄 ──
  console.log('\n寫入 venue_photos…')
  const { error: photoErr } = await supabase.from('venue_photos').insert(
    uploadedUrls.map(u => ({
      venue_id: venueId,
      image_url: u.url,
      alt_text: u.alt,
      sort_order: u.sortOrder,
    }))
  )

  if (photoErr) {
    // alt_text 欄位可能不存在，改不帶 alt_text 重試
    const { error: photoErr2 } = await supabase.from('venue_photos').insert(
      uploadedUrls.map(u => ({
        venue_id: venueId,
        image_url: u.url,
        sort_order: u.sortOrder,
      }))
    )
    if (photoErr2) { console.error('venue_photos 寫入失敗:', photoErr2.message) }
    else console.log(`✓ 寫入 ${uploadedUrls.length} 筆（不含 alt_text）`)
  } else {
    console.log(`✓ 寫入 ${uploadedUrls.length} 筆（含 alt_text）`)
  }

  console.log('\n全部完成！')
  console.log(`場地 ID: ${venueId}`)
  console.log(`照片數量: ${uploadedUrls.length} / ${PHOTOS.length}`)
}

main().catch(console.error)
