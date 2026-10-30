import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { articleImages } from '../data/articles.js'

// Vitest runs from the project root (jsdom makes import.meta.url an http URL, so use the cwd).
const root = process.cwd()

describe.each(Object.entries(articleImages))('article image %s', (key, image) => {
  it('matches the database rule for image_src and points at its own file', () => {
    expect(image.src).toMatch(/^\/images\/articles\/[a-z0-9-]+\.svg$/)
    expect(image.src).toBe(`/images/articles/${key}.svg`)
  })

  it('exists as a 1200x800 SVG with Arabic alt text', () => {
    const file = join(root, 'public', image.src)
    expect(existsSync(file)).toBe(true)
    expect(readFileSync(file, 'utf8')).toMatch(/^<svg [^>]*viewBox="0 0 1200 800"/)
    expect(image.alt).toMatch(/[؀-ۿ]/)
  })
})
