-- Private profile pictures: one small image (WebP, or JPEG on browsers without WebP
-- encoding) per user, always stored at "<user id>/avatar.webp".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 524288, array['image/webp', 'image/jpeg']);

create policy "Users read their own avatar"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.webp');

create policy "Users upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.webp');

create policy "Users replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.webp')
  with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.webp');

create policy "Users delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.webp');

-- When the picture last changed (server clock); NULL means no picture.
alter table public.profiles add column avatar_updated_at timestamptz;
grant update (avatar_updated_at) on table public.profiles to authenticated;

create function private.set_avatar_time()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.avatar_updated_at is distinct from old.avatar_updated_at then
    new.avatar_updated_at := case when new.avatar_updated_at is null then null else now() end;
  end if;
  return new;
end;
$$;
revoke all on function private.set_avatar_time() from public, anon, authenticated;

create trigger profiles_avatar_time
  before update of avatar_updated_at on public.profiles
  for each row execute function private.set_avatar_time();
