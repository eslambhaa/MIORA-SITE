import { describe, expect, it } from 'vitest'
import { changedFields, emptyForm, formToRow, rowToForm, validateForm } from './adminEmergency'
import { fallbackLines, groupByCountry, isDialable } from './emergency'

const valid = () => ({ ...emptyForm(10), title: 'الإسعاف', number: '123', note: 'وصف' })

describe('validateForm', () => {
  it('accepts a complete line', () => {
    expect(validateForm(valid())).toEqual({})
  })

  // Each case breaks exactly one rule and satisfies the others.
  it.each([
    ['title', { title: ' ' }],
    ['title', { title: 'ع'.repeat(101) }],
    ['country', { country: '' }],
    ['number', { number: '12' }],
    ['number', { number: '1234567890123456' }],
    ['number', { number: 'abc' }],
    ['number', { number: '123;rm' }],
    ['number', { number: 'tel:123' }],
    ['number', { number: '١٢٣' }],
    ['note', { note: 'ع'.repeat(201) }],
    ['sortOrder', { sortOrder: 'x' }],
  ])('rejects a bad %s', (field, change) => {
    expect(validateForm({ ...valid(), ...change })).toHaveProperty(field)
  })

  it('drops spaces and dashes typed inside a number, and keeps a leading +', () => {
    expect(formToRow({ ...valid(), number: '+20 100-123 4567' }).number).toBe('+201001234567')
    expect(validateForm({ ...valid(), number: '+20 100-123 4567' })).toEqual({})
  })
})

describe('rows and forms', () => {
  it('round-trips', () => {
    const row = { id: 1, ...formToRow({ ...valid(), published: 'false' }), updated_at: 'x' }
    expect(formToRow(rowToForm(row))).toEqual(formToRow({ ...valid(), published: 'false' }))
  })

  it('lists only the changed fields', () => {
    expect(changedFields({ title: 'أ', number: '123' }, { title: 'أ', number: '124' })).toEqual(['number'])
  })
})

describe('public helpers', () => {
  it('only lets dialable numbers become tel: links', () => {
    expect(isDialable('16328')).toBe(true)
    expect(isDialable('+201001234567')).toBe(true)
    expect(isDialable('javascript:alert(1)')).toBe(false)
  })

  it('keeps the three saved numbers as the fallback', () => {
    expect(fallbackLines.map((line) => line.number)).toEqual(['123', '16328', '105'])
  })

  it('groups by country keeping order', () => {
    const groups = groupByCountry([{ country: 'مصر', id: 1 }, { country: 'السعودية', id: 2 }, { country: 'مصر', id: 3 }])
    expect(groups.map((group) => [group.country, group.lines.length])).toEqual([['مصر', 2], ['السعودية', 1]])
  })
})
