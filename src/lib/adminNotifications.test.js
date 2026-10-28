import { describe, expect, it } from 'vitest'
import {
  announcementPayload,
  announcementState,
  announcementToForm,
  emptyAnnouncement,
  formToAnnouncement,
  fromLocalInput,
  previewWeekly,
  toLocalInput,
  validateAnnouncement,
  validateTemplate,
} from './adminNotifications'

const valid = () => ({ ...emptyAnnouncement(new Date('2026-10-29T10:00:00')), title: 'جديد', body: 'نص قصير.' })

describe('validateAnnouncement', () => {
  it('accepts a complete announcement', () => {
    expect(validateAnnouncement(valid())).toEqual({})
  })

  // Each case breaks exactly one rule and satisfies the others.
  it.each([
    ['title', { title: ' ' }],
    ['title', { title: 'ع'.repeat(121) }],
    ['body', { body: '' }],
    ['body', { body: 'ع'.repeat(401) }],
    ['link', { link: 'https://evil.example' }],
    ['link', { link: '//evil.example' }],
    ['link', { link: 'content' }],
    ['link', { link: '/a b' }],
    ['startsAt', { startsAt: '' }],
    ['expiresAt', { expiresAt: '2026-10-29T09:00' }],
    ['expiresAt', { expiresAt: '2026-10-29T10:00' }],
  ])('rejects a bad %s', (field, change) => {
    expect(validateAnnouncement({ ...valid(), ...change })).toHaveProperty(field)
  })

  it('accepts an internal link with a query and a later end time', () => {
    expect(validateAnnouncement({ ...valid(), link: '/content?type=podcasts', expiresAt: '2026-10-30T10:00' })).toEqual({})
  })
})

describe('time conversion', () => {
  it('round-trips a local time through the ISO instant', () => {
    const local = '2026-10-29T21:30'
    expect(toLocalInput(fromLocalInput(local))).toBe(local)
  })

  it('treats empty and bad values as none', () => {
    expect(fromLocalInput('')).toBeNull()
    expect(fromLocalInput('nonsense')).toBeNull()
    expect(toLocalInput(null)).toBe('')
    expect(toLocalInput('nonsense')).toBe('')
  })

  it('round-trips a whole announcement', () => {
    const row = { id: 1, ...formToAnnouncement({ ...valid(), link: '/help', expiresAt: '2026-11-01T08:00', published: 'false' }) }
    expect(formToAnnouncement(announcementToForm(row))).toEqual(formToAnnouncement(announcementToForm(row)))
    expect(announcementToForm(row)).toMatchObject({ link: '/help', expiresAt: '2026-11-01T08:00', published: 'false' })
  })
})

describe('announcementState', () => {
  const now = new Date('2026-10-29T12:00:00Z')
  const row = (o) => ({ published: true, starts_at: '2026-10-29T10:00:00Z', expires_at: null, ...o })

  it.each([
    ['hidden', { published: false }],
    ['scheduled', { starts_at: '2026-10-30T00:00:00Z' }],
    ['ended', { expires_at: '2026-10-29T11:00:00Z' }],
    ['live', {}],
    ['live', { expires_at: '2026-10-31T00:00:00Z' }],
  ])('is %s', (state, change) => {
    expect(announcementState(row(change), now)).toBe(state)
  })

  it('hidden wins over everything else', () => {
    expect(announcementState(row({ published: false, starts_at: '2026-12-01T00:00:00Z' }), now)).toBe('hidden')
  })
})

describe('templates', () => {
  it('requires {days} in the weekly text with days only', () => {
    expect(validateTemplate('weekly_some', { title: 'ت', body: 'سجلت أيامًا' })).toHaveProperty('body')
    expect(validateTemplate('weekly_some', { title: 'ت', body: 'سجلت {days} أيام' })).toEqual({})
    expect(validateTemplate('weekly_none', { title: 'ت', body: 'لم تسجل' })).toEqual({})
    expect(validateTemplate('daily_reminder', { title: 'ت', body: 'نص' })).toEqual({})
  })

  it('keeps title and body within the database limits', () => {
    expect(validateTemplate('daily_reminder', { title: '', body: 'نص' })).toHaveProperty('title')
    expect(validateTemplate('daily_reminder', { title: 'ت', body: 'ع'.repeat(381) })).toHaveProperty('body')
  })

  it('previews the count in place of {days}', () => {
    expect(previewWeekly('سجلت {days} من 7 و{days}', 4)).toBe('سجلت 4 من 7 و4')
  })
})

describe('announcementPayload', () => {
  const previous = { id: 1, title: 'ع', body: 'ب', link: null, published: true, starts_at: '2026-10-29T10:00:12.345Z', expires_at: '2026-11-01T08:30:45.000Z' }

  it('keeps exact saved times that the admin did not touch', () => {
    const form = { ...announcementToForm(previous), title: 'عنوان جديد' }
    const payload = announcementPayload(previous, form)
    expect(payload.starts_at).toBe(previous.starts_at)
    expect(payload.expires_at).toBe(previous.expires_at)
    expect(payload.title).toBe('عنوان جديد')
  })

  it('uses the new time when the admin changes it, and clears an emptied end time', () => {
    const changed = announcementPayload(previous, { ...announcementToForm(previous), startsAt: '2030-01-01T09:00', expiresAt: '' })
    expect(new Date(changed.starts_at).getFullYear()).toBe(2030)
    expect(changed.expires_at).toBeNull()
  })

  it('does not invent an end time when there was none', () => {
    const noEnd = { ...previous, expires_at: null }
    expect(announcementPayload(noEnd, announcementToForm(noEnd)).expires_at).toBeNull()
  })
})
