create table public.exercise_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercise text not null check (exercise in ('breathing', 'grounding', 'mindful', 'body')),
  duration_seconds smallint not null check (duration_seconds between 1 and 1800),
  completed_at timestamptz not null default now()
);

create index exercise_sessions_user_completed_idx on public.exercise_sessions (user_id, completed_at desc);

alter table public.exercise_sessions enable row level security;

revoke all on table public.exercise_sessions from anon, authenticated;
grant select, delete on table public.exercise_sessions to authenticated;
grant insert (exercise, duration_seconds) on table public.exercise_sessions to authenticated;

create policy "exercise_sessions_select_own" on public.exercise_sessions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "exercise_sessions_insert_own" on public.exercise_sessions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "exercise_sessions_delete_own" on public.exercise_sessions
  for delete to authenticated
  using ((select auth.uid()) = user_id);
