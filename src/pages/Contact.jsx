import { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setStatus('النموذج مكتمل. إرسال الرسائل سيُفعَّل لاحقًا.')
  }

  return (
    <>
      <title>تواصل معنا | ميورا</title>
      <meta name="description" content="شاركنا رأيك في ميورا لنحسّن المنصة." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">تواصل معنا</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">رأيك يساعدنا على التحسّن</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">نموذج التواصل الحالي واجهة تجريبية ولا يرسل رسائل إلى بريد أو نظام خارجي.</p>
        </section>
        <section className="px-6 pt-[14px] pb-[105px]">
          <form id="contact-form" onSubmit={handleSubmit} className="mx-auto flex max-w-[600px] flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-name" className="text-base leading-7 font-bold">الاسم</label>
              <input id="contact-name" type="text" autoComplete="name" required className="h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 text-base outline-(--color-page-primary)" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-email" className="text-base leading-7 font-bold">البريد الإلكتروني</label>
              <input id="contact-email" type="email" dir="ltr" autoComplete="email" required className="h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 text-base outline-(--color-page-primary) text-right" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-subject" className="text-base leading-7 font-bold">الموضوع</label>
              <input id="contact-subject" type="text" required className="h-[53.6px] w-full rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 text-base outline-(--color-page-primary)" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="contact-message" className="text-base leading-7 font-bold">الرسالة</label>
              <textarea id="contact-message" required className="h-[193.6px] w-full resize-y rounded-(--radius-page-input) border border-(--color-page-input-border) bg-(--color-page-bg) px-4 py-3 text-base outline-(--color-page-primary)"></textarea>
            </div>
            <button type="submit" className="min-h-12 cursor-pointer self-start rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-[10px] text-base leading-7 font-bold text-(color:--color-page-surface) shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none">تحقق من النموذج</button>
            <p role="status" className="min-h-7 text-base leading-7 text-(color:--color-page-muted)">{status}</p>
          </form>
        </section>
      </main>
    </>
  )
}
