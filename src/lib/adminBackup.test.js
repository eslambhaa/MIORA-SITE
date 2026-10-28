import { describe, expect, it } from 'vitest'
import { BACKUP_TABLES, backupFileName, buildBackup } from './adminBackup'

describe('backup file', () => {
  it('names the file by date', () => {
    expect(backupFileName(new Date('2026-10-29T23:30:00Z'))).toBe('miora-content-2026-10-29.json')
  })

  it('counts every table and keeps the rows as they are', () => {
    const backup = buildBackup({ articles: [{ id: 1 }, { id: 2 }], resources: [], emergency_contacts: [{ id: 1 }] }, new Date('2026-10-29T00:00:00Z'))
    expect(backup).toMatchObject({ app: 'miora', kind: 'content-backup', format: 1, exported_at: '2026-10-29T00:00:00.000Z' })
    expect(backup.counts).toEqual({ articles: 2, resources: 0, emergency_contacts: 1 })
    expect(backup.tables.articles).toHaveLength(2)
  })
})

// The backup is content only. These guard the privacy rule: no user tables and no admin identifiers.
describe('what the backup may contain', () => {
  const forbiddenTables = ['profiles', 'mood_logs', 'journal_entries', 'assessment_results', 'assistant_messages', 'assistant_conversations', 'contact_messages', 'admin_users', 'admin_audit_log', 'notifications', 'notification_settings', 'exercise_sessions']

  it('reads only content tables', () => {
    for (const table of BACKUP_TABLES) expect(forbiddenTables).not.toContain(table.key)
    expect(BACKUP_TABLES.map((table) => table.key).sort()).toEqual(['announcements', 'articles', 'emergency_contacts', 'notification_templates', 'resources'])
  })

  it('never selects the admin who created a row or a wildcard', () => {
    for (const table of BACKUP_TABLES) {
      expect(table.columns).not.toMatch(/created_by|user_id|\*/)
    }
  })
})
