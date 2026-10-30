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

export const isAddictionArticle = (article) => article.category === ADDICTION_TOPIC
export const isAddictionEpisode = (row) => row.topic === ADDICTION_TOPIC
