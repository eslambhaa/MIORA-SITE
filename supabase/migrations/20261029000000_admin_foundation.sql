-- Admin foundation (phase 17, part 1): who is an admin, an audit log of admin actions,
-- and two functions to list and change admins. Later parts write content (articles, episodes...)
-- with RLS policies that check public.admin_users.
-- Privacy rule (binding): the admin area never reads journal text, assistant chats, assessment results
-- or individual mood logs. Nothing in this migration touches those tables.

-- 1. Admins. A person sees only their own row (that is how the site knows to show the dashboard).
--    Nobody writes this table from the browser; changes go through public.admin_set below.
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

create policy "admin_users_select_own" on public.admin_users
  for select to authenticated using ((select auth.uid()) = user_id);

-- The first admin is added by hand after this migration (the owner's email is kept out of the repository):
--   insert into public.admin_users (user_id)
--   select id from auth.users where lower(email) = '<owner email>' on conflict do nothing;

-- 2. Audit log: who changed what and when. Admins read and append only; nobody edits or deletes rows.
--    Keep "details" to ids and field names, never personal text.
create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid default auth.uid() references auth.users (id) on delete set null,
  action text not null check (char_length(action) between 1 and 60),
  entity text not null check (char_length(entity) between 1 and 60),
  entity_id text check (entity_id is null or char_length(entity_id) <= 100),
  details jsonb not null default '{}'::jsonb check (pg_column_size(details) <= 2000),
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;
revoke all on table public.admin_audit_log from anon, authenticated;
grant select on table public.admin_audit_log to authenticated;
grant insert (action, entity, entity_id, details) on table public.admin_audit_log to authenticated;

create policy "admin_audit_log_select_admin" on public.admin_audit_log
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "admin_audit_log_insert_admin" on public.admin_audit_log
  for insert to authenticated
  with check (
    admin_id = (select auth.uid())
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

-- 3. List the admins with their emails (emails live in auth.users, which the browser cannot read).
create function public.admin_list()
returns table (user_id uuid, email text, added_at timestamptz, is_me boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select a.user_id, u.email::text, a.created_at, a.user_id = (select auth.uid())
    from public.admin_users a
    join auth.users u on u.id = a.user_id
    order by a.created_at;
end;
$$;

-- 4. Add or remove an admin by the email of an existing account. The last admin cannot be removed.
create function public.admin_set(target_email text, make_admin boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  target uuid;
begin
  if not exists (select 1 from public.admin_users a where a.user_id = caller) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select u.id into target from auth.users u where lower(u.email) = lower(btrim(target_email));
  if target is null then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  if make_admin then
    insert into public.admin_users (user_id, added_by) values (target, caller) on conflict do nothing;
    insert into public.admin_audit_log (admin_id, action, entity, entity_id)
      values (caller, 'admin.add', 'admin', target::text);
  else
    if (select count(*) from public.admin_users) <= 1 then
      raise exception 'last_admin' using errcode = 'P0001';
    end if;
    delete from public.admin_users where user_id = target;
    insert into public.admin_audit_log (admin_id, action, entity, entity_id)
      values (caller, 'admin.remove', 'admin', target::text);
  end if;
end;
$$;

revoke all on function public.admin_list() from public, anon, authenticated;
revoke all on function public.admin_set(text, boolean) from public, anon, authenticated;
grant execute on function public.admin_list() to authenticated;
grant execute on function public.admin_set(text, boolean) to authenticated;
