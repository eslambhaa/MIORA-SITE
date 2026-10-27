import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { moods } from '../../data/moods.js'
import SectionTitle from './SectionTitle.jsx'
import { useTodayMood } from './useTodayMood.js'

export default function MoodCheckIn() {
  const { mood, status, choose, signedIn } = useTodayMood()
  const selected = moods.find((item) => item.id === mood)
  const thanksRef = useRef(null)
  const saved = status === 'saved'

  // The choices disappear after saving, so move focus to the thank-you card.
  useEffect(() => {
    if (saved) thanksRef.current?.focus()
  }, [saved])

  // Already checked in today (or still checking): no section until tomorrow.
  if (status === 'checking' || status === 'done') return null

  return (
    <section aria-labelledby="mood-title" className="bg-(--color-page-surface) px-6 py-[105px]">
      <div className="mx-auto max-w-[1026px]">
        <SectionTitle id="mood-title" eyebrow="تسجيل شعورك" title="حاسس بإيه النهارده؟" description="اختار الأقرب لك، من غير ما تحتاج تبرّر أو تغيّر شعورك." />
        {!saved && (
        <fieldset className="mt-[42px]" disabled={status === 'saving'}>
          <legend className="sr-only">اختر شعورك الآن</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {moods.map((item) => (
              <label key={item.id} className="group relative cursor-pointer">
                <input
                  type="radio"
                  name="mood"
                  value={item.id}
                  checked={mood === item.id}
                  onChange={() => choose(item.id)}
                  className="peer sr-only"
                />
                <span className="flex min-h-[126px] flex-col items-center justify-center gap-2.5 rounded-[20px] border border-(--color-page-border) bg-(--color-page-bg) text-base leading-7 font-bold transition-[background-color,border-color,translate] duration-200 group-hover:border-(--color-page-button) peer-checked:-translate-y-0.5 peer-checked:border-(--color-page-button) peer-checked:bg-(--color-page-guide-selected) peer-checked:text-(color:--color-page-primary) peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-(--color-page-primary) motion-reduce:transition-none">
                  <span className="grid size-[46px] place-items-center rounded-full bg-(--color-page-surface)">
                    <img src={`/icons/home/${item.icon}.svg`} alt="" width="20" height="20" />
                  </span>
                  {item.label}
                </span>
                <span aria-hidden="true" className="absolute top-[9px] left-[9px] hidden size-[22px] place-items-center rounded-full bg-(--color-page-button) peer-checked:grid">
                  <img src="/icons/home/check.svg" alt="" width="14" height="14" />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        )}
        <div aria-live="polite" className={saved ? 'mt-[42px]' : 'mt-[41px]'}>
          {status === 'saving' && <p className="text-base leading-7 text-(color:--color-page-muted)">جارٍ الحفظ…</p>}
          {status === 'error' && (
            <p role="alert" className="rounded-(--radius-page-input) bg-(--color-page-error-bg) px-4 py-3 text-base leading-7 text-(color:--color-page-error-text)">
              تعذّر حفظ شعورك الآن. تحقق من الاتصال ثم اختر مرة أخرى.
            </p>
          )}
          {saved && selected && (
            <div className="flex flex-col gap-4 rounded-[18px] bg-(--color-home-status) px-6 py-[22px] text-white md:flex-row md:items-center">
              <img src="/icons/home/status.svg" alt="" width="20" height="20" className="hidden shrink-0 md:block" />
              <div className="flex-1">
                <p ref={thanksRef} tabIndex={-1} className="text-base leading-7 font-bold outline-none">
                  شكرًا لأنك لاحظت شعورك.
                </p>
                <p className="pt-0.5 text-base leading-7">
                  كونك <strong>{selected.label}</strong> الآن هو جزء من يومك، وليس تعريفًا لك. يمكنك كتابة ما يدور بداخلك أو تجربة تمرين قصير.
                </p>
                <p className="pt-1 text-sm leading-6 text-white/90">
                  {signedIn ? (
                    'حُفظ شعورك لليوم في حسابك. سنسألك مرة أخرى غدًا.'
                  ) : (
                    <>
                      لن يُحفظ اختيارك، وسنسألك مرة أخرى غدًا.{' '}
                      <Link to="/login" className="font-bold underline underline-offset-4 outline-white">
                        سجّل الدخول
                      </Link>{' '}
                      لتحفظ شعورك وتتابعه في ملفك.
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/journal?new=1"
                  className="inline-flex min-h-12 items-center justify-center rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-heading) shadow-(--shadow-home-soft) outline-white"
                >
                  اكتب في مذكراتك
                </Link>
                <Link
                  to="/relaxation"
                  className="inline-flex min-h-12 items-center justify-center rounded-(--radius-page-button) border border-white/60 px-[22px] py-2.5 text-base leading-7 font-bold text-white outline-white transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none"
                >
                  جرّب تمرينًا قصيرًا
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
