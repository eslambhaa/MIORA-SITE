import { logAdminAction } from './admin.js'
import { supabase } from './supabase.js'

// Content only. Never user data: no accounts, journal, chats, assessments, mood, contact messages or admin list.
// Each entry is a table and the columns that go into the file (created_by, an admin's id, is left out).
export const BACKUP_TABLES = [
  { key: 'articles', label: 'المقالات', columns: 'id, slug, title, excerpt, category, minutes, image_src, image_alt, idea, practice, remember, sources, status, sort_order, reviewed_by, reviewed_on, created_at, updated_at' },
  { key: 'resources', label: 'الحلقات (فيديو وبودكاست)', columns: 'id, kind, title, source, description, details, url, embed_url, audio_url, topic, sort_order, published, created_at, updated_at' },
  { key: 'emergency_contacts', label: 'أرقام الطوارئ', columns: 'id, country, title, number, note, sort_order, published, updated_at' },
  { key: 'announcements', label: 'الإعلانات', columns: 'id, title, body, link, published, starts_at, expires_at, created_at' },
  { key: 'notification_templates', label: 'نصوص التذكير', columns: 'kind, title, body, updated_at' },
]

export function backupFileName(now = new Date()) {
  return `miora-content-${now.toISOString().slice(0, 10)}.json`
}

export function buildBackup(tables, now = new Date()) {
  return {
    app: 'miora',
    kind: 'content-backup',
    format: 1,
    exported_at: now.toISOString(),
    note: 'محتوى الموقع فقط. لا يحتوي على بيانات المستخدمين.',
    counts: Object.fromEntries(Object.entries(tables).map(([key, rows]) => [key, rows.length])),
    tables,
  }
}

export async function fetchBackup() {
  const results = await Promise.all(BACKUP_TABLES.map((table) => supabase.from(table.key).select(table.columns).order(table.key === 'notification_templates' ? 'kind' : 'id')))
  const failed = results.find((result) => result.error)
  if (failed) throw failed.error
  const tables = Object.fromEntries(BACKUP_TABLES.map((table, index) => [table.key, results[index].data ?? []]))
  return buildBackup(tables)
}

export function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Returns { fileName, counts, audited }.
export async function exportBackup() {
  const backup = await fetchBackup()
  const fileName = backupFileName(new Date(backup.exported_at))
  downloadJson(backup, fileName)
  let audited = true
  try {
    await logAdminAction('backup.export', 'backup', null, { counts: backup.counts })
  } catch {
    audited = false
  }
  return { fileName, counts: backup.counts, audited }
}
