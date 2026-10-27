create table public.mood_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mood text not null check (mood in ('happy', 'calm', 'hopeful', 'tense', 'anxious', 'sad', 'exhausted', 'unsure')),
  logged_on date not null default ((now() at time zone 'Africa/Cairo')::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mood_logs_one_per_day unique (user_id, logged_on)
);

alter table public.mood_logs enable row level security;

revoke all on table public.mood_logs from anon, authenticated;
grant select, delete on table public.mood_logs to authenticated;
grant insert (mood) on table public.mood_logs to authenticated;
grant update (mood) on table public.mood_logs to authenticated;

create policy "mood_logs_select_own" on public.mood_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "mood_logs_insert_own" on public.mood_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "mood_logs_update_own" on public.mood_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "mood_logs_delete_own" on public.mood_logs
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger mood_logs_set_updated_at
  before update on public.mood_logs
  for each row execute function private.set_updated_at();
