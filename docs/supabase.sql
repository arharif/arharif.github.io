-- Replace with your admin email if needed
-- Default requested admin: x731072000@gmail.com

create extension if not exists pgcrypto;
create extension if not exists moddatetime schema extensions;

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text default '',
  universe text not null check (universe in ('professional','personal')),
  category text not null,
  subcategory text,
  display_style text not null default 'book' check (display_style in ('book','slides','article')),
  cover_image_url text,
  icon text,
  order_index int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  slug text unique not null,
  title text not null,
  excerpt text default '',
  body text default '',
  content_type text not null,
  cover_image_url text,
  video_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_name text not null default 'Arharif'
);

drop trigger if exists handle_topics_updated on public.topics;
create trigger handle_topics_updated before update on public.topics
for each row execute procedure extensions.moddatetime(updated_at);

drop trigger if exists handle_content_updated on public.content_entries;
create trigger handle_content_updated before update on public.content_entries
for each row execute procedure extensions.moddatetime(updated_at);

alter table public.topics enable row level security;
alter table public.content_entries enable row level security;

drop policy if exists "public_read_topics" on public.topics;
create policy "public_read_topics" on public.topics for select using (true);

drop policy if exists "public_read_published_content" on public.content_entries;
create policy "public_read_published_content" on public.content_entries for select using (status = 'published');

drop policy if exists "admin_manage_topics" on public.topics;
create policy "admin_manage_topics" on public.topics
for all
using (auth.jwt() ->> 'email' = 'x731072000@gmail.com')
with check (auth.jwt() ->> 'email' = 'x731072000@gmail.com');

drop policy if exists "admin_manage_content" on public.content_entries;
create policy "admin_manage_content" on public.content_entries
for all
using (auth.jwt() ->> 'email' = 'x731072000@gmail.com')
with check (auth.jwt() ->> 'email' = 'x731072000@gmail.com');

insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', true)
on conflict (id) do nothing;

-- Optional cleanup from earlier versions
 drop policy if exists "authenticated can view content-media objects" on storage.objects;
 drop policy if exists "admin email can upload to content-media" on storage.objects;
 drop policy if exists "admin email can update content-media" on storage.objects;
 drop policy if exists "admin email can delete content-media" on storage.objects;
 drop policy if exists "public can view content-media objects" on storage.objects;
 drop policy if exists "public_media_read" on storage.objects;
 drop policy if exists "admin_media_write" on storage.objects;

-- Public read of object metadata for this bucket
create policy "public can view content-media objects"
on storage.objects
for select
to public
using (
  bucket_id = 'content-media'
);

-- Only admin email can upload
create policy "admin email can upload to content-media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = 'x731072000@gmail.com'
);

-- Only admin email can update
create policy "admin email can update content-media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = 'x731072000@gmail.com'
)
with check (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = 'x731072000@gmail.com'
);

-- Only admin email can delete
create policy "admin email can delete content-media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = 'x731072000@gmail.com'
);
