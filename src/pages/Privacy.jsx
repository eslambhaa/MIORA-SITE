import { Link } from 'react-router'

export default function Privacy() {
  return (
    <>
      <title>سياسة الخصوصية | ميورا</title>
      <meta name="description" content="سياسة الخصوصية في ميورا: ما البيانات التي نجمعها، ولماذا، وكيف تتحكم فيها." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">الخصوصية والبيانات</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">خصوصيتك بوضوح ومن دون وعود مبالغ فيها</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">نوضّح هنا بلغة بسيطة ما البيانات التي نجمعها، ولماذا، وكيف تتحكم فيها.</p>
        </section>
        <section className="px-6 pt-2 pb-[133px]">
          <div className="mx-auto max-w-[750px]">
            <h2 className="text-[30px] leading-[1.3] tracking-[-0.02em]">ما البيانات التي نجمعها؟</h2>
            <p className="mt-[10px] text-lg leading-9">عند إنشاء حساب نحفظ اسمك وبريدك الإلكتروني، أو بياناتك الأساسية من Google إذا سجّلت بها. ونحفظ ما تكتبه داخل المنصة: مذكراتك، ومحادثاتك مع المساعد الذكي، ونتائج التقييمات الذاتية. لا نجمع بيانات دفع أو موقعك الجغرافي.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">كيف نتعامل مع مذكراتك ومحادثاتك؟</h2>
            <p className="mt-[10px] text-lg leading-9">نعامل المذكرات والمحادثات كبيانات حساسة، لأنها تتعلق بمشاعرك وحياتك الخاصة. تُحفظ مرتبطة بحسابك حتى تصل إليها من أي جهاز، ولا يطّلع عليها أحد من الفريق إلا عند الضرورة التقنية لحل مشكلة تطلبها أنت.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">المساعد الذكي وتدريب النموذج</h2>
            <p className="mt-[10px] text-lg leading-9">يعمل المساعد الذكي على خوادمنا، ولا تُرسَل محادثاتك إلى شركات ذكاء اصطناعي خارجية. تُحفظ محادثاتك في حسابك لتعود إليها، ولا نستخدمها في تدريب النموذج إلا إذا وافقت على ذلك بنفسك من إعدادات الحساب، ويمكنك إلغاء موافقتك في أي وقت.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">لماذا نستخدم بياناتك؟</h2>
            <p className="mt-[10px] text-lg leading-9">لتشغيل حسابك، وحفظ مذكراتك ومحادثاتك ونتائج تقييماتك، وتحسين المساعد إذا وافقت على ذلك. لا نبيع بياناتك، ولا نستخدمها في الإعلانات.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">ملفات تعريف الارتباط</h2>
            <p className="mt-[10px] text-lg leading-9">نستخدم فقط الملفات الضرورية لإبقائك مسجّلًا للدخول. لا نستخدم أدوات تحليلات أو إعلانات أو تتبّع.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">مشاركة بياناتك</h2>
            <p className="mt-[10px] text-lg leading-9">لا نشارك بياناتك مع أي جهة، إلا مزوّدي الخدمات اللازمين لتشغيل المنصة، أو إذا طلب القانون ذلك.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">حقوقك</h2>
            <p className="mt-[10px] text-lg leading-9">يمكنك الاطلاع على بياناتك وتعديلها، وحذف حسابك وكل بياناته بنفسك من إعدادات الحساب. لأي استفسار عن خصوصيتك راسلنا من <Link to="/contact" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">صفحة تواصل معنا</Link>.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">العمر</h2>
            <p className="mt-[10px] text-lg leading-9">ميورا مخصّصة لمن هم في الثامنة عشرة فأكثر.</p>
            <h2 className="mt-[38px] text-[30px] leading-[1.3] tracking-[-0.02em]">التغييرات على هذه السياسة</h2>
            <p className="mt-[10px] text-lg leading-9">إذا غيّرنا شيئًا مهمًا في طريقة تعاملنا مع بياناتك، سنخبرك قبل تطبيقه.</p>
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
