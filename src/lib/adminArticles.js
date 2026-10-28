import { articleImages, categories } from '../data/articles.js'
import { logAdminAction } from './admin.js'
import { rowToArticle } from './articles.js'
import { supabase } from './supabase.js'

export { categories }
export const imageChoices = Object.entries(articleImages).map(([key, image]) => ({ key, ...image }))

const COLUMNS =
  'id, slug, title, excerpt, category, minutes, image_src, image_alt, idea, practice, remember, sources, status, sort_order, reviewed_by, reviewed_on, created_at, updated_at'
const LIST_COLUMNS = 'id, slug, title, category, status, sort_order, reviewed_by, reviewed_on, updated_at'

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const bytes = (value) => new TextEncoder().encode(JSON.stringify(value)).length

export const splitParagraphs = (text) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

export const splitLines = (text) =>
  String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

function isHttps(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

// One source per line: "title | organisation | https://address".
export function parseSources(text) {
  const sources = []
  for (const line of splitLines(text)) {
    const [title, org, url, ...rest] = line.split('|').map((part) => part.trim())
    if (!title || !org || !url || rest.length || !isHttps(url)) return { sources: [], error: `سطر غير صالح في المصادر: «${line.slice(0, 40)}». الصيغة: العنوان | الجهة | https://…` }
    sources.push({ title, org, url })
  }
  return { sources, error: null }
}

export function emptyForm(sortOrder = 1000) {
  return {
    slug: '',
    title: '',
    excerpt: '',
    category: categories[0],
    minutes: '5',
    imageSrc: imageChoices[0].src,
    imageAlt: imageChoices[0].alt,
    ideaHeading: '',
    ideaParagraphs: '',
    ideaQuote: '',
    practiceHeading: '',
    practiceParagraphs: '',
    practiceExercise: '',
    remember: '',
    sources: '',
    status: 'draft',
    sortOrder: String(sortOrder),
    reviewedBy: '',
    reviewedOn: '',
  }
}

export function rowToForm(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    minutes: String(row.minutes),
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
    ideaHeading: row.idea?.heading ?? '',
    ideaParagraphs: (row.idea?.paragraphs ?? []).join('\n\n'),
    ideaQuote: row.idea?.quote ?? '',
    practiceHeading: row.practice?.heading ?? '',
    practiceParagraphs: (row.practice?.paragraphs ?? []).join('\n\n'),
    practiceExercise: row.practice?.exercise ?? '',
    remember: (row.remember ?? []).join('\n'),
    sources: (row.sources ?? []).map((source) => `${source.title} | ${source.org} | ${source.url}`).join('\n'),
    status: row.status,
    sortOrder: String(row.sort_order),
    reviewedBy: row.reviewed_by ?? '',
    reviewedOn: row.reviewed_on ?? '',
  }
}

// The columns written to the database (the slug is only sent when creating).
export function formToRow(form, { isNew }) {
  const row = {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    category: form.category,
    minutes: Number(form.minutes),
    image_src: form.imageSrc,
    image_alt: form.imageAlt.trim(),
    idea: { heading: form.ideaHeading.trim(), paragraphs: splitParagraphs(form.ideaParagraphs), quote: form.ideaQuote.trim() },
    practice: { heading: form.practiceHeading.trim(), paragraphs: splitParagraphs(form.practiceParagraphs), exercise: form.practiceExercise.trim() },
    remember: splitLines(form.remember),
    sources: parseSources(form.sources).sources,
    status: form.status,
    sort_order: Number(form.sortOrder),
    reviewed_by: form.reviewedBy.trim() || null,
    reviewed_on: form.reviewedBy.trim() ? form.reviewedOn || null : null,
  }
  return isNew ? { slug: form.slug.trim(), ...row } : row
}

// What the preview shows: the same mapping the public page uses.
export const formToArticle = (form) => rowToArticle({ id: 0, slug: form.slug || 'preview', ...formToRow(form, { isNew: true }) })

