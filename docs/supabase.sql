-- Set <OWNER_UUID> to the existing owner's Auth user ID before applying.
begin;
do $$
begin
  if to_regclass('public.content') is null and to_regclass('public.content_entries') is not null then
    alter table public.content_entries rename to content;
  end if;
end $$;
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

create table if not exists public.content (
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
  content_id uuid references public.content(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table if not exists public.content_collections (
  content_id uuid references public.content(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  primary key (content_id, collection_id)
);

create table if not exists public.academic_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  url text not null unique check (url ~* '^https?://'),
  description text not null check (char_length(trim(description)) between 1 and 500),
  type text not null default 'other' check (type in ('course','pdf','guide','framework','research','other')),
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists academic_resources_name_unique on public.academic_resources (lower(trim(name)));


-- Migration safety for existing projects
alter table public.topics add column if not exists status text not null default 'published';
alter table public.topics alter column status set default 'published';
alter table public.topics add column if not exists palette text,
  add column if not exists mood text,
  add column if not exists featured boolean default false;
alter table public.topics drop constraint if exists topics_status_check;
alter table public.topics add constraint topics_status_check check (status in ('draft','published'));

alter table public.content alter column status set default 'draft';
alter table public.academic_resources add column if not exists status text not null default 'published';

-- Existing draft records are intentionally preserved. Publishing must be an
-- explicit administrator action, never a side effect of applying a migration.

drop trigger if exists handle_topics_updated on public.topics;
create trigger handle_topics_updated before update on public.topics
for each row execute procedure extensions.moddatetime(updated_at);

drop trigger if exists handle_content_updated on public.content;
create trigger handle_content_updated before update on public.content
for each row execute procedure extensions.moddatetime(updated_at);

alter table public.content
  add column if not exists reading_minutes integer check (reading_minutes between 1 and 1440),
  add column if not exists tags text[] default '{}',
  add column if not exists collection_ids text[] default '{}',
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists og_image_url text,
  add column if not exists featured boolean default false,
  add column if not exists favorite boolean default false;

create or replace function public.is_x1_owner() returns boolean
language sql stable security invoker set search_path = ''
as $$ select coalesce(auth.uid() = '<OWNER_UUID>'::uuid,false) $$;
create or replace function public.can_publish_x1() returns boolean
language sql stable security invoker set search_path = ''
as $$ select public.is_x1_owner() and coalesce(auth.jwt()->>'aal' = 'aal2', false) $$;

-- Restrictive policies also constrain previously installed permissive policies.
do $$
declare
  target text;
  visibility text;
begin
  foreach target in array array['topics','content','content_entries','academic_resources','collections','tags','content_tags','content_collections'] loop
    if to_regclass('public.' || target) is null then continue; end if;
    visibility := case
      when target in ('content','content_entries') then
        format('status = ''published'' and (topic_id is null or exists(select 1 from public.topics t where t.id = %I.topic_id and t.status = ''published''))', target)
      when target in ('topics','academic_resources') then 'status = ''published'''
      when target in ('content_tags','content_collections') then 'exists(select 1 from public.content c where c.id = content_id)'
      when target = 'tags' then 'exists(select 1 from public.content_tags ct where ct.tag_id = tags.id)'
      else 'true' end;
    execute format('alter table public.%I enable row level security', target);
    execute format('drop policy if exists x1_visibility on public.%I', target);
    execute format('create policy x1_visibility on public.%I as restrictive for select to anon, authenticated using ((%s) or public.can_publish_x1())', target, visibility);
    execute format('drop policy if exists x1_reader on public.%I', target);
    execute format('create policy x1_reader on public.%I for select to anon, authenticated using (true)', target);
    execute format('drop policy if exists x1_owner on public.%I', target);
    execute format('create policy x1_owner on public.%I for all to authenticated using(public.can_publish_x1()) with check(public.can_publish_x1())',target);
    execute format('drop policy if exists x1_insert on public.%I', target);
    execute format('create policy x1_insert on public.%I as restrictive for insert with check(public.can_publish_x1())',target);
    execute format('drop policy if exists x1_update on public.%I', target);
    execute format('create policy x1_update on public.%I as restrictive for update using(public.can_publish_x1()) with check(public.can_publish_x1())',target);
    execute format('drop policy if exists x1_delete on public.%I', target);
    execute format('create policy x1_delete on public.%I as restrictive for delete using(public.can_publish_x1())',target);
    execute format('grant select on public.%I to anon, authenticated',target);
    execute format('grant insert, update, delete on public.%I to authenticated',target);
    execute format('revoke truncate, references, trigger on public.%I from anon, authenticated, public',target);
  end loop;
end $$;
alter table public.content drop constraint if exists x1_valid_article;
alter table public.content add constraint x1_valid_article check (
  char_length(trim(title)) > 0 and (status <> 'published' or content_type <> 'article' or char_length(trim(body)) > 0)
) not valid;
drop trigger if exists handle_academic_resources_updated on public.academic_resources;
create trigger handle_academic_resources_updated before update on public.academic_resources
for each row execute procedure extensions.moddatetime(updated_at);

-- Preserve old public asset URLs. All new editorial uploads use the private bucket.
insert into storage.buckets(id,name,public) values('content-media','content-media',true) on conflict(id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('x1-editorial','x1-editorial',false,8388608,array['image/jpeg','image/png','image/gif','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.x1_can_read_image(object_name text) returns boolean
language sql stable security invoker set search_path = ''
as $$ select public.can_publish_x1() or exists (
  select 1 from public.content c where c.status = 'published' and
  (right(c.cover_image_url, length('/storage/v1/object/x1-editorial/' || object_name)) = '/storage/v1/object/x1-editorial/' || object_name
   or strpos(c.body, '/storage/v1/object/x1-editorial/' || object_name || ')') > 0)
) $$;
drop policy if exists x1_image_read on storage.objects;
create policy x1_image_read on storage.objects for select to anon, authenticated
using (bucket_id = 'x1-editorial' and public.x1_can_read_image(name));
drop policy if exists x1_image_guard on storage.objects;
create policy x1_image_guard on storage.objects as restrictive for select to anon, authenticated
using (bucket_id <> 'x1-editorial' or public.x1_can_read_image(name));
drop policy if exists x1_storage_insert on storage.objects;
create policy x1_storage_insert on storage.objects as restrictive for insert to anon,authenticated
with check(bucket_id <> 'x1-editorial' and (bucket_id <> 'content-media' or public.can_publish_x1()));
drop policy if exists x1_storage_update on storage.objects;
create policy x1_storage_update on storage.objects as restrictive for update to anon,authenticated
using(bucket_id <> 'x1-editorial' and (bucket_id <> 'content-media' or public.can_publish_x1()))
with check(bucket_id <> 'x1-editorial' and (bucket_id <> 'content-media' or public.can_publish_x1()));
drop policy if exists x1_storage_delete on storage.objects;
create policy x1_storage_delete on storage.objects as restrictive for delete to anon,authenticated
using(bucket_id not in ('content-media','x1-editorial') or public.can_publish_x1());
drop policy if exists x1_legacy_media_owner on storage.objects;
create policy x1_legacy_media_owner on storage.objects for all to authenticated
using(bucket_id = 'content-media' and public.can_publish_x1())
with check(bucket_id = 'content-media' and public.can_publish_x1());
-- Apply when upgrading an existing academic_resources table.
alter table public.academic_resources drop constraint if exists academic_resources_type_check;
alter table public.academic_resources add constraint academic_resources_type_check check (type in ('course','pdf','guide','framework','research','other'));
alter table public.academic_resources drop constraint if exists academic_resources_url_check;
alter table public.academic_resources add constraint academic_resources_url_check check (url ~* '^https://') not valid;
commit;
