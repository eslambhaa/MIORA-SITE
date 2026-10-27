export default function About() {
  return (
    <>
      <title>عن المنصة | ميورا</title>
      <meta name="description" content="ميورا مشروع تعليمي للعافية النفسية، يقدّم معرفة مبسّطة وأدوات للتأمل وبناء عادات واقعية، بلغة محترمة وغير وصمية." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">عن ميورا</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">لأن فهم نفسك يستحق مساحة آمنة</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">ميورا مشروع تعليمي للعافية النفسية، يقدّم معرفة مبسّطة وأدوات للتأمل وبناء عادات واقعية، بلغة محترمة وغير وصمية.</p>
        </section>
        <section className="px-6 pt-2 pb-[133px]">
          <div className="mx-auto max-w-[750px]">
            <h2 className="text-[30px] leading-[1.3] tracking-[-0.02em]">ما الذي نقدّمه؟</h2>
            <p className="mt-[10px] text-lg leading-9">ميورا مشروع تعليمي للعافية النفسية، يقدّم معرفة مبسّطة وأدوات للتأمل وبناء عادات واقعية، بلغة محترمة وغير وصمية.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">التزامنا</h2>
            <p className="mt-[10px] text-lg leading-9">نستخدم لغة داعمة ونبتعد عن الوصم والادعاءات الطبية غير الموثقة. نوضح دائمًا حدود النموذج والميزات التي تحتاج إلى خدمة خلفية قبل الإطلاق.</p>
            <div role="note" className="mx-auto mt-7 flex w-fit items-start gap-4 rounded-(--radius-page-card) bg-(--color-page-card) p-[22px] shadow-(--shadow-page-card)">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 17.9125 20" fill="none" stroke="currentColor" strokeWidth="1.34344" strokeLinecap="round" strokeLinejoin="round" className="mt-2 shrink-0"><path d="M8.95625 17.4635C8.95625 17.4635 14.9271 14.4781 14.9271 10V4.77552L8.95625 2.53646L2.98542 4.77552V10C2.98542 14.4781 8.95625 17.4635 8.95625 17.4635Z" /><path d="M6.71719 10L8.2099 11.4927L11.1953 8.50729" /></svg>
              <p className="max-w-[631px] text-lg leading-9">هذا المحتوى مؤقت ومخصّص للنموذج الأولي، ويحتاج إلى مراجعة متخصصة وقانونية قبل الاستخدام العام.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
