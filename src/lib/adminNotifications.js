import { logAdminAction } from './admin.js'
import { isInternalLink } from './notifications.js'
import { supabase } from './supabase.js'

const COLUMNS = 'id, title, body, link, published, starts_at, expires_at'
// The wording the hourly job falls back to when a row is missing (same text as the database default).
export const templateDefaults = {
  daily_reminder: { title: 'كيف حالك اليوم؟', body: 'خذ دقيقة وسجّل شعورك. لا يلزم أكثر من ذلك.' },
  weekly_none: { title: 'ملخصك الأسبوعي', body: 'لم تسجّل شعورك هذا الأسبوع. لا بأس، يمكنك أن تبدأ اليوم بخطوة صغيرة.' },
  weekly_some: { title: 'ملخصك الأسبوعي', body: 'سجّلت شعورك في {days} من 7 أيام هذا الأسبوع. شكرًا لاهتمامك بنفسك.' },
}

export const templateInfo = {
  daily_reminder: { label: 'التذكير اليومي', when: 'يُرسل في الساعة التي اختارها الشخص (الافتراضي 8 مساءً) إن لم يسجّل شعوره اليوم.' },
  weekly_none: { label: 'الملخص الأسبوعي: لم يسجّل شعوره', when: 'يوم الجمعة 6 مساءً لمن لم يسجّل أي يوم في الأسبوع.' },
  weekly_some: { label: 'الملخص الأسبوعي: سجّل بعض الأيام', when: 'يوم الجمعة 6 مساءً. اكتب {days} مكان عدد أيام تسجيله هو، وسيحل مكانه رقمه.' },
}

// <input type="datetime-local"> works in the browser's own time zone. These convert to and from an ISO instant.
const two = (value) => String(value).padStart(2, '0')

