import { useState } from 'react'
import { Link } from 'react-router'
import { BACKUP_TABLES, exportBackup } from '../lib/adminBackup.js'

const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const count = new Intl.NumberFormat('ar-EG')

export default function AdminBackup() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function download() {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(await exportBackup())
    } catch {
      setError('تعذّر تجهيز النسخة الآن. حاول مرة أخرى بعد قليل.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <title>النسخة الاحتياطية | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">النسخة الاحتياطية</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">نزّل محتوى الموقع في ملف JSON تحتفظ به عندك.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>

          <section aria-labelledby="in-title" className={`${card} p-6`}>
            <h2 id="in-title" className="text-2xl leading-[1.4]">ما الذي في الملف؟</h2>
            <ul className="mt-3 list-disc ps-5 text-base leading-8 marker:text-(color:--color-page-button)">
              {BACKUP_TABLES.map((table) => (
                <li key={table.key}>{table.label}</li>
              ))}
            </ul>
            <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">تشمل المسودات والمخفي، لأنها جزء من عملك.</p>
          </section>

          <aside role="note" className={`${card} p-5`}>
            <h2 className="text-lg leading-7 font-bold">وما الذي ليس فيه؟</h2>
            <p className="mt-1 text-base leading-7 text-(color:--color-page-muted)">
              لا بيانات للمستخدمين أبدًا: لا حسابات ولا مذكرات ولا محادثات ولا تقييمات ولا تسجيلات مزاج ولا رسائل تواصل ولا قائمة المشرفين. هذه النسخة لحماية <strong>ما كتبته أنت</strong> إن حدث خطأ أو توقّف المشروع. وهي لا تتضمن ملفات الصور أو الصوت لأنها ليست مخزنة هنا.
            </p>
          </aside>

          <section aria-labelledby="go-title" className={`${card} p-6`}>
            <h2 id="go-title" className="text-2xl leading-[1.4]">تنزيل النسخة</h2>
            <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">يُجهَّز الملف داخل متصفحك من محتوى الموقع ويُحفظ على جهازك، ولا يُرسل لأي جهة. احتفظ به في مكان آمن، ونزّله بعد التعديلات الكبيرة.</p>
            <button type="button" onClick={download} disabled={busy} aria-busy={busy} className="mt-4 min-h-11 cursor-pointer rounded-(--radius-page-button) bg-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-surface) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? 'جارٍ التجهيز…' : 'نزّل نسخة احتياطية (JSON)'}
            </button>
            <div aria-live="polite">
              {error && <p role="status" className="mt-3 text-base leading-7 text-(color:--color-page-error-text)">{error}</p>}
              {result && (
                <div role="status" className="mt-3 text-base leading-7">
                  <p>نُزّل الملف <bdi dir="ltr" className="font-bold">{result.fileName}</bdi>.{result.audited ? '' : ' تعذّر تسجيل العملية في سجل التعديلات.'}</p>
                  <ul className="mt-1 text-(color:--color-page-muted)">
                    {BACKUP_TABLES.map((table) => (
                      <li key={table.key}>{table.label}: {count.format(result.counts[table.key] ?? 0)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