// { field: message } for everything that would be rejected; empty when the form can be saved.
export function validateForm(form, { isNew, today = new Date().toISOString().slice(0, 10) }) {
  const errors = {}
  const row = formToRow(form, { isNew })
  if (isNew && (!SLUG.test(row.slug) || row.slug.length < 3 || row.slug.length > 80)) errors.slug = 'العنوان في الرابط: حروف إنجليزية صغيرة وأرقام وشرطات بين الكلمات، من 3 إلى 80 حرفًا.'
  if (!row.title || row.title.length > 150) errors.title = 'العنوان مطلوب، وحتى 150 حرفًا.'
  if (!row.excerpt || row.excerpt.length > 300) errors.excerpt = 'الملخص مطلوب، وحتى 300 حرف.'
  if (!categories.includes(row.category)) errors.category = 'اختر تصنيفًا من القائمة.'
  if (!Number.isInteger(row.minutes) || row.minutes < 1 || row.minutes > 60) errors.minutes = 'مدة القراءة رقم صحيح من 1 إلى 60.'
  if (!imageChoices.some((image) => image.src === row.image_src)) errors.imageSrc = 'اختر إحدى الرسومات.'
  if (!row.image_alt || row.image_alt.length > 300) errors.imageAlt = 'وصف الصورة مطلوب، وحتى 300 حرف.'
  if (!row.idea.heading) errors.ideaHeading = 'عنوان القسم الأول مطلوب.'
  if (row.idea.paragraphs.length === 0) errors.ideaParagraphs = 'اكتب فقرة واحدة على الأقل، وافصل بين الفقرات بسطر فارغ.'
  if (!row.practice.heading) errors.practiceHeading = 'عنوان القسم الثاني مطلوب.'
  if (row.practice.paragraphs.length === 0) errors.practiceParagraphs = 'اكتب فقرة واحدة على الأقل، وافصل بين الفقرات بسطر فارغ.'
  if (bytes(row.idea) > 11000) errors.ideaParagraphs = 'نص القسم الأول طويل جدًا.'
  if (bytes(row.practice) > 11000) errors.practiceParagraphs = 'نص القسم الثاني طويل جدًا.'
  if (row.remember.length < 1 || row.remember.length > 8) errors.remember = 'اكتب من نقطة إلى 8 نقاط، كل نقطة في سطر.'
  const parsed = parseSources(form.sources)
  if (parsed.error) errors.sources = parsed.error
  else if (parsed.sources.length > 5 || bytes(parsed.sources) > 2800) errors.sources = 'المصادر حتى 5 وبحجم معقول.'
  if (!Number.isInteger(row.sort_order) || Math.abs(row.sort_order) > 1_000_000) errors.sortOrder = 'الترتيب رقم صحيح.'
  if (form.reviewedBy.trim().length > 100) errors.reviewedBy = 'اسم المراجع حتى 100 حرف.'
  if (form.reviewedBy.trim()) {
    if (!form.reviewedOn) errors.reviewedOn = 'أضف تاريخ المراجعة.'
    else if (form.reviewedOn > today) errors.reviewedOn = 'تاريخ المراجعة لا يكون في المستقبل.'
  }
  return errors
}

export const isReviewed = (row) => Boolean(row.reviewed_by)

export function articleErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('23505')) return 'هذا العنوان في الرابط مستخدم لمقال آخر. اختر غيره.'
  if (text.includes('42501')) return 'ليست لديك صلاحية لهذا الإجراء.'
  if (text.includes('23514')) return 'إحدى القيم خارج الحدود المسموحة. راجع الحقول.'
  return 'تعذّر تنفيذ الطلب الآن. حاول مرة أخرى بعد قليل.'
}

// Audit entries hold the article id and the names of the fields that changed, never the text itself.
async function audit(action, id, fields) {
  try {
    await logAdminAction(action, 'article', id, fields ? { fields } : {})
    return true
  } catch {
    return false
  }
}

export async function listAllArticles() {
  const { data, error } = await supabase.from('articles').select(LIST_COLUMNS).order('sort_order').order('id')
  if (error) throw error
  return data ?? []
}

export async function getArticleRow(id) {
  const { data, error } = await supabase.from('articles').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function nextSortOrder() {
  const { data, error } = await supabase.from('articles').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  if (error) throw error
  return (data?.[0]?.sort_order ?? 0) + 10
}

// Returns { row, audited }.
export async function createArticle(form) {
  const { data, error } = await supabase.from('articles').insert(formToRow(form, { isNew: true })).select(COLUMNS).single()
  if (error) throw error
  const audited = await audit('article.create', data.id)
  return { row: data, audited }
}

export function changedFields(previous, next) {
  return Object.keys(next).filter((key) => JSON.stringify(previous[key] ?? null) !== JSON.stringify(next[key] ?? null))
}

export async function updateArticle(previous, form) {
  const payload = formToRow(form, { isNew: false })
  const fields = changedFields(previous, payload)
  if (fields.length === 0) return { row: previous, audited: true, unchanged: true }
  const { data, error } = await supabase.from('articles').update(payload).eq('id', previous.id).select(COLUMNS).single()
  if (error) throw error
  const publishing = fields.includes('status')
  const action = publishing ? (data.status === 'published' ? 'article.publish' : 'article.hide') : 'article.update'
  const audited = await audit(action, data.id, fields)
  return { row: data, audited }
}

export async function deleteDraft(id) {
  const { data, error } = await supabase.from('articles').delete().eq('id', id).eq('status', 'draft').select('id')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_deleted'), { code: '42501' })
  return { audited: await audit('article.delete', id) }
}
