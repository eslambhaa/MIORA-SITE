import { describe, expect, it } from 'vitest'
import { candidateToForm, changedFields, checkLabel, emptyForm, formToRow, rowToForm, validateForm } from './adminMedia'

const podcast = () => ({
  ...emptyForm('podcast', 10),
  title: 'فنجان: كيف تفهم نفسك',
  source: 'فنجان',
  description: 'حلقة عن فهم الذات.',
  url: 'https://podcasts.apple.com/sa/podcast/x/id985515827?i=1',
  embedUrl: 'https://embed.podcasts.apple.com/sa/podcast/x/id985515827?i=1',
})
const video = () => ({
  ...emptyForm('video', 10),
  title: 'فيديو',
  source: 'قناة',
  description: 'وصف.',
  url: 'https://www.youtube.com/watch?v=hdTdev3GVCw',
  embedUrl: 'https://www.youtube-nocookie.com/embed/hdTdev3GVCw',
})

describe('validateForm', () => {
  it('accepts a complete podcast and video', () => {
    expect(validateForm(podcast())).toEqual({})
    expect(validateForm(video())).toEqual({})
  })

  // Each case breaks exactly one rule and satisfies the others.
  it.each([
    ['title', podcast, { title: ' ' }],
    ['title', podcast, { title: 'ع'.repeat(121) }],
    ['source', podcast, { source: '' }],
    ['description', podcast, { description: 'ع'.repeat(301) }],
    ['details', podcast, { details: 'ع'.repeat(2001) }],
    ['url', podcast, { url: 'http://insecure.example/x' }],
    ['url', podcast, { url: 'https://has space.example' }],
    ['embedUrl', video, { embedUrl: 'https://evil.example/embed/x' }],
    ['embedUrl', video, { embedUrl: 'https://embed.podcasts.apple.com/x' }],
    ['embedUrl', podcast, { embedUrl: 'https://www.youtube-nocookie.com/embed/hdTdev3GVCw' }],
    ['embedUrl', video, { embedUrl: '' }],
    ['embedUrl', podcast, { embedUrl: '', audioUrl: '' }],
    ['audioUrl', podcast, { audioUrl: 'http://x.example/a.mp3' }],
    ['topic', podcast, { topic: 'موضوع غريب' }],
    ['sortOrder', podcast, { sortOrder: '1.5' }],
  ])('rejects a bad %s', (field, make, change) => {
    expect(validateForm({ ...make(), ...change })).toHaveProperty(field)
  })

  it('lets a podcast play from an audio file alone (RSS episode)', () => {
    expect(validateForm({ ...podcast(), embedUrl: '', audioUrl: 'https://cdn.example/a.mp3' })).toEqual({})
  })
})

describe('formToRow', () => {
  it('sends the kind only when creating, and new rows can be hidden', () => {
    expect(formToRow(podcast(), { isNew: true })).toMatchObject({ kind: 'podcast', published: false })
    expect(formToRow(podcast(), { isNew: false })).not.toHaveProperty('kind')
  })

  it('turns empty optional fields into null', () => {
    expect(formToRow(podcast(), { isNew: true })).toMatchObject({ details: null, audio_url: null, topic: null })
  })

  it('round-trips through the form', () => {
    const base = formToRow({ ...podcast(), topic: 'العلاقات', details: 'فقرة', published: 'true' }, { isNew: true })
    expect(formToRow(rowToForm({ id: 1, ...base }), { isNew: true })).toEqual(base)
  })
})

describe('candidateToForm', () => {
  const lookup = { kind: 'podcast', source: 'بصائر' }

  it('fills the audio file only when there is no player address', () => {
    const rss = candidateToForm(emptyForm(), lookup, { title: 't', description: 'd', details: 'x', url: 'https://a.example/e', embedUrl: null, audioUrl: 'https://a.example/e.mp3' })
    expect(rss.audioUrl).toBe('https://a.example/e.mp3')
    const apple = candidateToForm(emptyForm(), lookup, { title: 't', description: 'd', details: 'x', url: 'https://podcasts.apple.com/x', embedUrl: 'https://embed.podcasts.apple.com/x', audioUrl: 'https://a.example/e.mp3' })
    expect(apple.audioUrl).toBe('')
    expect(apple.source).toBe('بصائر')
  })

  it('keeps the sort order and visibility the admin already has', () => {
    const current = { ...emptyForm('podcast', 70), published: 'true' }
    const next = candidateToForm(current, lookup, { title: 't', description: 'd', details: '', url: 'https://a.example', embedUrl: null, audioUrl: null })
    expect(next).toMatchObject({ sortOrder: '70', published: 'true' })
  })
})

describe('changedFields and labels', () => {
  it('lists only changed fields', () => {
    expect(changedFields({ title: 'أ', topic: null }, { title: 'ب', topic: null })).toEqual(['title'])
  })

  it('explains check codes in Arabic', () => {
    expect(checkLabel('video_removed')).toMatch(/حُذف/)
    expect(checkLabel('audio_http_404')).toContain('404')
    expect(checkLabel('')).toBe('')
  })
})
