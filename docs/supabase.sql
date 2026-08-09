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

create table if not exists public.academic_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  url text not null unique check (url ~* '^https?://'),
  description text not null check (char_length(trim(description)) between 1 and 500),
  type text not null default 'other' check (type in ('course','pdf','guide','framework','research','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists academic_resources_name_unique on public.academic_resources (lower(trim(name)));


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
alter table public.academic_resources enable row level security;

drop policy if exists "public_read_topics" on public.topics;
create policy "public_read_topics" on public.topics for select using (true);

drop policy if exists "public_read_published_content" on public.content_entries;
create policy "public_read_published_content" on public.content_entries for select using (status = 'published');

drop policy if exists "public_read_collections" on public.collections;
create policy "public_read_collections" on public.collections for select using (true);

drop policy if exists "public_read_academic_resources" on public.academic_resources;
create policy "public_read_academic_resources" on public.academic_resources for select using (true);

drop policy if exists "admin_manage_academic_resources" on public.academic_resources;
create policy "admin_manage_academic_resources" on public.academic_resources for all
using (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>')
with check (auth.jwt() ->> 'email' = '<ADMIN_EMAIL>');

drop trigger if exists handle_academic_resources_updated on public.academic_resources;
create trigger handle_academic_resources_updated before update on public.academic_resources
for each row execute procedure extensions.moddatetime(updated_at);

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

-- Apply when upgrading an existing academic_resources table.
alter table public.academic_resources drop constraint if exists academic_resources_type_check;
alter table public.academic_resources add constraint academic_resources_type_check check (type in ('course','pdf','guide','framework','research','other'));
alter table public.academic_resources drop constraint if exists academic_resources_url_check;
alter table public.academic_resources add constraint academic_resources_url_check check (url ~* '^https://');
