-- Admin dashboard part 6: announcements that can be scheduled, editable reminder texts, and the hourly job reading them.
-- Privacy rule (binding): nothing here touches journal text, assistant chats, assessment results or mood logs.
-- The weekly summary still counts only the person's own mood days; the team writes the wording, never reads the data.

-- 1. Announcements: a start time ("scheduled") besides the existing end time, and admin write access.
alter table public.announcements
  add column starts_at timestamptz not null default now();
update public.announcements set starts_at = created_at;
alter table public.announcements
  add constraint announcements_window check (expires_at is null or expires_at > starts_at);

drop policy "announcements_select_live" on public.announcements;

create policy "announcements_select_live" on public.announcements
  for select to anon
  using (published and starts_at <= now() and (expires_at is null or expires_at > now()));

create policy "announcements_select_live_or_admin" on public.announcements
  for select to authenticated
  using (
    (published and starts_at <= now() and (expires_at is null or expires_at > now()))
    or exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

grant insert (title, body, link, published, starts_at, expires_at) on table public.announcements to authenticated;
grant update (title, body, link, published, starts_at, expires_at) on table public.announcements to authenticated;
grant delete on table public.announcements to authenticated;

create policy "announcements_insert_admin" on public.announcements
  for insert to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "announcements_update_admin" on public.announcements
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- Only hidden announcements can be deleted; hide one first.
create policy "announcements_delete_admin_hidden" on public.announcements
  for delete to authenticated
  using (not published and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- 2. Reminder wording. Three fixed rows (no inserts or deletes); the job reads them with its own rights.
--    The weekly "some days" text must contain {days}, replaced by the person's own count.
create table public.notification_templates (
  kind text primary key check (kind in ('daily_reminder', 'weekly_none', 'weekly_some')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null check (char_length(btrim(body)) between 1 and 380),
  updated_at timestamptz not null default now(),
  constraint weekly_some_has_days check (kind <> 'weekly_some' or body like '%{days}%')
);

create trigger notification_templates_set_updated_at
  before update on public.notification_templates
  for each row execute function private.set_updated_at();

alter table public.notification_templates enable row level security;
revoke all on table public.notification_templates from anon, authenticated;
grant select on table public.notification_templates to authenticated;
grant update (title, body) on table public.notification_templates to authenticated;

create policy "notification_templates_select_admin" on public.notification_templates
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "notification_templates_update_admin" on public.notification_templates
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

insert into public.notification_templates (kind, title, body) values
  ('daily_reminder', 'كيف حالك اليوم؟', 'خذ دقيقة وسجّل شعورك. لا يلزم أكثر من ذلك.'),
  ('weekly_none', 'ملخصك الأسبوعي', 'لم تسجّل شعورك هذا الأسبوع. لا بأس، يمكنك أن تبدأ اليوم بخطوة صغيرة.'),
  ('weekly_some', 'ملخصك الأسبوعي', 'سجّلت شعورك في {days} من 7 أيام هذا الأسبوع. شكرًا لاهتمامك بنفسك.');

-- 3. The hourly job now reads the wording from the table (falling back to the original text) and takes an optional
--    "now" so it can be tested at any time. The cron entry `select private.run_notifications()` keeps working.
drop function private.run_notifications();

create function private.run_notifications(p_now timestamptz default now())
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cairo_now timestamp := p_now at time zone 'Africa/Cairo';
  today date := (p_now at time zone 'Africa/Cairo')::date;
  this_hour int := extract(hour from p_now at time zone 'Africa/Cairo');
  daily_title text := coalesce((select title from public.notification_templates where kind = 'daily_reminder'), 'كيف حالك اليوم؟');
  daily_body text := coalesce((select body from public.notification_templates where kind = 'daily_reminder'), 'خذ دقيقة وسجّل شعورك. لا يلزم أكثر من ذلك.');
  none_title text := coalesce((select title from public.notification_templates where kind = 'weekly_none'), 'ملخصك الأسبوعي');
  none_body text := coalesce((select body from public.notification_templates where kind = 'weekly_none'), 'لم تسجّل شعورك هذا الأسبوع. لا بأس، يمكنك أن تبدأ اليوم بخطوة صغيرة.');
  some_title text := coalesce((select title from public.notification_templates where kind = 'weekly_some'), 'ملخصك الأسبوعي');
  some_body text := coalesce((select body from public.notification_templates where kind = 'weekly_some'), 'سجّلت شعورك في {days} من 7 أيام هذا الأسبوع. شكرًا لاهتمامك بنفسك.');
begin
  -- Daily reminder at the hour each person chose (default 8 pm), only if they have not logged a mood today.
  insert into public.notifications (user_id, kind, title, body, link, in_app, email_pending)
  select u.id, 'daily_reminder', daily_title, daily_body, '/',
         coalesce(s.inapp_daily, true), coalesce(s.email_daily, false)
  from auth.users u
  left join public.notification_settings s on s.user_id = u.id
  where u.email_confirmed_at is not null
    and coalesce(s.reminder_hour, 20) = this_hour
    and (coalesce(s.inapp_daily, true) or coalesce(s.email_daily, false))
    and not exists (select 1 from public.mood_logs m where m.user_id = u.id and m.logged_on = today)
    and not exists (
      select 1 from public.notifications n
      where n.user_id = u.id and n.kind = 'daily_reminder'
        and (n.created_at at time zone 'Africa/Cairo')::date = today);

  -- Weekly summary on Friday at 6 pm: how many of the last 7 days the person logged a mood (only that count).
  if extract(isodow from cairo_now) = 5 and this_hour = 18 then
    insert into public.notifications (user_id, kind, title, body, link, in_app, email_pending)
    select u.id, 'weekly_summary',
           case when c.days = 0 then none_title else some_title end,
           case when c.days = 0 then none_body else replace(some_body, '{days}', c.days::text) end,
           '/profile',
           coalesce(s.inapp_weekly, true), coalesce(s.email_weekly, false)
    from auth.users u
    left join public.notification_settings s on s.user_id = u.id
    cross join lateral (
      select count(distinct m.logged_on)::int as days
      from public.mood_logs m
      where m.user_id = u.id and m.logged_on > today - 7 and m.logged_on <= today
    ) c
    where u.email_confirmed_at is not null
      and (coalesce(s.inapp_weekly, true) or coalesce(s.email_weekly, false))
      and not exists (
        select 1 from public.notifications n
        where n.user_id = u.id and n.kind = 'weekly_summary' and n.created_at > p_now - interval '6 days');
  end if;

  -- Keep the table small on the free plan: notifications older than 90 days go.
  delete from public.notifications where created_at < p_now - interval '90 days';
end;
$$;
revoke all on function private.run_notifications(timestamptz) from public, anon, authenticated;
