export default function Help() {
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
              <p className="max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">في حسابك على خوادمنا، لتصل إليها من أي جهاز.</p>
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
              <p className="max-w-[700px] text-base leading-7 text-(color:--color-page-muted)">حين يستمر الضيق، أو يؤثر في حياتك اليومية، أو تشعر أنك غير آمن. في الحالات العاجلة تواصل فورًا مع خدمات الطوارئ المحلية أو شخص موثوق.</p>
            </details>
          </div>
        </section>
      </main>
    </>
  )
}
