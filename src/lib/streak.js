// Consecutive days with a mood check-in, counted in Cairo time.
// A streak stays alive until the end of the day after the last check-in.
const cairoDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' })

function shift(day, days) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function moodStreak(days, now = new Date()) {
  const logged = new Set(days)
  const today = cairoDay.format(now)
  let day = logged.has(today) ? today : shift(today, -1)
  let count = 0
  while (logged.has(day)) {
    count += 1
    day = shift(day, -1)
  }
  return { count, today: logged.has(today) }
}

const number = new Intl.NumberFormat('ar-EG')

export function streakText({ count, today }) {
  if (count === 0) return null
  if (count === 1) return today ? 'سجّلت شعورك اليوم. خطوة صغيرة تصنع فرقًا.' : 'سجّلت شعورك أمس. يمكنك المتابعة اليوم إن أحببت.'
  if (count === 2) return 'سجّلت شعورك يومين متتاليين. استمر بهدوء ومن دون ضغط.'
  const days = count <= 10 ? `${number.format(count)} أيام متتالية` : `${number.format(count)} يومًا متتاليًا`
  return `سجّلت شعورك ${days}. استمر بهدوء ومن دون ضغط.`
}
