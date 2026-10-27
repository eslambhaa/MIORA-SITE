import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../auth/AuthProvider.jsx'
import { assessments, options, summary, topicIds } from '../data/assessments.js'
import { supabase } from '../lib/supabase.js'

const primaryButton =
  'inline-flex min-h-[49.6px] cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-page-button) border border-transparent bg-(--color-page-button) px-[22px] py-2.5 text-base leading-7 font-bold text-white shadow-(--shadow-page-button) outline-(--color-page-primary) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none'
const secondaryButton =
  'inline-flex min-h-[49.6px] items-center justify-center rounded-(--radius-page-button) border border-(--color-page-border) bg-(--color-page-surface) px-[22px] py-2.5 text-base leading-7 font-bold shadow-(--shadow-home-soft) outline-(--color-page-primary)'
const progressWidth = ['w-1/3', 'w-2/3', 'w-full']
const eyebrow = 'pb-4 text-center text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)'
const heading = 'text-center text-[32px] leading-[1.3] tracking-[-0.02em] outline-none md:text-[42px]'

function TopicIndex() {
  return (
    <>
      <title>التقييمات الذاتية | ميورا</title>
      <section className="mx-auto max-w-[1026px]">
        <p className={eyebrow}>أدوات تعليمية للتأمل</p>
        <h1 className={heading}>التقييمات الذاتية</h1>
        <p className="mx-auto max-w-[640px] pt-2 text-center text-lg leading-[31.5px] text-(color:--color-page-muted)">
          أسئلة قصيرة تساعدك على ملاحظة حالتك وعاداتك. ليست اختبارات تشخيصية، ولا توجد فيها إجابات صحيحة أو خاطئة.
        </p>
        <ul className="mt-10 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {topicIds.map((id) => {
            const item = assessments[id]
            return (
              <li key={id}>
                <Link
                  to={`/assessment?topic=${id}`}
                  className="flex h-full flex-col items-start gap-3 rounded-[22px] border border-(--color-page-border) bg-(--color-page-surface) p-[26px] outline-(--color-page-primary) transition-colors duration-200 hover:border-(--color-page-button) motion-reduce:transition-none"
                >
                  <span className={`grid size-[58px] place-items-center rounded-[17px] ${item.tint}`}>
                    <img src={item.icon} alt="" width="28" height="28" className="size-7" />
                  </span>
                  <span className="text-[21px] leading-[27.3px]">{item.title}</span>
                  <span className="text-base leading-7 text-(color:--color-page-muted)">{item.description}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

function Intro({ topic, onStart }) {
  return (
    <>
      <div className="flex justify-center pb-5">
        <span className={`grid size-[58px] place-items-center rounded-[17px] ${topic.tint}`}>
          <img src={topic.icon} alt="" width="30" height="30" className="size-[30px]" />
        </span>
      </div>
      <p className={eyebrow}>أداة تعليمية للتأمل</p>
      <h1 tabIndex={-1} className={heading}>{topic.title}</h1>
      <p className="pt-1 text-center text-lg leading-[31.5px] text-(color:--color-page-muted)">{topic.description}</p>
      <ul className="flex flex-wrap items-center justify-center gap-x-[25px] gap-y-2 pt-6 text-base leading-7">
        <li className="flex items-center gap-[7px]">
          <img src="/icons/assessment/clock.svg" alt="" width="20" height="20" />
          من ٣ إلى ٥ دقائق
        </li>
        <li className="flex items-center gap-[7px]">
          <img src="/icons/assessment/questions.svg" alt="" width="20" height="20" />
          ٣ أسئلة قصيرة
        </li>
      </ul>
      <div role="note" className="my-7 flex items-start gap-4 rounded-[18px] bg-(--color-page-card) p-[22px]">
        <img src="/icons/assessment/shield.svg" alt="" width="20" height="20" className="mt-1 shrink-0" />
        <p className="text-base leading-7">
          <strong className="block">قبل أن تبدأ</strong>
          لا توجد إجابات صحيحة أو خاطئة. هذه الأداة ليست تقييمًا سريريًا ولا تقدّم تشخيصًا.
        </p>
      </div>
      <div className="flex justify-center">
        <button type="button" onClick={onStart} className={primaryButton}>
          ابدأ الآن
          <img src="/icons/home/arrow.svg" alt="" width="18" height="18" className="-scale-x-100" />
        </button>
      </div>
    </>
  )
}

function Question({ topic, index, value, onAnswer, onBack, onNext }) {
  const total = topic.questions.length
  const last = index === total - 1
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (value !== undefined) onNext()
      }}
    >
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex cursor-pointer items-center gap-2 text-base leading-7 text-(color:--color-page-muted) outline-(--color-page-primary) hover:text-(color:--color-page-primary)">
          <img src="/icons/assessment/prev.svg" alt="" width="18" height="18" />
          السابق
        </button>
        <p className="text-base leading-7 text-(color:--color-page-muted)">
          {index + 1} من {total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="التقدم في الأسئلة"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        className="mt-5 mb-[55px] h-[7px] overflow-hidden rounded-[10px] bg-(--color-page-border)"
      >
        <div className={`h-full rounded-[10px] bg-(--color-page-button) transition-[width] duration-300 motion-reduce:transition-none ${progressWidth[index]}`} />
      </div>
      <fieldset>
        <legend className="w-full">
          <span className={`block ${eyebrow}`}>{topic.title}</span>
          <h1 tabIndex={-1} className={heading}>{topic.questions[index]}</h1>
        </legend>
        <div className="grid gap-2.5 py-[30px]">
          {options.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name={`q${index}`}
                value={option.value}
                checked={value === option.value}
                onChange={() => onAnswer(option.value)}
                className="peer sr-only"
              />
              <span className="flex min-h-[58px] items-center rounded-[14px] border border-(--color-page-border) bg-(--color-page-surface) px-[18px] text-base leading-7 transition-colors duration-200 peer-checked:border-(--color-page-button) peer-checked:bg-(--color-page-guide-selected) peer-checked:font-bold peer-checked:text-(color:--color-page-primary) peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-(--color-page-primary) hover:border-(--color-page-button) motion-reduce:transition-none">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-center">
        <button type="submit" disabled={value === undefined} className={primaryButton}>
          {last ? 'شاهد الخلاصة' : 'السؤال التالي'}
        </button>
      </div>
    </form>
  )
}

function Result({ topic, answers, saveState, signedIn, onRestart }) {
  const score = answers.reduce((sum, value) => sum + value, 0)
  const result = summary(score)
  return (
    <>
      <div className="flex justify-center pb-5">
        <span className="grid size-[72px] place-items-center rounded-full bg-(--color-page-guide-selected)">
          <img src="/icons/assessment/sparkles.svg" alt="" width="34" height="34" />
        </span>
      </div>
      <p className={eyebrow}>انتهيت — شكرًا لصدقك</p>
      <h1 tabIndex={-1} className={heading}>ملاحظتك لنفسك خطوة مهمة</h1>
      <p className="pt-1 text-center text-lg leading-[31.5px] text-(color:--color-page-muted)">{result.text}</p>
      <div className="mt-7 flex items-start gap-3.5 rounded-[18px] border border-(--color-page-border) bg-(--color-page-surface) p-[22px]">
        <img src="/icons/assessment/leaf.svg" alt="" width="20" height="20" className="mt-1 shrink-0" />
        <div>
          <h2 className="text-base leading-7 font-bold">خطوتك المقترحة</h2>
          <p className="pt-0.5 text-base leading-7 text-(color:--color-page-muted)">{topic.step}</p>
        </div>
      </div>
      {result.band === 'low' && (
        <p role="note" className="mt-4 rounded-[14px] bg-(--color-page-card) px-[22px] py-4 text-base leading-7">
          إذا استمر الضيق أو أثّر في يومك، فالحديث مع مختص خطوة مهمة. وإذا شعرت أنك غير آمن الآن، تواصل فورًا مع خدمات الطوارئ.{' '}
          <Link to="/help" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
            متى أطلب دعمًا متخصصًا؟
          </Link>
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3 pt-7">
        <Link to="/journal" className={`${primaryButton} shadow-(--shadow-page-button)`}>
          اكتب ملاحظة
        </Link>
        <Link to="/relaxation" className={secondaryButton}>
          تمرين قصير
        </Link>
      </div>
      <p role="status" className="pt-6 text-center text-sm leading-6 text-(color:--color-page-muted)">
        {saveState === 'saving' && 'جارٍ حفظ النتيجة…'}
        {saveState === 'saved' && 'حُفظت هذه الخلاصة في حسابك.'}
        {saveState === 'error' && 'تعذّر حفظ الخلاصة الآن.'}
        {!signedIn && (
          <>
            لم تُحفظ الخلاصة.{' '}
            <Link to="/login" className="text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
              سجّل الدخول
            </Link>{' '}
            لتحفظ خلاصاتك وتتابعها في ملفك.
          </>
        )}
      </p>
      <p className="pt-[25px] text-center text-[12.8px] leading-[22.4px] text-(color:--color-page-muted)">هذه خلاصة تعليمية مبنية على إجاباتك في هذه الجلسة، وليست نتيجة طبية.</p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-base">
        <button type="button" onClick={onRestart} className="cursor-pointer text-(color:--color-page-primary) underline-offset-4 outline-(--color-page-primary) hover:underline">
          أعد التقييم
        </button>
        <Link to="/assessment" className="text-(color:--color-page-primary) underline-offset-4 outline-(--color-page-primary) hover:underline">
          تقييمات أخرى
        </Link>
      </div>
    </>
  )
}

function Flow({ topicId }) {
  const topic = assessments[topicId]
  const { user } = useAuth()
  const [step, setStep] = useState('intro')
  const [answers, setAnswers] = useState([])
  const [saveState, setSaveState] = useState('idle')
  const containerRef = useRef(null)

  useEffect(() => {
    containerRef.current?.querySelector('h1')?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [step])

  async function finish() {
    setStep('result')
    if (!user || !supabase) return
    setSaveState('saving')
    const { error } = await supabase.from('assessment_results').insert({ topic: topicId, answers })
    setSaveState(error ? 'error' : 'saved')
  }

  function restart() {
    setAnswers([])
    setSaveState('idle')
    setStep('intro')
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-[632px]">
      <title>{`${topic.title} | ميورا`}</title>
      {step === 'intro' && <Intro topic={topic} onStart={() => setStep(0)} />}
      {typeof step === 'number' && (
        <Question
          topic={topic}
          index={step}
          value={answers[step]}
          onAnswer={(value) => setAnswers((current) => Object.assign([...current], { [step]: value }))}
          onBack={() => setStep(step === 0 ? 'intro' : step - 1)}
          onNext={() => (step === topic.questions.length - 1 ? finish() : setStep(step + 1))}
        />
      )}
      {step === 'result' && <Result topic={topic} answers={answers} saveState={saveState} signedIn={Boolean(user)} onRestart={restart} />}
    </div>
  )
}

export default function Assessment() {
  const [params] = useSearchParams()
  const topicId = params.get('topic')
  const valid = topicIds.includes(topicId)

  return (
    <>
      <meta name="description" content="أدوات تأملية قصيرة لفهم المزاج والتوتر والنوم والعادات. ليست اختبارات تشخيصية." />
      <main className="-mt-[112px] flex-1 px-6 pt-[180px] pb-[100px]">{valid ? <Flow key={topicId} topicId={topicId} /> : <TopicIndex />}</main>
    </>
  )
}
