import { categories } from '../data/articles.js'
import { logAdminAction } from './admin.js'
import { supabase } from './supabase.js'

export { categories }

const COLUMNS = 'id, kind, title, source, description, details, url, embed_url, audio_url, topic, sort_order, published, created_at, updated_at'
const LIST_COLUMNS = 'id, kind, title, source, topic, sort_order, published, updated_at, embed_url, audio_url'

const EMBED = {
  video: /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9%._~:/?#@!$&()*+,;=-]+$/,
  podcast: /^https:\/\/embed\.podcasts\.apple\.com\/[A-Za-z0-9%._~:/?#@!$&()*+,;=-]+$/,
}
const httpsLink = (value, max) => /^https:\/\/\S+$/.test(value) && value.length <= max

export const kindLabel = { video: 'فيديو', podcast: 'بودكاست' }

export function emptyForm(kind = 'podcast', sortOrder = 1000) {
  return { kind, title: '', source: '', description: '', details: '', url: '', embedUrl: '', audioUrl: '', topic: '', sortOrder: String(sortOrder), published: 'false' }
}

export function rowToForm(row) {
  return {
    kind: row.kind,
    title: row.title,
    source: row.source,
    description: row.description,
    details: row.details ?? '',
    url: row.url,
    embedUrl: row.embed_url ?? '',
    audioUrl: row.audio_url ?? '',
    topic: row.topic ?? '',
    sortOrder: String(row.sort_order),
    published: String(row.published),
  }
}

// The columns written to the database (the kind is only sent when creating).
export function formToRow(form, { isNew }) {
  const row = {
    title: form.title.trim(),
    source: form.source.trim(),
    description: form.description.trim(),
    details: form.details.trim() || null,
    url: form.url.trim(),
    embed_url: form.embedUrl.trim() || null,
    audio_url: form.audioUrl.trim() || null,
    topic: form.topic || null,
    sort_order: Number(form.sortOrder),
    published: form.published === 'true',
  }
  return isNew ? { kind: form.kind, ...row } : row
}

// { field: message } for everything the database would reject; empty when the form can be saved.
export function validateForm(form, { isNew = true } = {}) {
  const errors = {}
  const row = formToRow(form, { isNew })
  if (isNew && !kindLabel[form.kind]) errors.kind = 'اختر النوع.'
  if (!row.title || row.title.length > 120) errors.title = 'العنوان مطلوب، وحتى 120 حرفًا.'
  if (!row.source || row.source.length > 120) errors.source = 'المصدر مطلوب، وحتى 120 حرفًا.'
  if (!row.description || row.description.length > 300) errors.description = 'الوصف القصير مطلوب، وحتى 300 حرف.'
  if (row.details && row.details.length > 2000) errors.details = 'النص التفصيلي حتى 2000 حرف.'
  if (!httpsLink(row.url, 600)) errors.url = 'الرابط يبدأ بـ https:// وبلا مسافات.'
  if (row.embed_url) {
    const pattern = EMBED[form.kind]
    if (!pattern || !row.embed_url.match(pattern) || row.embed_url.length > 600) {
      errors.embedUrl = form.kind === 'video' ? 'رابط المشغّل للفيديو: https://www.youtube-nocookie.com/embed/…' : 'رابط المشغّل للبودكاست: https://embed.podcasts.apple.com/…'
    }
  }
  if (row.audio_url && !httpsLink(row.audio_url, 800)) errors.audioUrl = 'رابط الصوت يبدأ بـ https:// وبلا مسافات.'
  if (form.kind === 'video' && !row.embed_url && !errors.embedUrl) errors.embedUrl = 'الفيديو يحتاج رابط المشغّل.'
  if (form.kind === 'podcast' && !row.embed_url && !row.audio_url && !errors.embedUrl) errors.embedUrl = 'البودكاست يحتاج رابط مشغّل Apple أو رابط ملف صوت.'
  if (row.topic && !categories.includes(row.topic)) errors.topic = 'اختر موضوعًا من القائمة.'
  if (!Number.isInteger(row.sort_order) || Math.abs(row.sort_order) > 1_000_000) errors.sortOrder = 'الترتيب رقم صحيح.'
  return errors
}

// A looked-up episode (from the admin-media-tools function) placed into the form.
// The direct audio file is only filled in when there is no player address (an RSS episode needs it to play);
// for Apple episodes it stays a suggestion, because playing a publisher's file on the site needs their permission.
export function candidateToForm(current, lookup, candidate) {
  return {
    ...current,
    kind: lookup.kind,
    title: candidate.title,
    source: lookup.source,
    description: candidate.description,
    details: candidate.details,
    url: candidate.url,
    embedUrl: candidate.embedUrl ?? '',
    audioUrl: candidate.embedUrl ? '' : (candidate.audioUrl ?? ''),
  }
}

export function changedFields(previous, next) {
  return Object.keys(next).filter((key) => JSON.stringify(previous[key] ?? null) !== JSON.stringify(next[key] ?? null))
}

export function mediaErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('42501')) return 'ليست لديك صلاحية لهذا الإجراء.'
  if (text.includes('23514')) return 'إحدى القيم خارج الحدود المسموحة. راجع الحقول.'
  return 'تعذّر تنفيذ الطلب الآن. حاول مرة أخرى بعد قليل.'
}

