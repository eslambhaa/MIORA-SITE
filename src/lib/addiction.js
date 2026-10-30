import { normalizeArabic } from './arabicSearch.js'

// The addiction awareness section (/addiction) reuses the articles, episodes and help numbers
// that the admin dashboard already manages; this file only picks its share of them.

export const ADDICTION_TOPIC = 'الوعي بالإدمان'

// Used until the database answers, or if the number is hidden or renamed there,
// so the help card always has a number to call.
export const fallbackAddictionLine = {
  id: 'addiction-fallback',
  country: 'مصر',
  title: 'الخط الساخن لعلاج الإدمان',
  number: '16023',
  note: 'صندوق مكافحة وعلاج الإدمان، مجاني وسري، على مدار الساعة.',
}

// The help number whose title or note mentions addiction (as the admin wrote it), else the saved copy.
export function findAddictionLine(lines) {
  return lines.find((line) => /إدمان/.test(`${line.title} ${line.note ?? ''}`)) ?? fallbackAddictionLine
}

// Words that make a piece about addiction even when the admin filed it under another topic
// (matched on normalized text, so إدمان and ادمان, مخدرات and المخدرات all count).
const ADDICTION_WORDS = ['ادمان', 'مدمن', 'تعاطي', 'مخدر', 'مقامره', 'كحول']

export function mentionsAddiction(...texts) {
  const text = normalizeArabic(texts.filter(Boolean).join(' '))
  return ADDICTION_WORDS.some((word) => text.includes(word))
}

// Everything about addiction belongs on the section page: its own topic, or a title or summary that names it.
export const isAddictionArticle = (article) => article.category === ADDICTION_TOPIC || mentionsAddiction(article.title, article.excerpt)
export const isAddictionEpisode = (row) => row.topic === ADDICTION_TOPIC || mentionsAddiction(row.title, row.description, row.details)
