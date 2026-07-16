import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隱私政策',
  description: '心宇宙商務中心隱私政策，說明我們如何收集、使用及保護您的個人資料。',
}

export default function PrivacyPage() {
  return (
    <div className="py-24">
      <div className="container-narrow max-w-2xl">
        <p className="label-tag mb-4">Privacy Policy</p>
        <h1 className="text-3xl mb-4">隱私政策</h1>
        <div className="gold-divider" />
        <p className="text-xs text-[var(--gray)] mt-4 mb-12">最後更新：2026 年 7 月</p>

        <div className="flex flex-col gap-10 text-sm text-[var(--charcoal)] leading-loose">
          <section>
            <h2 className="font-serif text-lg mb-3">一、資料收集範圍</h2>
            <p>當您使用本網站提交租借申請、活動報名時，我們會收集以下資料：</p>
            <ul className="list-disc list-inside mt-2 text-[var(--gray)] space-y-1">
              <li>姓名、電話號碼、電子郵件</li>
              <li>活動名稱、日期、人數等租借相關資訊</li>
              <li>您主動提供的備註內容</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">二、資料使用目的</h2>
            <p>所收集資料僅用於以下目的：</p>
            <ul className="list-disc list-inside mt-2 text-[var(--gray)] space-y-1">
              <li>處理場地租借申請及確認通知</li>
              <li>活動報名及簽到管理</li>
              <li>與您進行必要聯繫與服務溝通</li>
            </ul>
            <p className="mt-2">我們不會將您的個人資料出售、出租或提供給第三方，除非法律要求或您明確同意。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">三、資料儲存與安全</h2>
            <p>您的資料儲存於 Supabase 提供的雲端資料庫（主機位於日本東京），受到加密傳輸（HTTPS）及存取控制保護。我們採取合理措施防止未授權存取，但網際網路傳輸本質上無法保證 100% 安全。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">四、Cookie 使用</h2>
            <p>本網站使用基本功能性 Cookie，不使用追蹤性廣告 Cookie。我們可能使用 Vercel Analytics 進行匿名化的訪問流量分析，不識別個人身份。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">五、您的權利</h2>
            <p>您有權查詢、更正或要求刪除您的個人資料。如需行使此權利，請透過租借申請表與我們聯繫。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">六、政策變更</h2>
            <p>我們保留隨時修改本政策的權利，重大變更時將於本頁更新日期。繼續使用本網站即表示您接受修改後的政策。</p>
          </section>
        </div>
      </div>
    </div>
  )
}
