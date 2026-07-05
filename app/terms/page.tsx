import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '服務條款',
  description: '心宇宙商務中心服務條款，使用本網站及場地服務前請詳細閱讀。',
}

export default function TermsPage() {
  return (
    <div className="py-24">
      <div className="container-narrow max-w-2xl">
        <p className="label-tag mb-4">Terms of Service</p>
        <h1 className="text-3xl mb-4">服務條款</h1>
        <div className="gold-divider" />
        <p className="text-xs text-[var(--gray)] mt-4 mb-12">最後更新：2025 年 1 月</p>

        <div className="flex flex-col gap-10 text-sm text-[var(--charcoal)] leading-loose">
          <section>
            <h2 className="font-serif text-lg mb-3">一、服務範圍</h2>
            <p>心宇宙商務中心（以下簡稱「本中心」）提供場地租借申請、活動課程報名及 QR Code 簽到等服務。本條款適用於所有透過本網站使用上述服務的用戶。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">二、租借申請</h2>
            <ul className="list-disc list-inside text-[var(--gray)] space-y-1">
              <li>線上申請並非立即確認，需由工作人員於一個工作日內確認時段可用性</li>
              <li>確認後方視為有效預訂，費用以工作人員確認通知為準</li>
              <li>本中心保留拒絕不適當申請的權利</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">三、取消與退款</h2>
            <ul className="list-disc list-inside text-[var(--gray)] space-y-1">
              <li>確認後取消請提前 3 個工作日告知</li>
              <li>未提前告知取消者，本中心保留收取行政費用的權利</li>
              <li>因不可抗力因素（天災等）取消，雙方協商退款或改期</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">四、場地使用規範</h2>
            <ul className="list-disc list-inside text-[var(--gray)] space-y-1">
              <li>租借時間內請勿從事違法活動或造成鄰近騷擾</li>
              <li>使用後請維持場地整潔，否則酌收清潔費</li>
              <li>超時使用依計費標準收費，請提前告知</li>
              <li>場地設備如有損壞，租借人須負賠償責任</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">五、活動報名</h2>
            <p>活動報名成功後，主辦方可能因故取消或延期活動，將以 Email 通知報名者並協商退款事宜。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">六、免責聲明</h2>
            <p>本中心對因使用本網站或場地服務所產生的任何間接損失，不承擔責任。網站上的資訊（含定價）以工作人員確認通知為準，網站顯示內容僅供參考。</p>
          </section>

          <section>
            <h2 className="font-serif text-lg mb-3">七、準據法</h2>
            <p>本條款依中華民國法律解釋，如有爭議以台北地方法院為第一審管轄法院。</p>
          </section>
        </div>
      </div>
    </div>
  )
}
