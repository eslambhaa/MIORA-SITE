import { supabase } from './supabase.js'

export const auditLabels = {
  'admin.add': 'إضافة مشرف',
  'admin.remove': 'سحب صلاحية مشرف',
}

export async function listAdmins() {
  const { data, error } = await supabase.rpc('admin_list')
  if (error) throw error
  return data ?? []
}

export async function setAdmin(email, makeAdmin) {
  const { error } = await supabase.rpc('admin_set', { target_email: email, make_admin: makeAdmin })
  if (error) throw error
}

export async function listAudit(limit = 50) {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, admin_id, action, entity, entity_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

// Details hold ids and field names only, never personal text.
export async function logAdminAction(action, entity, entityId = null, details = {}) {
  const { error } = await supabase
    .from('admin_audit_log')
    .insert({ action, entity, entity_id: entityId == null ? null : String(entityId), details })
  if (error) throw error
}

export function adminErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('user_not_found') || text.includes('P0002')) return 'لا يوجد حساب بهذا البريد. يجب أن يسجّل الشخص في ميورا أولًا.'
  if (text.includes('last_admin')) return 'لا يمكن سحب صلاحية آخر مشرف.'
  if (text.includes('forbidden') || text.includes('42501')) return 'ليست لديك صلاحية لهذا الإجراء.'
  return 'تعذّر تنفيذ الطلب الآن. حاول مرة أخرى بعد قليل.'
}
