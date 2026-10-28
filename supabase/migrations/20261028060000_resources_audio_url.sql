-- Optional direct audio file for a podcast row. When empty, the site looks the audio up
-- through Apple's public lookup when a visitor presses play.
alter table public.resources add column audio_url text check (audio_url is null or (audio_url ~ '^https://[^\s]+$' and char_length(audio_url) <= 800));
