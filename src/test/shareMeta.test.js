import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vitest runs from the project root (jsdom makes import.meta.url an http URL, so use the cwd).
const root = process.cwd()
const html = readFileSync(join(root, 'index.html'), 'utf8')
const meta = (attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1]

describe('share preview tags', () => {
  it('point og:image and twitter:image at an absolute https URL of a file that exists', () => {
    for (const url of [meta('property', 'og:image'), meta('name', 'twitter:image')]) {
      expect(url).toMatch(/^https:\/\/www\.miora\.workers\.dev\/images\/og-image\.png$/)
      expect(existsSync(join(root, 'public', new URL(url).pathname))).toBe(true)
    }
  })

  it('use a large card with an Arabic alt text', () => {
    expect(meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(meta('property', 'og:image:alt')).toMatch(/ميورا/)
  })
})
