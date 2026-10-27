import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { breathPhase, exercises } from '../data/exercises.js'
import { supabase } from '../lib/supabase.js'

const arabicNumber = new Intl.NumberFormat('ar-EG')
const startButton =
  'inline-flex min-h-[49.6px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-[#787878] px-[22px] py-2.5 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) hover:bg-(--color-page-guide-selected) motion-reduce:transition-none'
const stopButton =
  'inline-flex min-h-[49.6px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold shadow-(--shadow-home-soft) outline-(--color-page-primary)'
const link = 'text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)'

function clock(seconds) {
  const s = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(s / 60)
  const rest = String(s % 60).padStart(2, '0')
  return `${arabicNumber.format(minutes)}:${rest.replace(/\d/g, (d) => arabicNumber.format(Number(d)))}`
}

function Running({ exercise, session, now, onStop, onNext }) {
  const stopRef = useRef(null)
  useEffect(() => stopRef.current?.focus(), [])

  const elapsed = (now - session.startedAt) / 1000
  const breath = exercise.kind === 'breath'
  const step = breath ? null : exercise.steps[session.stepIndex]
  const remaining = breath
    ? exercise.totalSeconds - elapsed
    : exercise.steps.slice(session.stepIndex).reduce((sum, s) => sum + s.seconds, 0) - (now - session.stepStartedAt) / 1000

  return (
    <div className="mt-auto pt-5">
      <button ref={stopRef} type="button" onClick={onStop} className={stopButton}>
        <img src="/icons/relaxation/pause.svg" alt="" width="18" height="18" />
        إيقاف التمرين
      </button>
      <p className="pt-[18px] text-center text-[12.8px] leading-[22.4px] text-(color:--color-page-muted)">
        {breath ? 'تنفّس بطريقتك…' : `الخطوة ${arabicNumber.format(session.stepIndex + 1)} من ${arabicNumber.format(exercise.steps.length)}`}
        <span aria-hidden="true"> · متبقٍ {clock(remaining)}</span>
      </p>
      <p aria-live="polite" className="min-h-[56px] pt-1 text-center text-base leading-7 text-(color:--color-page-primary)">
        {breath ? breathPhase(elapsed).text : step.text}
      </p>
      {breath ? (
        <div aria-hidden="true" className="grid h-[72px] place-items-center">
          <span className="block size-[58px] animate-breathe rounded-full border-2 border-(--color-page-button) bg-(--color-page-guide-selected)" />
        </div>
      ) : (
        <div className="flex justify-center pt-2">
          <button type="button" onClick={onNext} className={`cursor-pointer text-sm leading-6 ${link}`}>
            {session.stepIndex === exercise.steps.length - 1 ? 'إنهاء التمرين' : 'الخطوة التالية'}
          </button>
        </div>
      )}
    </div>
  )
}

function Done({ result, signedIn, onRestart }) {
  const headingRef = useRef(null)
  useEffect(() => headingRef.current?.focus(), [])
  return (
    <div className="mt-auto pt-5 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-(--color-page-guide-selected)">
        <img src="/icons/assessment/sparkles.svg" alt="" width="22" height="22" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="pt-3 text-base leading-7 font-bold outline-none">أحسنت، أنهيت التمرين</h3>
      <p role="status" className="pt-1 text-[12.8px] leading-[22.4px] text-(color:--color-page-muted)">
        {result.saveState === 'saving' && 'جارٍ الحفظ…'}
        {result.saveState === 'saved' && 'حُفظ في ملفك.'}
        {result.saveState === 'error' && 'تعذّر الحفظ الآن.'}
        {!signedIn && (
          <>
            <Link to="/login" className={link}>سجّل الدخول</Link> لتحفظ تمارينك.
          </>
        )}
      </p>
      <button type="button" onClick={onRestart} className={`mt-3 cursor-pointer text-sm leading-6 ${link}`}>
        أعد التمرين
      </button>
    </div>
  )
}

