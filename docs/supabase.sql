-- Content table
create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text default '',
  body text default '',
  content_type text not null,
  universe text not null check (universe in ('professional', 'personal')),
  category text default '',
  tags text[] default '{}',
  cover_image_url text,
  video_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_name text not null default 'Arharif'
);

create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.content_entries
for each row execute procedure extensions.moddatetime(updated_at);

alter table public.content_entries enable row level security;

-- Public can read published only
create policy "public_read_published" on public.content_entries
for select
using (status = 'published');

-- Authenticated admin email allowlist (recommended: create custom role/profile table for scale)
create policy "admin_full_access" on public.content_entries
for all
using (auth.jwt() ->> 'email' in ('you@example.com'))
with check (auth.jwt() ->> 'email' in ('you@example.com'));

-- Storage bucket for media
insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', true)
on conflict (id) do nothing;

create policy "public_media_read" on storage.objects
for select
using (bucket_id = 'content-media');

create policy "admin_media_write" on storage.objects
for all
using (bucket_id = 'content-media' and auth.jwt() ->> 'email' in ('you@example.com'))
with check (bucket_id = 'content-media' and auth.jwt() ->> 'email' in ('you@example.com'));
