import { describe, expect, it } from 'vitest'
import { fallbackLines } from './emergency.js'
import { ADDICTION_TOPIC, fallbackAddictionLine, findAddictionLine, isAddictionArticle, isAddictionEpisode, mentionsAddiction } from './addiction.js'

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
  it('keeps everything filed under the addiction topic', () => {
    expect(isAddictionArticle({ category: ADDICTION_TOPIC, title: 'فهم الرغبة', excerpt: '' })).toBe(true)
    expect(isAddictionEpisode({ topic: ADDICTION_TOPIC, title: 'حلقة', description: '' })).toBe(true)
  })

  it('also keeps pieces from other topics whose title or summary talks about addiction', () => {
    expect(isAddictionArticle({ category: 'العلاقات', title: 'حين يمر أخي بالإدمان', excerpt: '' })).toBe(true)
    expect(isAddictionArticle({ category: 'تغيير العادات', title: 'عادة', excerpt: 'كيف تبتعد عن المخدرات' })).toBe(true)
    expect(isAddictionEpisode({ topic: 'فهم المشاعر', title: 'قصة تعافٍ', description: 'رحلة مع ادمان القمار' })).toBe(true)
    expect(isAddictionEpisode({ topic: null, title: 'حلقة', description: '', details: 'عن المقامرة والديون' })).toBe(true)
  })

  it('leaves out pieces that do not mention addiction', () => {
    expect(isAddictionArticle({ category: 'النوم والراحة', title: 'روتين مسائي يدعم راحتك', excerpt: 'خطوات للنوم' })).toBe(false)
    expect(isAddictionArticle({ category: 'تغيير العادات', title: 'التعثّر لا يلغي التقدّم', excerpt: 'نظرة واقعية للانتكاسات' })).toBe(false)
    expect(isAddictionEpisode({ topic: 'فهم المشاعر', title: 'أبجورة: ماذا بعد الفقد؟', description: '', details: null })).toBe(false)
  })

  it('matches the words with or without hamza and the article prefix', () => {
    expect(mentionsAddiction('إدمان')).toBe(true)
    expect(mentionsAddiction('ادمان')).toBe(true)
    expect(mentionsAddiction('بالمخدرات')).toBe(true)
    expect(mentionsAddiction(null, undefined, '')).toBe(false)
  })
})
