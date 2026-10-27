// MIORA delete-account: a signed-in user permanently deletes their OWN account.
// The user id comes from the verified JWT, never from the request body.
// Every user table (profiles, mood_logs, assessment_results, exercise_sessions,
// journal_entries, assistant_conversations, assistant_messages) references
// auth.users with ON DELETE CASCADE, so deleting the auth user removes all of it.
// The profile picture in Storage (avatars/<id>/avatar.webp) is removed explicitly.
// Secrets: ALLOWED_ORIGIN optional, default "http://localhost:5173".
import { withSupabase } from 'npm:@supabase/server@1.9.2'

const CONFIRMATION = 'DELETE_MY_ACCOUNT'

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:5173'
const cors = {
  headers: {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  },
}

function reply(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status })
}

export default {
  fetch: withSupabase({ auth: 'user', cors }, async (req, ctx) => {
    if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' })
    const userId = ctx.userClaims?.id
    if (!userId) return reply(401, { error: 'unauthorized' })

    let confirmed = false
    try {
      const body = await req.json()
      confirmed = body?.confirm === CONFIRMATION
    } catch {
      return reply(400, { error: 'invalid_body' })
    }
    if (!confirmed) return reply(400, { error: 'confirmation_required' })

    // Storage files are not covered by the cascade: remove the profile picture first.
    const { error: storageError } = await ctx.supabaseAdmin.storage.from('avatars').remove([`${userId}/avatar.webp`])
    if (storageError) {
      console.error('delete-account avatar removal failed', storageError.name ?? '')
      return reply(500, { error: 'server_error' })
    }

    // shouldSoftDelete = false: a real delete, so cascades remove all user rows.
    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId, false)
    if (error) {
      // Log only the error class, never any user data.
      console.error('delete-account failed', error.status ?? '', error.code ?? '')
      return reply(500, { error: 'server_error' })
    }
    return reply(200, { deleted: true })
  }),
}
