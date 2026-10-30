import { describe, expect, it } from 'vitest'
import { fallbackLines } from './emergency.js'
import { ADDICTION_TOPIC, fallbackAddictionLine, findAddictionLine, isAddictionArticle, isAddictionEpisode } from './addiction.js'

const ambulance = { id: 1, title: 'الإسعاف', number: '123', note: 'إذا كنت أنت أو غيرك في خطر الآن.' }

describe('findAddictionLine', () => {
  it('picks the number the admin labelled as an addiction line, in the title or the note', () => {
    const byTitle = { id: 7, title: 'الخط الساخن لعلاج الإدمان', number: '16023', note: '' }
    const byNote = { id: 8, title: 'خط المساعدة', number: '19999', note: 'لعلاج الإدمان والتعافي' }
    expect(findAddictionLine([ambulance, byTitle])).toBe(byTitle)
    expect(findAddictionLine([ambulance, byNote])).toBe(byNote)
  })

  it('falls back to the saved 16023 line when no number mentions addiction', () => {
    expect(findAddictionLine([ambulance])).toBe(fallbackAddictionLine)
    expect(findAddictionLine([])).toBe(fallbackAddictionLine)
    expect(fallbackAddictionLine.number).toBe('16023')
  })

  it('also finds it among the help page fallback numbers, which keep the same line', () => {
    expect(findAddictionLine(fallbackLines).number).toBe('16023')
  })
})

describe('section filters', () => {
  it('keeps only articles and episodes from the addiction topic', () => {
    expect(isAddictionArticle({ category: ADDICTION_TOPIC })).toBe(true)
    expect(isAddictionArticle({ category: 'النوم والراحة' })).toBe(false)
    expect(isAddictionEpisode({ topic: ADDICTION_TOPIC })).toBe(true)
    expect(isAddictionEpisode({ topic: null })).toBe(false)
  })
})
