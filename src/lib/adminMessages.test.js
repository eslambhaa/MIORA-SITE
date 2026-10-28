import { describe, expect, it } from 'vitest'
import { replyLink } from './adminMessages'

describe('replyLink', () => {
  it('builds a mailto link with an encoded Arabic subject', () => {
    const link = replyLink({ email: 'sara@example.com', subject: 'سؤال عن المنصة' })
    expect(link.startsWith('mailto:sara@example.com?subject=')).toBe(true)
    expect(decodeURIComponent(link.split('subject=')[1])).toBe('رد: سؤال عن المنصة')
  })

  // The database accepts anything shaped like x@y.z, so a crafted address must never reach a mailto: link.
  it.each(['a@b.co?cc=evil@x.com', 'a@b.co&bcc=x@y.zz', 'a b@c.com', 'a@b.co,other@c.com', 'a@b.co#frag', '<a@b.co>', 'ا@b.co'])('does not link %s', (email) => {
    expect(replyLink({ email, subject: 'س' })).toBeNull()
  })

  it('cannot inject extra mail headers through the subject', () => {
    const link = replyLink({ email: 'a@b.co', subject: 'x&cc=evil@x.com\r\nBcc: y@z.co' })
    expect(link).not.toMatch(/[&]cc=/)
    expect(link).not.toMatch(/[\r\n]/)
  })
})
