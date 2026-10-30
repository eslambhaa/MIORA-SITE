// CORS shared by the three functions. The ALLOWED_ORIGIN secret holds one origin or a
// comma-separated list, e.g. "https://miora.example.workers.dev,http://localhost:5173",
// so the live site and local development both work. No Deno APIs here (tested with Vitest).

export const DEV_ORIGIN = 'http://localhost:5173'

export type Cors = { headers: Record<string, string> }

export function parseOrigins(value: string | undefined | null): string[] {
  const list = (value ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
  return list.length ? [...new Set(list)] : [DEV_ORIGIN]
}

// A response may name only one origin: the caller's when it is on the list,
// otherwise the first one, which the browser then refuses.
export function pickOrigin(origins: string[], requestOrigin: string | null): string {
  return requestOrigin && origins.includes(requestOrigin) ? requestOrigin : origins[0]
}

export function corsFor(origin: string): Cors {
  return {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    },
  }
}

// Builds one handler per allowed origin up front and picks it by the request's Origin header.
export function corsByOrigin<A extends unknown[], R>(
  origins: string[],
  make: (cors: Cors) => (req: Request, ...rest: A) => R,
): (req: Request, ...rest: A) => R {
  const handlers = new Map(origins.map((origin) => [origin, make(corsFor(origin))]))
  return (req, ...rest) => handlers.get(pickOrigin(origins, req.headers.get('Origin')))!(req, ...rest)
}
