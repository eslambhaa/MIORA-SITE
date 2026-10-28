import { logAdminAction } from './admin.js'
import { isDialable } from './emergency.js'
import { supabase } from './supabase.js'

const COLUMNS = 'id, country, title, number, note, sort_order, published, updated_at'

export function emptyForm(sortOrder = 10) {
  return { country: 'مصر', title: '', number: '', note: '', sortOrder: String(sortOrder), published: 'true' }
}

export function rowToForm(row) {
  return { country: row.country, title: row.title, number: row.number, note: row.note, sortOrder: String(row.sort_order), published: String(row.published) }
}

export function formToRow(form) {
  return {
    country: form.country.trim(),
    title: form.title.trim(),
    // Spaces and dashes people type between digits are dropped; anything else is left for validation to reject.
    number: form.number.trim().replace(/[\s-]/g, ''),
    note: form.note.trim(),
    sort_order: Number(form.sortOrder),
    published: form.published === 'true',
  }
}

export function validateForm(form) {
  const errors = {}
  const row = formToRow(form)
  if (!row.country || row.country.length > 40) errors.country = 'الدولة مطلوبة، وحتى 40 حرفًا.'
  if (!row.title || row.title.length > 100) errors.title = 'الاسم مطلوب، وحتى 100 حرف.'
  if (!isDialable(row.number)) errors.number = 'الرقم أرقام فقط (3 إلى 15)، ويجوز + في أوله.'
  if (row.note.length > 200) errors.note = 'الوصف حتى 200 حرف.'
  if (!Number.isInteger(row.sort_order) || Math.abs(row.sort_order) > 1_000_000) errors.sortOrder = 'الترتيب رقم صحيح.'
  return errors
}

export function changedFields(previous, next) {
  return Object.keys(next).filter((key) => JSON.stringify(previous[key] ?? null) !== JSON.stringify(next[key] ?? null))
}

export function emergencyErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('42501')) return 'ليست لديك صلاحية لهذا الإجراء.'
  if (text.includes('23514')) return 'إحدى القيم خارج الحدود المسموحة. راجع الحقول.'
  return 'تعذّر تنفيذ الطلب الآن. حاول مرة أخرى بعد قليل.'
}

// Audit entries hold the row id and the names of the fields that changed, never the text.
async function audit(action, id, fields) {
  try {
    await logAdminAction(action, 'emergency_contact', id, fields ? { fields } : {})
    return true
  } catch {
    return false
  }
}

export async function listEmergency() {
  const { data, error } = await supabase.from('emergency_contacts').select(COLUMNS).order('sort_order').order('id')
  if (error) throw error
  return data ?? []
}

export async function createEmergency(form) {
  const { data, error } = await supabase.from('emergency_contacts').insert(formToRow(form)).select(COLUMNS).single()
  if (error) throw error
  return { row: data, audited: await audit('emergency.create', data.id) }
}

export async function updateEmergency(previous, form) {
  const payload = formToRow(form)
  const fields = changedFields(previous, payload)
  if (fields.length === 0) return { row: previous, audited: true, unchanged: true }
  const { data, error } = await supabase.from('emergency_contacts').update(payload).eq('id', previous.id).select(COLUMNS).single()
  if (error) throw error
  const action = fields.includes('published') ? (data.published ? 'emergency.show' : 'emergency.hide') : 'emergency.update'
  return { row: data, audited: await audit(action, data.id, fields) }
}

export async function deleteEmergency(id) {
  const { data, error } = await supabase.from('emergency_contacts').delete().eq('id', id).eq('published', false).select('id')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_deleted'), { code: '42501' })
  return { audited: await audit('emergency.delete', id) }
}
