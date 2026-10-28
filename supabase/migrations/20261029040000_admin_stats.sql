-- Admin dashboard part 5: aggregated platform numbers and free-plan usage, for admins only.
-- Privacy rule (binding): this reads COUNTS only. It never returns journal text, assistant chats, assessment
-- answers or scores, or any individual's mood. A number that comes from fewer than k = 3 different people is
-- hidden (null), so a small week cannot reveal what one person did.

create function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  k constant int := 3;
  today date := (now() at time zone 'Africa/Cairo')::date;
  result jsonb;
begin
  if not exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with ev as (
    select 'mood'::text as m, created_at as ts, user_id as u from public.mood_logs
    union all select 'assessment', created_at, user_id from public.assessment_results
    union all select 'exercise', completed_at, user_id from public.exercise_sessions
    union all select 'journal', created_at, user_id from public.journal_entries
    union all select 'assistant', created_at, user_id from public.assistant_conversations
    union all select 'signup', created_at, id from auth.users
  ),
  metrics as (select unnest(array['signup', 'mood', 'assessment', 'exercise', 'journal', 'assistant']) as m),
  wk as (
    -- the last 8 weeks, each starting on the Cairo Monday
    select (date_trunc('week', today::timestamp) - make_interval(weeks => i))::date as week
    from generate_series(0, 7) as i
  ),
  weekly as (
    select metrics.m, wk.week, count(ev.u) as events, count(distinct ev.u) as people
    from metrics
    cross join wk
    left join ev
      on ev.m = metrics.m
     and (ev.ts at time zone 'Africa/Cairo')::date >= wk.week
     and (ev.ts at time zone 'Africa/Cairo')::date < wk.week + 7
    group by metrics.m, wk.week
  ),
  totals as (
    select metrics.m, count(ev.u) as events, count(distinct ev.u) as people
    from metrics left join ev on ev.m = metrics.m
    group by metrics.m
  )
  select jsonb_build_object(
    'k', k,
    'users_total', (select count(*) from auth.users),
    'weekly', (
      select jsonb_agg(jsonb_build_object(
        'metric', m, 'week', week,
        'events', case when people = 0 then 0 when people < k then null else events end
      ) order by m, week)
      from weekly
    ),
    'totals', (
      select jsonb_agg(jsonb_build_object(
        'metric', m,
        'events', case when people = 0 then 0 when people < k then null else events end
      ) order by m)
      from totals
    ),
    'plan', jsonb_build_object(
      'db_bytes', pg_database_size(current_database()),
      'storage_bytes', coalesce((select sum((metadata ->> 'size')::bigint) from storage.objects), 0),
      'tables', (
        select coalesce(jsonb_agg(jsonb_build_object('name', t.name, 'bytes', t.bytes) order by t.bytes desc), '[]'::jsonb)
        from (
          select c.relname::text as name, pg_total_relation_size(c.oid) as bytes
          from pg_class c
          join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relkind = 'r'
          order by pg_total_relation_size(c.oid) desc
          limit 8
        ) t
      ),
      'last_activity', (
        select max(t) from (
          select max(ts) as t from ev
          union all select max(last_sign_in_at) from auth.users
        ) latest
      )
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to authenticated;
