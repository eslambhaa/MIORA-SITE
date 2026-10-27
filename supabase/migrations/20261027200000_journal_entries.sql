create table public.journal_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null default '' check (char_length(body) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function private.set_updated_at();

alter table public.journal_entries enable row level security;

revoke all on table public.journal_entries from anon, authenticated;
grant select, delete on table public.journal_entries to authenticated;
grant insert (title, body) on table public.journal_entries to authenticated;
grant update (title, body) on table public.journal_entries to authenticated;

create policy "journal_entries_select_own" on public.journal_entries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "journal_entries_insert_own" on public.journal_entries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "journal_entries_update_own" on public.journal_entries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "journal_entries_delete_own" on public.journal_entries
  for delete to authenticated
  using ((select auth.uid()) = user_id);
