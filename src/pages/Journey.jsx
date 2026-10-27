import { Link } from 'react-router'
import { journeySteps } from '../data/journey.js'

export default function Journey() {
  return (
    <>
      <title>رحلة العافية النفسية | ميورا</title>
      <meta name="description" content="مسار مقترح من خمس محطات يساعدك على استخدام أدوات ميورا بترتيب واضح وخطوات صغيرة." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[70px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">رحلة العافية النفسية</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">خطوة صغيرة، ثم خطوة أخرى</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">
            مسار مقترح من خمس محطات يساعدك على استخدام أدوات ميورا بترتيب واضح. يمكنك البدء من أي محطة، ولا يوجد ترتيب إلزامي.
          </p>
        </section>
        <section aria-labelledby="journey-steps" className="px-6 pb-[105px]">
          <div className="mx-auto max-w-[760px]">
            <h2 id="journey-steps" className="sr-only">محطات الرحلة</h2>
            <ol>
              {journeySteps.map((step, index) => {
                const isLast = index === journeySteps.length - 1
                return (
                  <li key={step.title} className="flex gap-4 md:gap-5">
                    <div className="flex flex-col items-center">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-(--color-page-button) bg-(--color-page-guide-selected) text-lg font-bold text-(color:--color-page-primary)">
                        {index + 1}
                      </span>
                      {!isLast && <span aria-hidden="true" className="w-px flex-1 bg-(--color-page-border)" />}
                    </div>
                    <article className={`flex-1 rounded-(--radius-page-card) border border-(--color-page-border) bg-(--color-page-surface) p-5 md:p-6 ${isLast ? '' : 'mb-5'}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-(--color-page-surface) drop-shadow-[0_4px_2px_rgb(0_0_0/0.25)]">
                          <img src={`/icons/guide/${step.icon}.svg`} alt="" width="18" height="18" />
                        </span>
                        <h3 className="text-[22px] leading-[1.4] font-bold">{step.title}</h3>
                        <span className="ms-auto rounded-full bg-(--color-page-bg) px-3 py-1 text-sm leading-6 text-(color:--color-page-muted)">
                          {step.duration}
                        </span>
                      </div>
                      <p className="mt-3 text-base leading-8 text-(color:--color-page-muted)">{step.description}</p>
                      <Link
                        to={step.to}
                        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-(--radius-page-button) border border-(--color-page-button) px-4 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary) transition-colors duration-200 hover:bg-(--color-page-guide-selected) motion-reduce:transition-none"
                      >
                        {step.action}
                        <img src="/icons/guide/chevron.svg" alt="" width="16" height="16" className="-scale-x-100" />
                      </Link>
                    </article>
                  </li>
                )
              })}
            </ol>
            <div role="note" className="mt-10 flex items-start gap-4 rounded-(--radius-page-card) bg-(--color-page-card) p-[22px] shadow-(--shadow-page-card)">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 17.9125 20" fill="none" stroke="currentColor" strokeWidth="1.34344" strokeLinecap="round" strokeLinejoin="round" className="mt-2 shrink-0">
                <path d="M8.95625 17.4635C8.95625 17.4635 14.9271 14.4781 14.9271 10V4.77552L8.95625 2.53646L2.98542 4.77552V10C2.98542 14.4781 8.95625 17.4635 8.95625 17.4635Z" />
                <path d="M6.71719 10L8.2099 11.4927L11.1953 8.50729" />
              </svg>
              <p className="text-lg leading-9">
                هذه الرحلة اقتراح تعليمي وليست خطة علاجية. إذا استمر الضيق أو أثّر في حياتك اليومية، فاطلب دعمًا متخصصًا، وإذا شعرت أنك غير آمن فتواصل فورًا مع خدمات الطوارئ.{' '}
                <Link to="/help" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                  متى أطلب دعمًا متخصصًا؟
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
