// MIORA admin-media-tools: helpers for the admin dashboard's episodes section. Admins only.
//   { action: 'lookup', url }  -> fills an episode form from a YouTube link, an Apple Podcasts link or a podcast RSS address.
//   { action: 'check', ids? }  -> checks that each episode's video, audio and page still work, and stores the result
//                                 in resource_checks (written here with the service role; admins can only read it).
// The caller must be a signed-in admin (checked against admin_users with the caller's own token).
// Nothing personal is read or stored. Secrets: ALLOWED_ORIGIN optional, one origin or a comma-separated list, default "http://localhost:5173".
import { withSupabase } from 'npm:@supabase/server@1.9.2'
import { corsByOrigin, parseOrigins } from '../_shared/cors.ts'
import { checkRow, lookupLink, ToolError, type Deps, type RowToCheck } from './tools.ts'

const origins = parseOrigins(Deno.env.get('ALLOWED_ORIGIN'))

const reply = (status: number, body: Record<string, unknown>) => Response.json(body, { status })

const deps: Deps = {
  resolve: async (host) => {
    const [v4, v6] = await Promise.all([Deno.resolveDns(host, 'A').catch(() => []), Deno.resolveDns(host, 'AAAA').catch(() => [])])
    return [...v4, ...v6]
  },
}

const MAX_ROWS = 60

async function inPool<T, R>(items: T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++
        results[index] = await work(items[index])
      }
    }),
  )
  return results
}

export default {
  fetch: corsByOrigin(origins, (cors) => withSupabase({ auth: 'user', cors }, async (req, ctx) => {
    if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' })
    const userId = ctx.userClaims?.id
    if (!userId) return reply(401, { error: 'unauthorized' })

    const { data: adminRow, error: adminError } = await ctx.supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle()
    if (adminError) return reply(500, { error: 'server_error' })
    if (!adminRow) return reply(403, { error: 'forbidden' })

    let body: { action?: string; url?: unknown; ids?: unknown }
    try {
      body = await req.json()
    } catch {
      return reply(400, { error: 'invalid_body' })
    }

    if (body.action === 'lookup') {
      if (typeof body.url !== 'string') return reply(400, { error: 'invalid_url' })
      try {
        return reply(200, { ...(await lookupLink(body.url, deps)) })
      } catch (error) {
        if (error instanceof ToolError) return reply(422, { error: error.code })
        console.error('admin-media-tools lookup failed', (error as Error)?.name ?? '')
        return reply(502, { error: 'fetch_failed' })
      }
    }

    if (body.action === 'check') {
      const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is number => Number.isInteger(id)).slice(0, MAX_ROWS) : null
      let query = ctx.supabaseAdmin.from('resources').select('id, kind, url, embed_url, audio_url').order('id').limit(MAX_ROWS)
      if (ids) query = query.in('id', ids)
      const { data: rows, error } = await query
      if (error) return reply(500, { error: 'server_error' })

      const results = await inPool((rows ?? []) as RowToCheck[], 3, async (row) => {
        let result
        try {
          result = await checkRow(row, deps)
        } catch {
          result = { status: 'unknown' as const, detail: ['check_error'] }
        }
        const detail = result.detail.join(',').slice(0, 200)
        await ctx.supabaseAdmin.from('resource_checks').upsert({ resource_id: row.id, status: result.status, detail, checked_at: new Date().toISOString() })
        return { id: row.id, status: result.status, detail }
      })
      return reply(200, { results })
    }

    return reply(400, { error: 'unknown_action' })
  })),
}
