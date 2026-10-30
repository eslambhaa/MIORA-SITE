import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vitest runs from the project root (jsdom makes import.meta.url an http URL, so use the cwd).
const read = (name) => readFileSync(join(process.cwd(), 'supabase', 'templates', name), 'utf8')

describe.each(['confirm-signup.html', 'reset-password.html'])('email template %s', (name) => {
  const html = read(name)

  it('is Arabic, right-to-left, and names its subject for the Supabase dashboard', () => {
    expect(html).toMatch(/^<!doctype html>\n<!-- Supabase → Authentication → Emails → .+ Subject: .+ -->/)
    expect(html).toContain('<html lang="ar" dir="rtl">')
  })

  it('links only to the Supabase confirmation URL, as a button and as plain text', () => {
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1])
    expect(hrefs).toEqual(['{{ .ConfirmationURL }}', '{{ .ConfirmationURL }}'])
    expect(html.split('{{ .ConfirmationURL }}').length - 1).toBe(3)
  })

  it('loads nothing but the https logo, with alt text, and runs no script', () => {
    const sources = [...html.matchAll(/src="([^"]*)"/g)].map((match) => match[1])
    expect(sources).toEqual(['https://www.miora.workers.dev/logo.png'])
    expect(html).toMatch(/<img [^>]*alt="ميورا"/)
    expect(html).not.toMatch(/<script|http:\/\//i)
  })
})
