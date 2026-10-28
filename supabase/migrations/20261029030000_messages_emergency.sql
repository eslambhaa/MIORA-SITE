-- Admin dashboard part 4: contact messages (read, mark as answered, delete) and the emergency numbers on the help page.
-- Privacy rule (binding): nothing here touches journal text, assistant chats, assessment results or mood logs.
-- Contact messages are what visitors chose to send to the team, so the team reads them; the account id stays hidden.

-- 1. Contact messages: a status the team sets, and who/when (stamped by the database, not the browser).
alter table public.contact_messages
  add column status text not null default 'new' check (status in ('new', 'replied')),
  add column handled_at timestamptz,
  add column handled_by uuid references auth.users (id) on delete set null;

create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

create function private.stamp_contact_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.handled_at := case when new.status = 'replied' then now() else null end;
    new.handled_by := case when new.status = 'replied' then auth.uid() else null end;
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_contact_status() from public, anon, authenticated;

create trigger contact_messages_stamp_status
  before update of status on public.contact_messages
  for each row execute function private.stamp_contact_status();

-- Admins read the message columns (not user_id) and change only the status; they can delete.
grant select (id, created_at, name, email, subject, message, status, handled_at) on table public.contact_messages to authenticated;
grant update (status) on table public.contact_messages to authenticated;
grant delete on table public.contact_messages to authenticated;

create policy "contact_messages_select_admin" on public.contact_messages
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "contact_messages_update_admin" on public.contact_messages
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "contact_messages_delete_admin" on public.contact_messages
  for delete to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- 2. Emergency numbers shown on the help page. The page keeps its own copy of these three numbers
--    and shows it if this table cannot be read, so the card is never empty.
create table public.emergency_contacts (
  id bigint generated always as identity primary key,
  country text not null default 'مصر' check (char_length(btrim(country)) between 1 and 40),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  number text not null check (number ~ '^\+?[0-9]{3,15}$'),
  note text not null default '' check (char_length(note) <= 200),
  sort_order integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger emergency_contacts_set_updated_at
  before update on public.emergency_contacts
  for each row execute function private.set_updated_at();

alter table public.emergency_contacts enable row level security;
revoke all on table public.emergency_contacts from anon, authenticated;
grant select on table public.emergency_contacts to anon, authenticated;
grant insert (country, title, number, note, sort_order, published) on table public.emergency_contacts to authenticated;
grant update (country, title, number, note, sort_order, published) on table public.emergency_contacts to authenticated;
grant delete on table public.emergency_contacts to authenticated;

create policy "emergency_contacts_select_public" on public.emergency_contacts
  for select to anon using (published);

create policy "emergency_contacts_select_published_or_admin" on public.emergency_contacts
  for select to authenticated
  using (published or exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "emergency_contacts_insert_admin" on public.emergency_contacts
  for insert to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create policy "emergency_contacts_update_admin" on public.emergency_contacts
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- Only hidden numbers can be deleted; hide a number first.
create policy "emergency_contacts_delete_admin_hidden" on public.emergency_contacts
  for delete to authenticated
  using (not published and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

insert into public.emergency_contacts (country, title, number, note, sort_order) values
  ('مصر', 'الإسعاف', '123', 'إذا كنت أنت أو غيرك في خطر الآن.', 10),
  ('مصر', 'الخط الساخن للدعم النفسي', '16328', 'من وزارة الصحة، على مدار الساعة.', 20),
  ('مصر', 'الخط الساخن الموحد لوزارة الصحة', '105', 'استفسارات صحية وتوجيه للخدمات.', 30);
