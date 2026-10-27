-- Separate conversations so users can return to and continue earlier chats.
create table public.assistant_conversations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assistant_conversations_user_updated_idx on public.assistant_conversations (user_id, updated_at desc);

alter table public.assistant_conversations enable row level security;

revoke all on table public.assistant_conversations from anon, authenticated;
-- Created only by the "assistant" Edge Function. Users can list, rename and delete their own.
grant select, delete on table public.assistant_conversations to authenticated;
grant update (title) on table public.assistant_conversations to authenticated;

create policy "assistant_conversations_select_own" on public.assistant_conversations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "assistant_conversations_update_own" on public.assistant_conversations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "assistant_conversations_delete_own" on public.assistant_conversations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Attach messages to a conversation; move existing messages into one conversation per user.
alter table public.assistant_messages
  add column conversation_id bigint references public.assistant_conversations (id) on delete cascade;

insert into public.assistant_conversations (user_id, title, created_at, updated_at)
select user_id, 'محادثة سابقة', min(created_at), max(created_at)
from public.assistant_messages
group by user_id;

update public.assistant_messages m
set conversation_id = c.id
from public.assistant_conversations c
where c.user_id = m.user_id and m.conversation_id is null;

alter table public.assistant_messages alter column conversation_id set not null;

create index assistant_messages_conversation_created_idx on public.assistant_messages (conversation_id, created_at, id);
