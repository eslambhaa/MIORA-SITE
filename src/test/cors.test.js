import { describe, expect, it, vi } from 'vitest'
import { corsByOrigin, corsFor, DEV_ORIGIN, parseOrigins, pickOrigin } from '../../supabase/functions/_shared/cors.ts'

const SITE = 'https://miora.example.workers.dev'

function request(origin) {
  return new Request('https://x.supabase.co/functions/v1/assistant', { method: 'POST', headers: origin ? { Origin: origin } : {} })
}

describe('parseOrigins', () => {
  it('falls back to the dev origin when the secret is missing or empty', () => {
    expect(parseOrigins(undefined)).toEqual([DEV_ORIGIN])
    expect(parseOrigins('')).toEqual([DEV_ORIGIN])
    expect(parseOrigins(' , ')).toEqual([DEV_ORIGIN])
  })

  it('keeps a single origin as before', () => {
    expect(parseOrigins(SITE)).toEqual([SITE])
  })

  it('splits a list, trims spaces and trailing slashes, and drops repeats', () => {
    expect(parseOrigins(` ${SITE}/ , http://localhost:5173,${SITE}`)).toEqual([SITE, DEV_ORIGIN])
  })
})

describe('pickOrigin', () => {
  const origins = [SITE, DEV_ORIGIN]

  it('echoes an allowed caller', () => {
    expect(pickOrigin(origins, DEV_ORIGIN)).toBe(DEV_ORIGIN)
    expect(pickOrigin(origins, SITE)).toBe(SITE)
  })

  it('answers any other caller with the first origin, never the caller', () => {
    expect(pickOrigin(origins, 'https://evil.example')).toBe(SITE)
    expect(pickOrigin(origins, `${SITE}.evil.example`)).toBe(SITE)
    expect(pickOrigin(origins, null)).toBe(SITE)
  })
})

describe('corsByOrigin', () => {
  it('builds one handler per origin and routes by the Origin header', () => {
    const make = vi.fn((cors) => (req, extra) => `${cors.headers['Access-Control-Allow-Origin']}|${extra}`)
    const handle = corsByOrigin([SITE, DEV_ORIGIN], make)

    expect(make).toHaveBeenCalledTimes(2)
    expect(handle(request(DEV_ORIGIN), 'ctx')).toBe(`${DEV_ORIGIN}|ctx`)
    expect(handle(request(SITE), 'ctx')).toBe(`${SITE}|ctx`)
    expect(handle(request('https://evil.example'), 'ctx')).toBe(`${SITE}|ctx`)
    expect(handle(request(null), 'ctx')).toBe(`${SITE}|ctx`)
  })

  it('keeps the same headers as before, with Vary: Origin', () => {
    expect(corsFor(SITE).headers).toEqual({
      'Access-Control-Allow-Origin': SITE,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    })
  })
})
