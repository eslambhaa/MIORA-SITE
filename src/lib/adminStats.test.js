import { describe, expect, it } from 'vitest'
import { daysSince, formatBytes, percent, usageLevel, weeklyTable } from './adminStats'

describe('usageLevel', () => {
  it.each([
    [0, 'ok'],
    [349, 'ok'],
    [350, 'warn'],
    [449, 'warn'],
    [450, 'danger'],
    [600, 'danger'],
  ])('%s of 500 is %s', (used, level) => {
    expect(usageLevel(used, 500)).toBe(level)
  })

  it('treats a zero limit as ok and caps the percentage', () => {
    expect(usageLevel(5, 0)).toBe('ok')
    expect(percent(600, 500)).toBe(100)
    expect(percent(5, 0)).toBe(0)
  })
})

describe('formatBytes', () => {
  it('uses the right unit', () => {
    expect(formatBytes(512)).toContain('بايت')
    expect(formatBytes(5214)).toContain('ك.ب')
    expect(formatBytes(13_121_203)).toContain('م.ب')
    expect(formatBytes(2 * 1024 ** 3)).toContain('ج.ب')
  })

  it('does not break on bad input', () => {
    expect(formatBytes(null)).toBe('—')
    expect(formatBytes(-1)).toBe('—')
  })
})

describe('daysSince', () => {
  const now = new Date('2026-10-29T12:00:00Z')
  it('counts whole days', () => {
    expect(daysSince('2026-10-29T01:00:00Z', now)).toBe(0)
    expect(daysSince('2026-10-26T12:00:00Z', now)).toBe(3)
  })
  it('is null without a date and never negative', () => {
    expect(daysSince(null, now)).toBeNull()
    expect(daysSince('nonsense', now)).toBeNull()
    expect(daysSince('2026-11-05T00:00:00Z', now)).toBe(0)
  })
})

describe('weeklyTable', () => {
  const weekly = [
    { metric: 'mood', week: '2026-10-26', events: 5 },
    { metric: 'mood', week: '2026-10-19', events: null },
    { metric: 'signup', week: '2026-10-26', events: 0 },
    { metric: 'signup', week: '2026-10-19', events: 3 },
  ]

  it('orders weeks oldest first and keeps hidden cells as null and zero as zero', () => {
    const table = weeklyTable(weekly)
    expect(table.weeks).toEqual(['2026-10-19', '2026-10-26'])
    expect(table.rows.find((row) => row.metric === 'mood').cells).toEqual([null, 5])
    expect(table.rows.find((row) => row.metric === 'signup').cells).toEqual([3, 0])
  })

  it('lists metrics in the fixed order and skips unknown ones', () => {
    const table = weeklyTable([...weekly, { metric: 'secret', week: '2026-10-26', events: 9 }])
    expect(table.rows.map((row) => row.metric)).toEqual(['signup', 'mood'])
  })
})
