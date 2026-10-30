import { describe, expect, it } from 'vitest'
import { appleEmbed, appleIds, channelInfo, firstParagraph, isPrivateIp, isPublicHostname, metaDescription, plain, readItems, secure, shorten, youtubeId } from '../../supabase/functions/admin-media-tools/parse.ts'

describe('youtubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=hdTdev3GVCw', 'hdTdev3GVCw'],
    ['https://youtu.be/hdTdev3GVCw?t=5', 'hdTdev3GVCw'],
    ['https://www.youtube-nocookie.com/embed/hdTdev3GVCw', 'hdTdev3GVCw'],
    ['https://m.youtube.com/shorts/hdTdev3GVCw', 'hdTdev3GVCw'],
  ])('reads %s', (link, id) => expect(youtubeId(link)).toBe(id))

  it.each(['http://www.youtube.com/watch?v=hdTdev3GVCw', 'https://evil.example/watch?v=hdTdev3GVCw', 'https://www.youtube.com/watch?v=short', 'https://www.youtube.com/channel/x', 'not a link'])('rejects %s', (link) => {
    expect(youtubeId(link)).toBeNull()
  })
})

describe('SSRF guards', () => {
  it.each(['10.0.0.1', '127.0.0.1', '169.254.169.254', '172.16.5.5', '172.31.0.1', '192.168.1.1', '100.64.0.1', '::1', '::', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1'])('treats %s as private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true)
  })

  it.each(['8.8.8.8', '172.32.0.1', '151.101.1.1', '2606:4700::1111'])('treats %s as public', (ip) => {
    expect(isPrivateIp(ip)).toBe(false)
  })

  it.each(['localhost', 'printer.local', 'db.internal', 'metadata', '127.0.0.1', '169.254.169.254', '[::1]', 'example.com.'])('refuses host %s', (host) => {
    expect(isPublicHostname(host)).toBe(false)
  })

  it('accepts ordinary public names', () => {
    expect(isPublicHostname('feeds.soundcloud.com')).toBe(true)
    expect(isPublicHostname('itunes.apple.com')).toBe(true)
  })
})

describe('Apple links', () => {
  it('reads show, episode and store', () => {
    expect(appleIds('https://podcasts.apple.com/sa/podcast/x/id985515827?i=1000693880174')).toEqual({ show: '985515827', episode: '1000693880174', country: 'sa' })
    expect(appleIds('https://podcasts.apple.com/us/podcast/x/id1465335294').episode).toBeNull()
  })

  it('builds the embed address', () => {
    expect(appleEmbed('https://podcasts.apple.com/sa/podcast/x/id1?i=2')).toBe('https://embed.podcasts.apple.com/sa/podcast/x/id1?i=2')
  })
})

describe('feeds and text', () => {
  const xml = `<rss><channel><title>بودكاست تجريبي</title><link>https://show.example/</link>
    <item><title><![CDATA[الحلقة الأولى]]></title><link>https://show.example/1</link><pubDate>Tue, 22 Nov 2022 13:28:22 +0000</pubDate>
      <description><![CDATA[<p>فقرة &amp; نص</p><p>زر https://x.example/promo اضغط</p>]]></description>
      <enclosure url="http://cdn.example/a.mp3?x=1&amp;y=2" type="audio/mpeg"/></item>
    <item><title>بلا صوت</title></item></channel></rss>`

  it('reads the channel and only items with audio, upgrading http to https', () => {
    expect(channelInfo(xml)).toEqual({ title: 'بودكاست تجريبي', link: 'https://show.example/' })
    const items = readItems(xml)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ title: 'الحلقة الأولى', link: 'https://show.example/1', audio: 'https://cdn.example/a.mp3?x=1&y=2' })
    expect(items[0].description).toBe('فقرة & نص\nزر اضغط')
  })

  it('strips links without eating the Arabic glued to them', () => {
    expect(plain('اشترك https://thmanyah.link/subscription-finjanزاد الحديث')).toBe('اشترك زاد الحديث')
  })

  it('shortens at a word and keeps the first paragraph', () => {
    expect(shorten('كلمة '.repeat(100), 50).endsWith('…')).toBe(true)
    expect(shorten('قصير', 50)).toBe('قصير')
    expect(firstParagraph('أ  ب\nج\n\nد')).toBe('أ ب ج')
  })

  it('reads the page description meta tag', () => {
    expect(metaDescription('<meta name="description" content="وصف &amp; أول">')).toBe('وصف & أول')
    expect(metaDescription('<html></html>')).toBe('')
  })

  it('upgrades only http', () => {
    expect(secure('http://a.example')).toBe('https://a.example')
    expect(secure('https://a.example')).toBe('https://a.example')
  })
})

describe('invisible direction marks', () => {
  it('plain and metaDescription drop every bidi mark and the BOM, and keep the text', () => {
    const marks = '‎‏‪‫‬‭‮⁦⁧⁨⁩﻿'
    expect(plain(`${marks}حلقة ${marks}جديدة`)).toBe('حلقة جديدة')
    expect(metaDescription(`<meta name="description" content="${marks}وصف">`)).toBe('وصف')
  })
})
