import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const CACHE_KEY = 'miora-resources-v1'
const CACHE_MS = 60 * 60 * 1000

// One small read per hour per browser tab session, so the free Supabase plan stays untouched.
function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (cached && Date.now() - cached.at < CACHE_MS && Array.isArray(cached.rows)) return cached.rows
  } catch {
    // storage blocked or corrupt: fetch instead
  }
  return null
}

function writeCache(rows) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows }))
  } catch {
    // storage blocked: skip caching
  }
}

const groups = [
  { kind: 'guide', heading: 'مصادر رسمية', hint: 'مواد من جهات صحية، اقرأها وجرّب التمارين.', action: 'افتح المصدر' },
  { kind: 'podcast', heading: 'بودكاست عربي', hint: 'للاستماع في وقتك. تفتح الحلقة في تطبيق خارجي.', action: 'استمع' },
]

function KindIcon({ kind }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'podcast' ? (
        <>
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          <rect x="3" y="14" width="4" height="6" rx="1.5" />
          <rect x="17" y="14" width="4" height="6" rx="1.5" />
        </>
      ) : (
        <>
          <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v16H6.5A1.5 1.5 0 0 0 5 20.5z" />
          <path d="M5 20.5A1.5 1.5 0 0 0 6.5 22H19" />
        </>
      )}
    </svg>
  )
}

export default function ResourceSection() {
  const [rows, setRows] = useState(() => readCache())
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (rows || !supabase) {
      if (!supabase) setFailed(true)
      return undefined
    }
    let ignore = false
    supabase
      .from('resources')
      .select('id, kind, title, source, description, url, topic')
      .order('sort_order')
      .then(({ data, error }) => {
        if (ignore) return
        if (error) return setFailed(true)
        writeCache(data)
        setRows(data)
      })
    return () => {
      ignore = true
    }
  }, [rows])

  if (failed && !rows) {
    return (
      <section aria-labelledby="resources-heading" className="px-6 pb-[105px]">
        <div className="mx-auto max-w-[1026px] rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) p-6 text-center">
          <h2 id="resources-heading" className="text-2xl leading-9">مصادر وبودكاست موثوقة</h2>
          <p role="status" className="pt-2 text-base leading-7 text-(color:--color-page-muted)">تعذّر تحميل المصادر الآن. حاول مرة أخرى بعد قليل.</p>
        </div>
      </section>
    )
  }
  if (!rows || rows.length === 0) return null

  return (
    <section aria-labelledby="resources-heading" className="px-6 pb-[105px]">
      <div className="mx-auto max-w-[1026px]">
        <h2 id="resources-heading" className="text-3xl leading-[1.3] tracking-[-0.02em] md:text-[40px]">مصادر وبودكاست موثوقة</h2>
        <p className="max-w-[700px] pt-3 text-lg leading-8 text-(color:--color-page-muted)">
          نختار لك مصادر عربية. محتوى كل مصدر يعبّر عن أصحابه، ولا يغني عن استشارة متخصص.
        </p>
        {groups.map(({ kind, heading, hint, action }) => {
          const items = rows.filter((row) => row.kind === kind)
          if (items.length === 0) return null
          return (
            <div key={kind} className="pt-10">
              <h3 className="text-[22px] leading-8">{heading}</h3>
              <p className="pt-1 pb-5 text-base leading-7 text-(color:--color-page-muted)">{hint}</p>
              <ul className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface) p-[22px]">
                    <span className="flex size-11 items-center justify-center rounded-full bg-(--color-page-guide-selected) text-(color:--color-page-primary)">
                      <KindIcon kind={item.kind} />
                    </span>
                    <h4 className="pt-4 text-[19px] leading-[1.5]">{item.title}</h4>
                    <p className="pt-1 text-[13px] leading-[22.75px] text-(color:--color-page-muted)">{item.source}</p>
                    <p className="min-h-[56px] pt-2.5 text-base leading-7 text-(color:--color-page-muted)">{item.description}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-[7px] pt-3 text-base leading-7 font-bold text-(color:--color-page-primary) outline-(--color-page-primary) hover:underline"
                    >
                      {action}
                      <span className="sr-only">: {item.title} (يفتح في نافذة جديدة)</span>
                      <img src="/icons/home/read-arrow.svg" alt="" width="17" height="17" className="-scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
