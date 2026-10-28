import { describe, expect, it } from 'vitest'
import { safeRedirect } from './safeRedirect'

describe('safeRedirect', () => {
  it('keeps internal paths', () => {
    expect(safeRedirect('/journal')).toBe('/journal')
    expect(safeRedirect('/content?type=videos')).toBe('/content?type=videos')
  })

  it.each(['//evil.example', 'https://evil.example', '/\\evil.example', 'javascript:alert(1)', '', null, undefined, 42])(
    'falls back for %s',
    (target) => {
      expect(safeRedirect(target)).toBe('/profile')
    },
  )

  it('uses a custom fallback', () => {
    expect(safeRedirect('//x', '/login')).toBe('/login')
  })
})
