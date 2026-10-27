-- Consent to send messages to the external AI provider (Google Gemini).
alter table public.profiles add column assistant_consent_at timestamptz;
grant update (assistant_consent_at) on table public.profiles to authenticated;

-- Conversation history. Users can read and delete their own messages only.
-- Messages are written only by the "assistant" Edge Function (service role),
-- so a user cannot forge assistant replies.
create table public.assistant_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index assistant_messages_user_created_idx on public.assistant_messages (user_id, created_at desc);

alter table public.assistant_messages enable row level security;

revoke all on table public.assistant_messages from anon, authenticated;
grant select, delete on table public.assistant_messages to authenticated;

create policy "assistant_messages_select_own" on public.assistant_messages
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "assistant_messages_delete_own" on public.assistant_messages
  for delete to authenticated
  using ((select auth.uid()) = user_id);
