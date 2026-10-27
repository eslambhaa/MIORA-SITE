create table public.assessment_results (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic text not null check (topic in ('mood', 'stress', 'sleep', 'habits')),
  answers smallint[] not null check (array_length(answers, 1) = 3 and answers <@ array[0, 1, 2, 3]::smallint[]),
  score smallint generated always as (answers[1] + answers[2] + answers[3]) stored,
  created_at timestamptz not null default now()
);

create index assessment_results_user_created_idx on public.assessment_results (user_id, created_at desc);

alter table public.assessment_results enable row level security;

revoke all on table public.assessment_results from anon, authenticated;
grant select, delete on table public.assessment_results to authenticated;
grant insert (topic, answers) on table public.assessment_results to authenticated;

create policy "assessment_results_select_own" on public.assessment_results
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "assessment_results_insert_own" on public.assessment_results
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "assessment_results_delete_own" on public.assessment_results
  for delete to authenticated
  using ((select auth.uid()) = user_id);
