-- Notifications: site-wide announcements (visible to everyone), per-person notifications
-- (daily mood reminder, weekly summary), and each person's own settings.
-- A cron job creates the personal ones; nobody (including the team) reads mood or journal content for this:
-- the weekly summary only counts the person's own mood days, and only that person can read the result.

-- 1. Announcements: public, read-only from the browser. The admin dashboard (phase 17) will write them.
create table public.announcements (
  id bigint generated always as identity primary key,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null check (char_length(btrim(body)) between 1 and 400),
  link text check (link is null or link ~ '^/[A-Za-z0-9/_?=&%.-]*$'),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.announcements enable row level security;
revoke all on table public.announcements from anon, authenticated;
grant select on table public.announcements to anon, authenticated;

create policy "announcements_select_live" on public.announcements
  for select to anon, authenticated
  using (published and (expires_at is null or expires_at > now()));

insert into public.announcements (title, body, link) values
  ('جديد في المحتوى التوعوي', 'أضفنا فيديوهات وبودكاست عربي إلى المحتوى التوعوي، وكلها تُشغَّل داخل ميورا.', '/content?type=podcasts');

-- 2. Settings: one row per person; no row means the defaults (in-app on, email off).
create table public.notification_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  inapp_daily boolean not null default true,
  inapp_weekly boolean not null default true,
  email_daily boolean not null default false,
  email_weekly boolean not null default false,
  reminder_hour smallint not null default 20 check (reminder_hour between 0 and 23),
  email_consent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.notification_settings enable row level security;
revoke all on table public.notification_settings from anon, authenticated;
grant select on table public.notification_settings to authenticated;
grant insert (inapp_daily, inapp_weekly, email_daily, email_weekly, reminder_hour) on table public.notification_settings to authenticated;
grant update (inapp_daily, inapp_weekly, email_daily, email_weekly, reminder_hour) on table public.notification_settings to authenticated;

create policy "notification_settings_select_own" on public.notification_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "notification_settings_insert_own" on public.notification_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "notification_settings_update_own" on public.notification_settings
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The email consent time always comes from the server clock.
create function private.notification_settings_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.email_daily or new.email_weekly then
    if tg_op = 'INSERT' or not (old.email_daily or old.email_weekly) then
      new.email_consent_at := now();
    else
      new.email_consent_at := old.email_consent_at;
    end if;
  else
    new.email_consent_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.notification_settings_stamp() from public, anon, authenticated;

create trigger notification_settings_stamp
  before insert or update on public.notification_settings
  for each row execute function private.notification_settings_stamp();

-- 3. Personal notifications: created only by the server job below; a person can read, mark as read and delete theirs.
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('daily_reminder', 'weekly_summary', 'system')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 400),
  link text check (link is null or link ~ '^/[A-Za-z0-9/_?=&%.-]*$'),
  in_app boolean not null default true,
  email_pending boolean not null default false,
  emailed_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_email_pending_idx on public.notifications (created_at) where email_pending;

alter table public.notifications enable row level security;
revoke all on table public.notifications from anon, authenticated;
grant select, delete on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

create policy "notifications_select_own" on public.notifications
  for select to authenticated using ((select auth.uid()) = user_id and in_app);
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using ((select auth.uid()) = user_id and in_app) with check ((select auth.uid()) = user_id and in_app);
create policy "notifications_delete_own" on public.notifications
  for delete to authenticated using ((select auth.uid()) = user_id and in_app);

-- 4. The hourly job. Times are Cairo time.
create function private.run_notifications()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cairo_now timestamp := now() at time zone 'Africa/Cairo';
  today date := (now() at time zone 'Africa/Cairo')::date;
  this_hour int := extract(hour from now() at time zone 'Africa/Cairo');
begin
  -- Daily reminder at the hour each person chose (default 8 pm), only if they have not logged a mood today.
  insert into public.notifications (user_id, kind, title, body, link, in_app, email_pending)
  select u.id, 'daily_reminder', 'كيف حالك اليوم؟', 'خذ دقيقة وسجّل شعورك. لا يلزم أكثر من ذلك.', '/',
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
    select u.id, 'weekly_summary', 'ملخصك الأسبوعي',
           case when c.days = 0
                then 'لم تسجّل شعورك هذا الأسبوع. لا بأس، يمكنك أن تبدأ اليوم بخطوة صغيرة.'
                else 'سجّلت شعورك في ' || c.days || ' من 7 أيام هذا الأسبوع. شكرًا لاهتمامك بنفسك.' end,
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
        where n.user_id = u.id and n.kind = 'weekly_summary' and n.created_at > now() - interval '6 days');
  end if;

  -- Keep the table small on the free plan: notifications older than 90 days go.
  delete from public.notifications where created_at < now() - interval '90 days';
end;
$$;
revoke all on function private.run_notifications() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('miora-notifications', '0 * * * *', 'select private.run_notifications()');