const lookupMessages = {
  invalid_url: 'الرابط غير صالح. استخدم رابطًا يبدأ بـ https://.',
  unsupported: 'هذا الرابط غير مدعوم. استخدم رابط فيديو YouTube أو رابط Apple Podcasts أو عنوان خلاصة RSS.',
  blocked_host: 'لا يمكن قراءة هذا العنوان.',
  video_not_found: 'هذا الفيديو غير موجود.',
  embedding_disabled: 'صاحب الفيديو منع تضمينه في المواقع، فلن يعمل داخل ميورا.',
  video_forbidden: 'يوتيوب رفض الوصول للفيديو (قد يكون خاصًا أو مقيّدًا). تحقق منه بنفسك قبل إضافته.',
  not_found: 'لم نجد هذا البرنامج.',
  episode_not_found: 'لم نجد هذه الحلقة في قائمة Apple (الحلقات القديمة جدًا لا تظهر). جرّب عنوان خلاصة RSS.',
  not_a_feed: 'هذا الرابط ليس خلاصة بودكاست (RSS).',
  no_episodes: 'لا توجد حلقات قابلة للتشغيل في هذه الخلاصة.',
  fetch_failed: 'تعذّر الوصول للرابط الآن. حاول مرة أخرى.',
  too_many_redirects: 'الرابط يحوّل كثيرًا ولا يمكن قراءته.',
}

async function callTool(body) {
  const { data, error } = await supabase.functions.invoke('admin-media-tools', { body })
  if (!error) return data
  let code = null
  try {
    code = (await error.context?.json?.())?.error ?? null
  } catch {
    // not a JSON reply
  }
  throw Object.assign(new Error(code ?? 'tool_failed'), { toolCode: code })
}

export const lookupErrorMessage = (error) => lookupMessages[error?.toolCode] ?? (error?.toolCode === 'forbidden' ? 'ليست لديك صلاحية لهذا الإجراء.' : lookupMessages.fetch_failed)

export const lookupEpisode = (url) => callTool({ action: 'lookup', url })

const checkMessages = {
  video_removed: 'الفيديو حُذف من يوتيوب',
  embedding_disabled: 'منع صاحب الفيديو تضمينه',
  video_forbidden: 'يوتيوب رفض الوصول للفيديو (خاص أو مقيّد)',
  video_bad_embed: 'رابط المشغّل غير صالح',
  audio_not_audio: 'رابط الصوت لا يعطي ملفًا صوتيًا',
  audio_blocked: 'خادم الصوت رفض الفحص',
  apple_not_found: 'البرنامج غير موجود في Apple',
  apple_episode_not_listed: 'الحلقة غير ظاهرة في قائمة Apple (قديمة؟)',
  no_audio_source: 'لا مصدر صوت: أضف رابط مشغّل أو ملف صوت',
  page_blocked: 'صفحة الحلقة رفضت الفحص',
}

export function checkLabel(detail) {
  return String(detail ?? '')
    .split(',')
    .filter(Boolean)
    .map((code) => checkMessages[code] ?? (code.match(/_http_(\d+)$/) ? `الخادم أجاب برمز ${code.match(/_http_(\d+)$/)[1]}` : 'تعذّر الوصول'))
    .join('، ')
}

export async function listAllMedia() {
  const [{ data: rows, error }, { data: checks, error: checkError }] = await Promise.all([
    supabase.from('resources').select(LIST_COLUMNS).neq('kind', 'guide').order('sort_order').order('id'),
    supabase.from('resource_checks').select('resource_id, status, detail, checked_at'),
  ])
  if (error) throw error
  if (checkError) throw checkError
  const byId = new Map((checks ?? []).map((check) => [check.resource_id, check]))
  return (rows ?? []).map((row) => ({ ...row, check: byId.get(row.id) ?? null }))
}

export async function getMediaRow(id) {
  const { data, error } = await supabase.from('resources').select(COLUMNS).eq('id', id).neq('kind', 'guide').maybeSingle()
  if (error) throw error
  return data
}

export async function getCheck(id) {
  const { data } = await supabase.from('resource_checks').select('status, detail, checked_at').eq('resource_id', id).maybeSingle()
  return data ?? null
}

export async function nextSortOrder() {
  const { data, error } = await supabase.from('resources').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  if (error) throw error
  return (data?.[0]?.sort_order ?? 0) + 10
}

// Audit entries hold the row id and the names of the fields that changed, never the text itself.
async function audit(action, id, fields) {
  try {
    await logAdminAction(action, 'resource', id, fields ? { fields } : {})
    return true
  } catch {
    return false
  }
}

export async function createMedia(form) {
  const { data, error } = await supabase.from('resources').insert(formToRow(form, { isNew: true })).select(COLUMNS).single()
  if (error) throw error
  return { row: data, audited: await audit('media.create', data.id) }
}

export async function updateMedia(previous, form) {
  const payload = formToRow(form, { isNew: false })
  const fields = changedFields(previous, { ...payload, sort_order: payload.sort_order })
  if (fields.length === 0) return { row: previous, audited: true, unchanged: true }
  const { data, error } = await supabase.from('resources').update(payload).eq('id', previous.id).select(COLUMNS).single()
  if (error) throw error
  const action = fields.includes('published') ? (data.published ? 'media.publish' : 'media.hide') : 'media.update'
  return { row: data, audited: await audit(action, data.id, fields) }
}

export async function deleteHidden(id) {
  const { data, error } = await supabase.from('resources').delete().eq('id', id).eq('published', false).select('id')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_deleted'), { code: '42501' })
  return { audited: await audit('media.delete', id) }
}

// Checks the given rows (or all of them) and returns [{ id, status, detail }].
export async function runCheck(ids) {
  const data = await callTool(ids ? { action: 'check', ids } : { action: 'check' })
  const results = data?.results ?? []
  await audit('media.check', ids?.length === 1 ? ids[0] : null, [`${results.length} rows`, `${results.filter((r) => r.status === 'failed').length} failed`])
  return results
}
