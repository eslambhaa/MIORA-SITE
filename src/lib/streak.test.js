import { describe, expect, it } from 'vitest'
import { moodStreak, streakText } from './streak'

// 10:00 UTC is 12:00 or 13:00 in Cairo, so the Cairo date is the same UTC date.
const now = new Date('2026-10-28T10:00:00Z')

describe('moodStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(moodStreak(['2026-10-28', '2026-10-27', '2026-10-26'], now)).toEqual({ count: 3, today: true })
  })

  it('keeps the streak alive until the end of the next day', () => {
    expect(moodStreak(['2026-10-27', '2026-10-26'], now)).toEqual({ count: 2, today: false })
  })

  it('breaks on a gap', () => {
    expect(moodStreak(['2026-10-28', '2026-10-26'], now).count).toBe(1)
  })

  it('is zero when the last check-in is older than yesterday', () => {
    expect(moodStreak(['2026-10-25'], now)).toEqual({ count: 0, today: false })
  })

  it('uses the Cairo date, not the UTC date, near midnight', () => {
    // 22:30 UTC on the 27th is already the 28th in Cairo.
    expect(moodStreak(['2026-10-28'], new Date('2026-10-27T22:30:00Z')).today).toBe(true)
  })
})

describe('streakText', () => {
  it('returns null for no streak', () => {
    expect(streakText({ count: 0, today: false })).toBeNull()
  })

  it('differs for today and yesterday on a single day', () => {
    expect(streakText({ count: 1, today: true })).not.toBe(streakText({ count: 1, today: false }))
  })
})
