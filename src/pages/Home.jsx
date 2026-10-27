import { useState } from 'react'
import GuideDialog from '../components/GuideDialog.jsx'

export default function Home() {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <title>ميورا | مساحة هادئة. خطوة حقيقية.</title>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl leading-[1.3] md:text-[58px]">مساحة هادئة. خطوة حقيقية.</h1>
        <p className="max-w-xl text-lg leading-8 text-(color:--color-page-muted)">الصفحة الرئيسية الكاملة تُبنى في المرحلة 3.</p>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="min-h-12 cursor-pointer rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-page-button) outline-(--color-page-primary)"
        >
          استكشف المنصة
        </button>
      </main>
      <GuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}
