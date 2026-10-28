import { logAdminAction } from './admin.js'
import { supabase } from './supabase.js'

const COLUMNS = 'id, created_at, name, email, subject, message, status, handled_at'
export const PAGE_SIZE = 25

// A mailto: link is only built for plain addresses. The database accepts anything shaped like
// "x@y.z", which could carry "?cc=…" into the link, so odd addresses are shown as text without a link.
const PLAIN_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/

export function replyLink(message) {
  if (!PLAIN_EMAIL.test(message.email)) return null
  const subject = `رد: ${message.subject}`.slice(0, 200)
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}`
}

export const statusLabel = { new: 'جديدة', replied: 'تم الرد' }

export function messageErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('42501')) return 'ليست لديك صلاحية لهذا الإجراء.'
  return 'تعذّر تنفيذ الطلب الآن. حاول مرة أخرى بعد قليل.'
}

// One page of messages, newest first. filter: 'all' | 'new' | 'replied'.
export async function listMessages({ filter = 'all', offset = 0 } = {}) {
  let query = supabase.from('contact_messages').select(COLUMNS).order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1)
  if (filter !== 'all') query = query.eq('status', filter)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function countMessages() {
  const count = (status) => {
    let query = supabase.from('contact_messages').select('id', { count: 'exact', head: true })
    if (status) query = query.eq('status', status)
    return query
  }
  const [all, fresh] = await Promise.all([count(null), count('new')])
  if (all.error) throw all.error
  if (fresh.error) throw fresh.error
  return { total: all.count ?? 0, fresh: fresh.count ?? 0 }
}

// Audit entries hold only the message id, never the message or the sender.
async function audit(action, id) {
  try {
    await logAdminAction(action, 'contact_message', id)
    return true
  } catch {
    return false
  }
}

export async function setStatus(id, status) {
  const { data, error } = await supabase.from('contact_messages').update({ status }).eq('id', id).select(COLUMNS)
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_updated'), { code: '42501' })
  return { row: data[0], audited: await audit(status === 'replied' ? 'message.reply' : 'message.reopen', id) }
}

export async function deleteMessage(id) {
  const { data, error } = await supabase.from('contact_messages').delete().eq('id', id).select('id')
  if (error) throw error
  if (!data?.length) throw Object.assign(new Error('not_deleted'), { code: '42501' })
  return { audited: await audit('message.delete', id) }
}
