import { describe, expect, it } from 'vitest'
import { normalizeArabic } from './arabicSearch'

describe('normalizeArabic', () => {
  it('ignores diacritics and tatweel', () => {
    expect(normalizeArabic('التَّوتُّر')).toBe(normalizeArabic('التوتر'))
    expect(normalizeArabic('ـالتوتر')).toBe('التوتر')
  })

  it('treats alef forms, teh marbuta and yeh as one', () => {
    expect(normalizeArabic('أنانية')).toBe(normalizeArabic('انانيه'))
    expect(normalizeArabic('مستشفى')).toBe(normalizeArabic('مستشفي'))
  })

  it('collapses whitespace and lowercases', () => {
    expect(normalizeArabic('  Stress   Test ')).toBe('stress test')
  })
})
