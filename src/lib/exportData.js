import { supabase } from './supabase.js'

const PAGE_SIZE = 1000

// Reads every row the signed-in user can see (RLS limits it to their own rows).
async function fetchAll(table, columns) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

// Builds a JSON file with all of the user's own data and downloads it in the browser.
// Nothing is sent anywhere: the file is created locally from the user's own rows.
export async function downloadMyData(user) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, age_confirmed_at, terms_accepted_at, assistant_consent_at')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) throw profileError

  const [moods, assessments, exercises, notes, conversations, messages] = await Promise.all([
    fetchAll('mood_logs', 'mood, logged_on, created_at, updated_at'),
    fetchAll('assessment_results', 'topic, answers, score, created_at'),
    fetchAll('exercise_sessions', 'exercise, duration_seconds, completed_at'),
    fetchAll('journal_entries', 'title, body, created_at, updated_at'),
    fetchAll('assistant_conversations', 'id, title, created_at, updated_at'),
    fetchAll('assistant_messages', 'conversation_id, role, content, created_at'),
  ])

  const payload = {
    app: 'MIORA',
    exported_at: new Date().toISOString(),
    account: { email: user.email, created_at: user.created_at, ...profile },
    mood_logs: moods,
    assessment_results: assessments,
    exercise_sessions: exercises,
    journal_entries: notes,
    assistant_conversations: conversations.map((conversation) => ({
      ...conversation,
      messages: messages.filter((message) => message.conversation_id === conversation.id),
    })),
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `miora-my-data-${payload.exported_at.slice(0, 10)}.json`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