export function toLocalInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`
}

export function fromLocalInput(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function emptyAnnouncement(now = new Date()) {
  return { title: '', body: '', link: '', startsAt: toLocalInput(now.toISOString()), expiresAt: '', published: 'true' }
}

export function announcementToForm(row) {
  return { title: row.title, body: row.body, link: row.link ?? '', startsAt: toLocalInput(row.starts_at), expiresAt: toLocalInput(row.expires_at), published: String(row.published) }
}

export function formToAnnouncement(form) {
  return {
    title: form.title.trim(),
    body: form.body.trim(),
    link: form.link.trim() || null,
    published: form.published === 'true',
    starts_at: fromLocalInput(form.startsAt),
    expires_at: fromLocalInput(form.expiresAt),
  }
}

export function validateAnnouncement(form) {
  const errors = {}
  const row = formToAnnouncement(form)
  if (!row.title || row.title.length > 120) errors.title = 'العنوان مطلوب، وحتى 120 حرفًا.'
  if (!row.body || row.body.length > 400) errors.body = 'النص مطلوب، وحتى 400 حرف.'
  if (row.link && (!isInternalLink(row.link) || row.link.length > 200)) errors.link = 'رابط داخلي فقط يبدأ بـ / مثل /content أو /relaxation.'
  if (!row.starts_at) errors.startsAt = 'حدّد وقت البدء.'
  if (form.expiresAt && !row.expires_at) errors.expiresAt = 'وقت الانتهاء غير صالح.'
  else if (row.starts_at && row.expires_at && row.expires_at <= row.starts_at) errors.expiresAt = 'وقت الانتهاء يجب أن يكون بعد وقت البدء.'
  return errors
}

// 'hidden' | 'scheduled' | 'live' | 'ended', the way a visitor would experience it right now.
export function announcementState(row, now = new Date()) {
  if (!row.published) return 'hidden'
  if (new Date(row.starts_at) > now) return 'scheduled'
  if (row.expires_at && new Date(row.expires_at) <= now) return 'ended'
  return 'live'
}

export const stateLabel = { hidden: 'مخفي', scheduled: 'مجدول', live: 'ظاهر الآن', ended: 'منتهٍ' }

export function validateTemplate(kind, form) {
  const errors = {}
  const title = form.title.trim()
  const body = form.body.trim()
  if (!title || title.length > 120) errors.title = 'العنوان مطلوب، وحتى 120 حرفًا.'
  if (!body || body.length > 380) errors.body = 'النص مطلوب، وحتى 380 حرفًا.'
  else if (kind === 'weekly_some' && !body.includes('{days}')) errors.body = 'يجب أن يحتوي النص على {days} ليحل مكانه عدد الأيام.'
  return errors
}

// What a person would read for the "some days" weekly text, with their own count in place of {days}.
export const previewWeekly = (body, days = 3) => body.replaceAll('{days}', String(days))

export function notificationErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('42501')) return 'ليست لديك صلاحية لهذا الإجراء.'
  if (text.includes('23514')) return 'إحدى القيم خارج الحدود المسموحة. راجع الحقول.'
  return 'تعذّر تنفيذ الطلب الآن. حاول مرة أخرى بعد قليل.'
}

export function changedFields(previous, next) {
  return Object.keys(next).filter((key) => JSON.stringify(previous[key] ?? null) !== JSON.stringify(next[key] ?? null))
}

// Audit entries hold the row id and the names of the fields that changed, never the wording.
async function audit(action, entity, id, fields) {
  try {
    await logAdminAction(action, entity, id, fields ? { fields } : {})
    return true
  } catch {
    return false
  }
}

export async function listAnnouncements() {
  const { data, error } = await supabase.from('announcements').select(COLUMNS).order('starts_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createAnnouncement(form) {
  const { data, error } = await supabase.from('announcements').insert(formToAnnouncement(form)).select(COLUMNS).single()
  if (error) throw error
  return { row: data, audited: await audit('announcement.create', 'announcement', data.id) }
}

// The form's time fields only hold minutes. A time the admin did not touch keeps its exact saved value,
// so editing the text does not move the start or end time by a few seconds.
export function announcementPayload(previous, form) {
  const payload = formToAnnouncement(form)
  if (form.startsAt === toLocalInput(previous.starts_at)) payload.starts_at = previous.starts_at
  if (form.expiresAt === toLocalInput(previous.expires_at)) payload.expires_at = previous.expires_at
  return payload
}

export async function updateAnnouncement(previous, form) {
  const payload = announcementPayload(previous, form)
  const fields = changedFields(previous, payload)
  if (fields.length === 0) return { row: previous, audited: true, unchanged: true }
  const { data, error } = await supabase.from('announcements').update(payload).eq('id', previous.id).select(COLUMNS).single()
  if (error) throw error
  const action = fields.includes('published') ? (data.published ? 'announcement.publish' : 'announcement.hide') : 'announcement.update'
  return { row: data, audited: await audit(action, 'announcement', data.id, fields) }
}

export async function deleteAnnouncement(id) {
  const { data, error } = await supabase.from('announcements').delete().eq('id', id).eq('published', false).select('id')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_deleted'), { code: '42501' })
  return { audited: await audit('announcement.delete', 'announcement', id) }
}

export async function listTemplates() {
  const { data, error } = await supabase.from('notification_templates').select('kind, title, body, updated_at')
  if (error) throw error
  const byKind = new Map((data ?? []).map((row) => [row.kind, row]))
  // A missing row shows the default the job would use, so the page always has all three.
  return Object.keys(templateDefaults).map((kind) => byKind.get(kind) ?? { kind, ...templateDefaults[kind], updated_at: null })
}

export async function saveTemplate(kind, form) {
  const payload = { title: form.title.trim(), body: form.body.trim() }
  const { data, error } = await supabase.from('notification_templates').update(payload).eq('kind', kind).select('kind, title, body, updated_at')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_updated'), { code: '42501' })
  return { row: data[0], audited: await audit('template.update', 'notification_template', kind, ['title', 'body']) }
}
