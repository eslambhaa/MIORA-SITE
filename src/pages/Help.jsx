import { useEffect } from 'react'
import { useLocation } from 'react-router'

const hotlines = [
  { number: '123', title: 'الإسعاف', text: 'إذا كنت أنت أو غيرك في خطر الآن.' },
  { number: '16328', title: 'الخط الساخن للدعم النفسي', text: 'من وزارة الصحة، على مدار الساعة.' },
  { number: '105', title: 'الخط الساخن الموحد لوزارة الصحة', text: 'استفسارات صحية وتوجيه للخدمات.' },
]

export default function Help() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash !== '#emergency') return
    document.getElementById('emergency')?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <>
      <title>المساعدة والأسئلة | ميورا</title>
      <meta name="description" content="إجابات واضحة حول استخدام منصة ميورا، وحدود أدواتها، ومتى تطلب دعمًا متخصصًا." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">المساعدة والدعم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">كيف نقدر نساعدك؟</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">إجابات واضحة حول استخدام المنصة، وحدود أدواتها، ومتى يكون التواصل مع متخصص خطوة مناسبة.</p>
        </section>
        <section id="emergency" aria-labelledby="emergency-title" className="scroll-mt-28 px-6 pb-12">
          <div className="mx-auto max-w-[760px] rounded-(--radius-page-card) border border-(--color-page-error-text)/25 bg-(--color-page-error-bg) p-6 md:p-8">
            <h2 id="emergency-title" className="text-2xl leading-[1.4] tracking-[-0.02em] md:text-[28px]">إذا كنت في خطر الآن</h2>
            <p className="pt-2 text-base leading-7">
              ميورا لا تقدّم خدمة طوارئ. إذا فكرت في إيذاء نفسك أو شعرت أنك غير آمن، اتصل فورًا بأحد هذه الأرقام، أو اذهب لأقرب قسم طوارئ، أو ابقَ مع شخص تثق به.
            </p>
            <ul className="grid gap-3 pt-5 sm:grid-cols-3">
              {hotlines.map((line) => (
                <li key={line.number}>
                  <a
                    href={`tel:${line.number}`}
                    className="flex h-full flex-col rounded-[16px] bg-(--color-page-surface) p-4 outline-(--color-page-primary) transition-shadow duration-200 hover:shadow-(--shadow-page-card) motion-reduce:transition-none"
                  >
                    <span dir="ltr" className="self-start text-[28px] leading-[1.3] font-extrabold text-(color:--color-page-primary)">
                      {line.number}
                    </span>
                    <span className="pt-1 text-base leading-7 font-bold">{line.title}</span>
                    <span className="text-sm leading-6 text-(color:--color-page-muted)">{line.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="px-6 pb-[46px]">
          <div className="mx-auto max-w-[760px]">
            <details open className="group border-b border-(--color-page-border) py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg leading-[31.5px] font-bold outline-(--color-page-primary) [&::-webkit-details-marker]:hidden">
                <span>هل تقدّم ميورا تشخيصًا؟</span>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 rotate-180 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"><path d="M7.5 15L12.5 10L7.5 5" /></svg>
              </summary>
              <p className="max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">لا، ميورا منصة تعليمية داعمة، ولا تحلّ محلّ المتخصصين.</p>
            </details>
            <details open className="group border-b border-(--color-page-border) py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg leading-[31.5px] font-bold outline-(--color-page-primary) [&::-webkit-details-marker]:hidden">
                <span>أين تُحفظ مذكراتي؟</span>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 rotate-180 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"><path d="M7.5 15L12.5 10L7.5 5" /></svg>
              </summary>
              <p className="max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">في حسابك على خوادم Supabase في الاتحاد الأوروبي (ألمانيا)، لتصل إليها من أي جهاز. لا يقرأها غيرك من خلال الموقع، ويمكنك حذفها أو تنزيل نسخة منها من ملفك الشخصي.</p>
            </details>
            <details open className="group border-b border-(--color-page-border) py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg leading-[31.5px] font-bold outline-(--color-page-primary) [&::-webkit-details-marker]:hidden">
                <span>هل التقييمات الذاتية اختبارات طبية؟</span>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 rotate-180 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"><path d="M7.5 15L12.5 10L7.5 5" /></svg>
              </summary>
              <p className="max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">لا، هي أسئلة انعكاسية تعليمية فقط.</p>
            </details>
            <details open className="group border-b border-(--color-page-border) py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg leading-[31.5px] font-bold outline-(--color-page-primary) [&::-webkit-details-marker]:hidden">
                <span>متى أطلب دعمًا متخصصًا؟</span>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 rotate-180 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"><path d="M7.5 15L12.5 10L7.5 5" /></svg>
              </summary>
              <p className="max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">حين يستمر الضيق، أو يؤثر في حياتك اليومية، أو تشعر أنك غير آمن. في الحالات العاجلة اتصل فورًا بالأرقام الموجودة أعلى هذه الصفحة أو بشخص تثق به.</p>
            </details>
          </div>
        </section>
      </main>
    </>
  )
}
