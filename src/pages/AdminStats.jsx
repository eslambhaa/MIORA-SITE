import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { LIMITS, daysSince, formatBytes, loadStats, metricLabels, percent, statsErrorMessage, usageLevel, weeklyTable } from '../lib/adminStats.js'

const count = new Intl.NumberFormat('ar-EG')
const day = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const dateTime = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' })
const card = 'rounded-[20px] border border-(--color-page-border) bg-(--color-page-surface)'
const outlineButton =
  'inline-flex min-h-11 cursor-pointer items-center rounded-(--radius-page-button) border border-(--color-page-button) px-5 text-base font-bold text-(color:--color-page-primary) outline-(--color-page-primary) disabled:cursor-not-allowed disabled:opacity-60'

const levelText = { ok: 'جيد', warn: 'اقترب من الحد', danger: 'قرب الحد، تصرّف الآن' }
const levelBar = { ok: 'bg-(--color-page-button)', warn: 'bg-(--color-page-error-text)/60', danger: 'bg-(--color-page-error-text)' }

function Meter({ label, used, limit, usedText, limitText, note }) {
  const level = usageLevel(used, limit)
  const share = percent(used, limit)
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-base leading-7 font-bold">{label}</p>
        <p className="text-sm leading-6 text-(color:--color-page-muted)">
          {usedText} من {limitText} · <span className={level === 'ok' ? '' : 'font-bold text-(color:--color-page-error-text)'}>{levelText[level]}</span>
        </p>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share)} aria-valuetext={`${usedText} من ${limitText}`} className="mt-2 h-3 overflow-hidden rounded-full bg-(--color-page-card)">
        <div className={`h-full rounded-full ${levelBar[level]}`} style={{ width: `${Math.max(share, used > 0 ? 1 : 0)}%` }} />
      </div>
      {note && <p className="mt-1 text-sm leading-6 text-(color:--color-page-muted)">{note}</p>}
    </li>
  )
}

