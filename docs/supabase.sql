-- Replace with your admin email if needed
-- Default requested admin: <ADMIN_EMAIL>

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
  status text not null default 'published' check (status in ('draft','published')),
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
  status text not null default 'published' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_name text not null default 'X1'
);


create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text default '',
  universe text not null check (universe in ('professional','personal')),
  category text default '',
  cover_image_url text,
  featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_tags (
  content_id uuid references public.content_entries(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table if not exists public.content_collections (
  content_id uuid references public.content_entries(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  primary key (content_id, collection_id)
);


-- Migration safety for existing projects
alter table public.topics add column if not exists status text not null default 'published';
alter table public.topics alter column status set default 'published';
alter table public.topics drop constraint if exists topics_status_check;
alter table public.topics add constraint topics_status_check check (status in ('draft','published'));

alter table public.content_entries alter column status set default 'published';

update public.topics set status = 'published' where status = 'draft' or status is null;
update public.content_entries set status = 'published', published_at = coalesce(published_at, now()) where status = 'draft';

drop trigger if exists handle_topics_updated on public.topics;
create trigger handle_topics_updated before update on public.topics
for each row execute procedure extensions.moddatetime(updated_at);

drop trigger if exists handle_content_updated on public.content_entries;
create trigger handle_content_updated before update on public.content_entries
for each row execute procedure extensions.moddatetime(updated_at);

alter table public.topics enable row level security;
alter table public.content_entries enable row level security;
alter table public.collections enable row level security;

drop policy if exists "public_read_topics" on public.topics;
create policy "public_read_topics" on public.topics for select using (true);

drop policy if exists "public_read_published_content" on public.content_entries;
create policy "public_read_published_content" on public.content_entries for select using (status = 'published');

drop policy if exists "public_read_collections" on public.collections;
create policy "public_read_collections" on public.collections for select using (true);

drop policy if exists "admin_manage_topics" on public.topics;
create policy "admin_manage_topics" on public.topics
for all
using (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')
with check (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>');

drop policy if exists "admin_manage_content" on public.content_entries;
create policy "admin_manage_content" on public.content_entries
for all
using (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')
with check (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>');

drop policy if exists "admin_manage_collections" on public.collections;
create policy "admin_manage_collections" on public.collections
for all
using (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')
with check (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>');

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
  and (auth.jwt() ->> 'email') = '<ADMIN_EMAIL>'
);

-- Only admin email can update
create policy "admin email can update content-media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = '<ADMIN_EMAIL>'
)
with check (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = '<ADMIN_EMAIL>'
);

-- Only admin email can delete
create policy "admin email can delete content-media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'content-media'
  and (auth.jwt() ->> 'email') = '<ADMIN_EMAIL>'
);
