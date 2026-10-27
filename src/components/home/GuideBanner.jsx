import Reveal from '../ui/Reveal.jsx'

const steps = [
  { number: '01', label: 'اختار الوجهة', story: 'step-pop [--from:30%] [--to:42%]', line: 'step-draw [--from:40%] [--to:50%]' },
  { number: '02', label: 'اعرف ما تقدّمه', story: 'step-pop [--from:48%] [--to:60%]', line: 'step-draw [--from:58%] [--to:68%]' },
  { number: '03', label: 'ابدأ بخطوتك', story: 'step-pop [--from:66%] [--to:78%]' },
]

export default function GuideBanner({ onExplore }) {
  return (
    <section aria-labelledby="guide-banner-title" className="story story-180 px-4 pt-20 md:px-[46px]">
      <div className="story__pin">
      <Reveal className="step-pop step-enter [--from:20%] [--to:8%] relative mx-auto grid w-full max-w-[1073px] items-center gap-12 overflow-hidden rounded-[34px] bg-(--color-page-guide-panel) px-6 py-12 md:grid-cols-2 md:gap-[70px] md:p-[70px]">
        <div className="step-up [--from:12%] [--to:28%]">
          <p className="pb-[19px] text-sm leading-[24.5px] font-bold text-(color:--color-home-banner-eyebrow)">أدوات تناسب لحظتك</p>
          <h2 id="guide-banner-title" className="text-[32px] leading-[1.3] tracking-[-0.02em] text-white md:text-[42px]">
            مش عارف تبدأ منين؟
          </h2>
          <p className="max-w-[405px] pt-3 text-lg leading-[31.5px] text-(color:--color-home-banner-text)">
            تعرّف على كل مساحة داخل ميورا، واقرأ ما تقدّمه قبل الانتقال إليها.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-6 inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-white px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-guide-panel) outline-white"
          >
            افتح دليل المنصة
            <img src="/icons/guide/arrow.svg" alt="" width="18" height="18" className="-scale-x-100" />
          </button>
        </div>
        <ol className="relative z-10 flex items-start justify-center">
          {steps.map((step, index) => (
            <li key={step.number} className="flex items-start">
              <div className={`${step.story} flex w-[84px] flex-col items-center sm:w-[100px]`}>
                <span className="grid size-14 place-items-center rounded-full border border-white/35 bg-white/11 text-base leading-7 font-bold text-white">{step.number}</span>
                <span className="pt-2 text-center text-[13px] leading-[22.75px] text-white">{step.label}</span>
              </div>
              {index < steps.length - 1 && <span aria-hidden="true" className={`${step.line} mt-7 h-px w-6 bg-white/25 sm:w-[66px]`} />}
            </li>
          ))}
        </ol>
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-[220px] -left-[120px] size-[360px] rounded-full border-[70px] border-white/6" />
      </Reveal>
      </div>
    </section>
  )
}
