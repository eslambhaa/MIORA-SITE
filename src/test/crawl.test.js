import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vitest runs from the project root (jsdom makes import.meta.url an http URL, so use the cwd).
const read = (name) => readFileSync(join(process.cwd(), 'public', name), 'utf8')
const robots = read('robots.txt')
const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

describe('robots.txt and sitemap.xml', () => {
  it('lets crawlers in, keeps private pages out, and names the sitemap', () => {
    expect(robots).toMatch(/^User-agent: \*$/m)
    for (const path of ['/admin', '/profile', '/journal', '/notifications']) expect(robots).toContain(`Disallow: ${path}\n`)
    expect(robots).toMatch(/^Sitemap: https:\/\/www\.miora\.workers\.dev\/sitemap\.xml$/m)
  })

  it('lists only public https pages on the live address, without private ones', () => {
    expect(sitemapUrls.length).toBeGreaterThan(5)
    for (const url of sitemapUrls) {
      expect(url).toMatch(/^https:\/\/www\.miora\.workers\.dev\//)
      expect(url).not.toMatch(/\/(admin|profile|journal|notifications)\b/)
    }
    expect(sitemapUrls).toContain('https://www.miora.workers.dev/addiction')
  })
})
