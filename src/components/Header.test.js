import { describe, expect, it } from 'vitest'
import { headerClass } from './Header.jsx'

describe('header top strip', () => {
  it('is see-through at the top of the page, so the page background shows above the bar', () => {
    expect(headerClass(false)).toContain('md:before:opacity-0')
    expect(headerClass(false)).not.toContain('md:before:opacity-100')
  })

  it('covers the 20px above the bar once the page scrolls, so text never shows there', () => {
    expect(headerClass(true)).toContain('md:before:opacity-100')
    expect(headerClass(true)).toContain('before:bg-(--color-page-bg)')
  })

  it('keeps the sticky header and respects reduced motion in both states', () => {
    for (const scrolled of [false, true]) {
      expect(headerClass(scrolled)).toContain('md:sticky')
      expect(headerClass(scrolled)).toContain('motion-reduce:before:transition-none')
    }
  })
})
