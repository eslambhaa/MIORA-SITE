import { describe, expect, it } from 'vitest'
import { changedFields, emptyForm, formToRow, parseSources, rowToForm, splitParagraphs, validateForm } from './adminArticles'

const valid = () => ({
  ...emptyForm(10),
  slug: 'managing-anger',
  title: 'إدارة الغضب',
  excerpt: 'خطوات قصيرة.',
  ideaHeading: 'الفكرة',
  ideaParagraphs: 'فقرة أولى.\n\nفقرة ثانية.',
  practiceHeading: 'خطوة',
  practiceParagraphs: 'جرّب هذا.',
  remember: 'نقطة واحدة',
})

describe('validateForm', () => {
  it('accepts a complete form', () => {
    expect(validateForm(valid(), { isNew: true })).toEqual({})
  })

  // Each case breaks exactly one rule and satisfies the others.
  it.each([
    ['slug', { slug: 'Bad Slug' }],
    ['slug', { slug: 'ab' }],
    ['slug', { slug: '-leading' }],
    ['title', { title: '   ' }],
    ['title', { title: 'ع'.repeat(151) }],
    ['excerpt', { excerpt: '' }],
    ['minutes', { minutes: '0' }],
    ['minutes', { minutes: '61' }],
    ['minutes', { minutes: '2.5' }],
    ['imageSrc', { imageSrc: 'https://evil.example/x.svg' }],
    ['ideaHeading', { ideaHeading: '' }],
    ['ideaParagraphs', { ideaParagraphs: '\n\n  ' }],
    ['practiceParagraphs', { practiceParagraphs: '' }],
    ['remember', { remember: '' }],
    ['remember', { remember: Array.from({ length: 9 }, (_, i) => `نقطة ${i}`).join('\n') }],
    ['sources', { sources: 'عنوان | جهة | http://insecure.example' }],
    ['sources', { sources: 'عنوان فقط' }],
    ['reviewedOn', { reviewedBy: 'د. سلمى', reviewedOn: '' }],
    ['reviewedOn', { reviewedBy: 'د. سلمى', reviewedOn: '2999-01-01' }],
  ])('rejects a bad %s', (field, change) => {
    expect(validateForm({ ...valid(), ...change }, { isNew: true, today: '2026-10-29' })).toHaveProperty(field)
  })

  it('does not check the slug when editing', () => {
    expect(validateForm({ ...valid(), slug: '' }, { isNew: false })).toEqual({})
  })

  it('accepts a review with a past date', () => {
    expect(validateForm({ ...valid(), reviewedBy: 'د. سلمى', reviewedOn: '2026-10-01' }, { isNew: true, today: '2026-10-29' })).toEqual({})
  })
})

describe('formToRow', () => {
  it('sends the slug only when creating', () => {
    expect(formToRow(valid(), { isNew: true }).slug).toBe('managing-anger')
    expect(formToRow(valid(), { isNew: false })).not.toHaveProperty('slug')
  })

  it('drops the review date when there is no reviewer', () => {
    expect(formToRow({ ...valid(), reviewedBy: '', reviewedOn: '2026-10-01' }, { isNew: false })).toMatchObject({ reviewed_by: null, reviewed_on: null })
  })

  it('round-trips through the form', () => {
    const base = formToRow({ ...valid(), sources: 'ع | ج | https://a.example/x' }, { isNew: true })
    const row = { id: 1, ...base }
    expect(formToRow(rowToForm(row), { isNew: true })).toEqual(base)
    expect(rowToForm(row).ideaParagraphs).toBe('فقرة أولى.\n\nفقرة ثانية.')
    expect(rowToForm(row).sources).toBe('ع | ج | https://a.example/x')
  })
})

describe('text helpers', () => {
  it('splits paragraphs on blank lines and collapses spaces', () => {
    expect(splitParagraphs('أ  ب\nج\n\n\n د ')).toEqual(['أ ب ج', 'د'])
  })

  it('parses sources and rejects extra separators', () => {
    expect(parseSources('ع | ج | https://a.example').sources).toHaveLength(1)
    expect(parseSources('ع | ج | https://a.example | زيادة').error).toBeTruthy()
  })
})

describe('changedFields', () => {
  it('lists only the fields that differ', () => {
    expect(changedFields({ title: 'أ', remember: ['x'], reviewed_by: null }, { title: 'أ', remember: ['x', 'y'], reviewed_by: null })).toEqual(['remember'])
  })
})
