import { describe, expect, it } from 'vitest'
import { headerClass } from './Header.jsx'

describe('header top panel', () => {
  it('is white and only as wide as the bar, not the whole page', () => {
    expect(headerClass).toContain('before:bg-(--color-page-surface)')
    expect(headerClass).toContain('before:w-[calc(100%-2rem)]')
    expect(headerClass).toContain('lg:before:w-[90%]')
    expect(headerClass).toContain('before:max-w-[1600px]')
    expect(headerClass).not.toContain('before:inset-x-0')
  })

  it('reaches from the top edge to behind the middle of the bar, on the sticky desktop header only', () => {
    expect(headerClass).toContain('before:top-0')
    expect(headerClass).toContain('before:h-14')
    expect(headerClass).toContain('before:hidden')
    expect(headerClass).toContain('md:before:block')
    expect(headerClass).toContain('md:sticky')
  })
})
