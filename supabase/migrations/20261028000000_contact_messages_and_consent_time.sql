-- Assistant consent time always comes from the server clock, never from the client.
create function private.set_assistant_consent_time()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.assistant_consent_at is distinct from old.assistant_consent_at then
    new.assistant_consent_at := case when new.assistant_consent_at is null then null else now() end;
  end if;
  return new;
end;
$$;
revoke all on function private.set_assistant_consent_time() from public, anon, authenticated;

create trigger profiles_assistant_consent_time
  before update of assistant_consent_at on public.profiles
  for each row execute function private.set_assistant_consent_time();

-- Contact form. Anyone may send; nobody can read through the API (team reads in the dashboard).
create table public.contact_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  email text not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  subject text not null check (char_length(btrim(subject)) between 1 and 150),
  message text not null check (char_length(btrim(message)) between 1 and 3000)
);
create index contact_messages_created_idx on public.contact_messages (created_at);
create index contact_messages_user_idx on public.contact_messages (user_id);

alter table public.contact_messages enable row level security;
revoke all on table public.contact_messages from anon, authenticated;
grant insert (name, email, subject, message) on table public.contact_messages to anon, authenticated;

create policy "Anyone can send a contact message as themselves"
  on public.contact_messages for insert to anon, authenticated
  with check (user_id is not distinct from (select auth.uid()));

-- Flood protection: 30 messages per 10 minutes site-wide, 3 per hour per email.
create function private.limit_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.contact_messages
      where created_at > now() - interval '10 minutes') >= 30
     or (select count(*) from public.contact_messages
      where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'contact_rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_contact_messages() from public, anon, authenticated;

create trigger contact_messages_limit
  before insert on public.contact_messages
  for each row execute function private.limit_contact_messages();