export default function AdminStats() {
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setStats(await loadStats())
      setStatus('ready')
    } catch (error) {
      setMessage(statsErrorMessage(error))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const table = stats ? weeklyTable(stats.weekly ?? []) : null
  const idle = stats ? daysSince(stats.plan?.last_activity) : null
  const ref = (() => {
    try {
      return new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]
    } catch {
      return null
    }
  })()

  return (
    <>
      <title>الإحصاءات | لوحة التحكم | ميورا</title>
      <meta name="robots" content="noindex" />
      <main className="flex-1">
        <section className="-mt-[112px] bg-(image:--gradient-page-glow) bg-no-repeat px-6 pt-[190px] pb-[40px] text-center md:pb-[60px]">
          <p className="pt-[3px] pb-4 text-sm leading-[24.5px] font-bold text-(color:--color-page-primary)">لوحة التحكم</p>
          <h1 className="mx-auto max-w-[900px] text-4xl leading-[1.3] tracking-[-0.02em] md:text-[58.32px]">الإحصاءات</h1>
          <p className="mx-auto mt-4 max-w-[700px] text-[19px] leading-[1.75] text-(color:--color-page-muted)">أعداد مجمّعة فقط، ومتابعة الخطة المجانية.</p>
        </section>
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 pb-[105px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/admin" className="text-base font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">العودة إلى لوحة التحكم</Link>
            <button type="button" onClick={load} disabled={status === 'loading'} className={outlineButton}>تحديث الأرقام</button>
          </div>

          <aside role="note" className={`${card} p-5`}>
            <p className="text-base leading-7 text-(color:--color-page-muted)">
              هذه الصفحة تعرض <strong>أعدادًا فقط</strong>. لا تقرأ نص المذكرات ولا المحادثات ولا إجابات التقييمات ولا مزاج أي شخص بعينه. وأي رقم صادر عن أقل من {count.format(stats?.k ?? 3)} أشخاص يُخفى (يظهر «—»)، حتى لا يكشف أسبوع قليل النشاط ما فعله شخص واحد.
            </p>
          </aside>

          {status === 'loading' && <p role="status" className="text-base text-(color:--color-page-muted)">جارٍ التحميل…</p>}
          {status === 'error' && (
            <p role="status" className="text-base text-(color:--color-page-error-text)">
              {message}{' '}
              <button type="button" onClick={load} className="cursor-pointer font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">أعد المحاولة</button>
            </p>
          )}

          {status === 'ready' && stats && (
            <>
              <section aria-labelledby="usage-title" className={`${card} min-w-0 p-6`}>
                <h2 id="usage-title" className="text-2xl leading-[1.4]">النشاط على المنصة</h2>
                <p className="mt-2 text-base leading-7">عدد الحسابات الآن: <strong>{count.format(stats.users_total)}</strong></p>
                <div className="mt-4 overflow-x-auto" role="region" aria-label="الأعداد الأسبوعية" tabIndex={0}>
                  <table className="w-full min-w-[640px] border-collapse text-start text-base">
                    <caption className="pb-2 text-start text-sm leading-6 text-(color:--color-page-muted)">آخر 8 أسابيع، كل أسبوع يبدأ يوم الاثنين بتوقيت القاهرة. «—» تعني أن العدد أقل من {count.format(stats.k)} أشخاص فأُخفي.</caption>
                    <thead>
                      <tr className="border-b border-(--color-page-border)">
                        <th scope="col" className="py-2 pe-3 text-start font-bold">المؤشر</th>
                        {table.weeks.map((week) => (
                          <th key={week} scope="col" className="px-2 py-2 text-start text-sm font-bold whitespace-nowrap">
                            <time dateTime={week}>{day.format(new Date(`${week}T00:00:00Z`))}</time>
                          </th>
                        ))}
                        <th scope="col" className="ps-3 py-2 text-start text-sm font-bold">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row) => {
                        const total = stats.totals?.find((item) => item.metric === row.metric)?.events
                        const max = Math.max(1, ...row.cells.filter((cell) => cell != null))
                        return (
                          <tr key={row.metric} className="border-b border-(--color-page-border) last:border-b-0">
                            <th scope="row" className="py-3 pe-3 text-start font-normal">{row.label}</th>
                            {row.cells.map((cell, index) => (
                              <td key={table.weeks[index]} className="px-2 py-3 tabular-nums">
                                {cell == null ? (
                                  <span aria-label="مخفي لأن العدد أقل من الحد" className="text-(color:--color-page-muted)">—</span>
                                ) : (
                                  <span className="flex flex-col gap-1">
                                    {count.format(cell)}
                                    <span aria-hidden="true" className="block h-1.5 rounded-full bg-(--color-page-button)" style={{ width: `${(cell / max) * 100}%`, minWidth: cell > 0 ? 4 : 0 }} />
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="ps-3 py-3 font-bold tabular-nums">{total == null ? <span aria-label="مخفي لأن العدد أقل من الحد" className="font-normal text-(color:--color-page-muted)">—</span> : count.format(total)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-sm leading-6 text-(color:--color-page-muted)">
                  المؤشرات: {Object.values(metricLabels).join('، ')}. الأعداد أحداث (مرات)، لا أشخاص.
                </p>
              </section>

              <section aria-labelledby="plan-title" className={`${card} min-w-0 p-6`}>
                <h2 id="plan-title" className="text-2xl leading-[1.4]">الخطة المجانية</h2>
                <p className="mt-2 text-base leading-7 text-(color:--color-page-muted)">الحدود من توثيق Supabase للخطة المجانية.</p>
                <ul className="mt-2 divide-y divide-(--color-page-border)">
                  <Meter label={LIMITS.db.label} used={stats.plan.db_bytes} limit={LIMITS.db.bytes} usedText={formatBytes(stats.plan.db_bytes)} limitText={formatBytes(LIMITS.db.bytes)} note={LIMITS.db.note} />
                  <Meter label={LIMITS.storage.label} used={stats.plan.storage_bytes} limit={LIMITS.storage.bytes} usedText={formatBytes(stats.plan.storage_bytes)} limitText={formatBytes(LIMITS.storage.bytes)} />
                  <Meter label={LIMITS.users.label} used={stats.users_total} limit={LIMITS.users.count} usedText={count.format(stats.users_total)} limitText={count.format(LIMITS.users.count)} />
                </ul>

                <div className="mt-4 rounded-[14px] bg-(--color-page-card) p-4">
                  <p className="text-base leading-7 font-bold">التوقف لقلة النشاط</p>
                  <p className="mt-1 text-base leading-7">
                    {idle == null
                      ? 'لا يوجد نشاط مسجّل بعد.'
                      : idle === 0
                        ? `آخر نشاط على المنصة اليوم (${dateTime.format(new Date(stats.plan.last_activity))}).`
                        : `آخر نشاط على المنصة قبل ${count.format(idle)} ${idle <= 10 ? 'أيام' : 'يومًا'} (${dateTime.format(new Date(stats.plan.last_activity))}).`}
                  </p>
                  {idle != null && idle >= 5 && (
                    <p role="alert" className="mt-2 text-base leading-7 font-bold text-(color:--color-page-error-text)">
                      المشاريع المجانية تُوقَف تلقائيًا عند قلة النشاط خلال 7 أيام. افتح الموقع وتصفّحه اليوم، أو انتقل لخطة مدفوعة إن لم تُرد هذا القلق.
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-6 text-(color:--color-page-muted)">بحسب توثيق Supabase، يكفي عادةً بضعة طلبات للقاعدة كل يوم لتجنّب التوقف.</p>
                </div>

                <h3 className="mt-6 text-lg leading-7 font-bold">أكبر الجداول حجمًا</h3>
                <ul className="mt-2 divide-y divide-(--color-page-border)">
                  {stats.plan.tables.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-3 py-2 text-base leading-7">
                      <bdi dir="ltr">{item.name}</bdi>
                      <span className="tabular-nums text-(color:--color-page-muted)">{formatBytes(item.bytes)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-sm leading-6 text-(color:--color-page-muted)">
                  لا تتوفر هنا أعداد طلبات الـ API ولا استدعاءات الدوال ولا حركة البيانات (5 جيجابايت و500 ألف استدعاء شهريًا في الخطة المجانية). راجعها في لوحة Supabase، قسم Reports.
                  {ref && (
                    <>
                      {' '}
                      <a href={`https://supabase.com/dashboard/project/${ref}/reports`} target="_blank" rel="noopener noreferrer" className="font-bold text-(color:--color-page-primary) underline underline-offset-4 outline-(--color-page-primary)">
                        افتح Reports<span className="sr-only"> (يفتح في نافذة جديدة)</span>
                      </a>
                    </>
                  )}
                </p>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  )
}