export default function Relaxation() {
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [done, setDone] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const finishing = useRef(false)

  useEffect(() => {
    if (!session) return undefined
    const timer = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(timer)
  }, [session])

  function start(id) {
    const t = Date.now()
    finishing.current = false
    setDone(null)
    setNow(t)
    setSession({ id, startedAt: t, stepIndex: 0, stepStartedAt: t })
  }

  async function complete(current) {
    if (finishing.current) return
    finishing.current = true
    const seconds = Math.min(1800, Math.max(1, Math.round((Date.now() - current.startedAt) / 1000)))
    const canSave = Boolean(user && supabase)
    setSession(null)
    setDone({ id: current.id, saveState: canSave ? 'saving' : 'idle' })
    if (!canSave) return
    const { error } = await supabase.from('exercise_sessions').insert({ exercise: current.id, duration_seconds: seconds })
    setDone((value) => (value?.id === current.id ? { ...value, saveState: error ? 'error' : 'saved' } : value))
  }

  function next(current) {
    const exercise = exercises.find((item) => item.id === current.id)
    if (current.stepIndex >= exercise.steps.length - 1) {
      complete(current)
      return
    }
    const t = Date.now()
    setSession({ ...current, stepIndex: current.stepIndex + 1, stepStartedAt: t })
  }

  useEffect(() => {
    if (!session) return
    const exercise = exercises.find((item) => item.id === session.id)
    if (exercise.kind === 'breath') {
      if (now - session.startedAt >= exercise.totalSeconds * 1000) complete(session)
    } else if (now - session.stepStartedAt >= exercise.steps[session.stepIndex].seconds * 1000) {
      next(session)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  return (
    <>
      <title>تمارين الاسترخاء | ميورا</title>
      <meta name="description" content="تمارين قصيرة للتنفس والتأريض واليقظة واسترخاء الجسم. يمكنك التوقف في أي لحظة." />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[90px] text-center">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">تمارين الاسترخاء</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">توقّف قليلًا، وخذ مساحة لنفسك</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">
            اختر تمرينًا قصيرًا يناسبك الآن. يمكنك التوقف في أي لحظة إذا لم تشعر بالراحة.
          </p>
        </section>
        <section className="px-6 pt-[15px] pb-[105px] lg:px-[70px]">
          <ul className="mx-auto grid max-w-[1026px] gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {exercises.map((exercise) => {
              const active = session?.id === exercise.id
              const finished = done?.id === exercise.id
              return (
                <li
                  key={exercise.id}
                  className={`flex min-h-[310px] flex-col rounded-[22px] border bg-(--color-page-surface) p-[25px] transition-colors duration-200 motion-reduce:transition-none ${active ? 'border-(--color-page-button)' : 'border-(--color-page-border)'}`}
                >
                  <span className="grid size-[55px] place-items-center rounded-[17px] bg-(--color-page-guide-selected)">
                    <img src={exercise.icon} alt="" width="28" height="28" className="size-7" />
                  </span>
                  <p className="pt-5 text-[12.8px] leading-[22.4px] text-(color:--color-page-muted)">{exercise.duration}</p>
                  <h2 className="py-[5px] text-base leading-[20.8px] tracking-[-0.02em]">
                    {exercise.title}
                    {exercise.badge && (
                      <>
                        {' '}
                        <bdi dir="ltr">{exercise.badge}</bdi>
                      </>
                    )}
                  </h2>
                  <p className="text-base leading-7 text-(color:--color-page-muted)">{exercise.description}</p>
                  {active && (
                    <Running
                      key={session.startedAt}
                      exercise={exercise}
                      session={session}
                      now={now}
                      onStop={() => setSession(null)}
                      onNext={() => next(session)}
                    />
                  )}
                  {finished && <Done result={done} signedIn={Boolean(user)} onRestart={() => start(exercise.id)} />}
                  {!active && !finished && (
                    <div className="mt-auto pt-5">
                      <button type="button" onClick={() => start(exercise.id)} className={startButton}>
                        <img src="/icons/relaxation/play.svg" alt="" width="18" height="18" className="-scale-x-100" />
                        ابدأ التمرين
                        <span className="sr-only">: {exercise.title}</span>
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <div role="note" className="mx-auto mt-10 flex max-w-[750px] items-start gap-4 rounded-(--radius-page-card) bg-(--color-page-card) p-[22px]">
            <img src="/icons/assessment/shield.svg" alt="" width="20" height="20" className="mt-1 shrink-0" />
            <p className="text-base leading-7">
              إذا شعرت بدوار أو ضيق أثناء أي تمرين، توقّف وعُد إلى تنفّسك الطبيعي. هذه التمارين أدوات تعليمية ولا تغني عن الدعم المتخصص.{' '}
              {!user && (
                <>
                  <Link to="/login" className={link}>سجّل الدخول</Link> لتُحفظ التمارين التي تكملها في ملفك.
                </>
              )}
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
