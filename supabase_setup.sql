-- ============================================================
-- SkyDrive — Supabase Setup
-- Run this ONCE in the Supabase SQL Editor for a fresh project.
-- It is safe to re-run: every statement uses IF NOT EXISTS or
-- DROP … IF EXISTS guards.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Tables
-- ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text unique not null,
  name        text,
  avatar_url  text,
  updated_at  timestamptz default now()
);

create table if not exists public.files (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  file_name     text not null,
  file_path     text not null,
  file_size     bigint not null,
  mime_type     text not null,
  upload_date   timestamptz default now(),
  is_shared     boolean default false,
  share_url     text,
  is_trashed    boolean default false,
  trashed_date  timestamptz,
  thumbnail_url text
);

-- ──────────────────────────────────────────────────────────────
-- 2. Row-Level Security
-- ──────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.files    enable row level security;

-- ── Profiles ─────────────────────────────────────────────────
-- SELECT own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- UPDATE own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id);

-- INSERT own profile (needed by the trigger / edge-cases)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

-- ── Files ────────────────────────────────────────────────────
-- SELECT own files
drop policy if exists "Users can view own files" on public.files;
create policy "Users can view own files" on public.files
  for select to authenticated
  using (auth.uid() = user_id);

-- INSERT own files
drop policy if exists "Users can insert own files" on public.files;
create policy "Users can insert own files" on public.files
  for insert to authenticated
  with check (auth.uid() = user_id);

-- UPDATE own files
drop policy if exists "Users can update own files" on public.files;
create policy "Users can update own files" on public.files
  for update to authenticated
  using (auth.uid() = user_id);

-- DELETE own files
drop policy if exists "Users can delete own files" on public.files;
create policy "Users can delete own files" on public.files
  for delete to authenticated
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 3. Auto-create profile on sign-up (trigger)
-- ──────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop and re-create so the definition is always up-to-date.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 4. Performance indexes
-- ──────────────────────────────────────────────────────────────

create index if not exists files_user_id_idx      on public.files (user_id);
create index if not exists files_is_trashed_idx   on public.files (is_trashed);
create index if not exists files_upload_date_idx  on public.files (upload_date desc);
create index if not exists files_is_shared_idx    on public.files (is_shared)
  where is_shared = true;

-- ──────────────────────────────────────────────────────────────
-- 5. Storage bucket + policies
-- ──────────────────────────────────────────────────────────────

-- Create a PRIVATE bucket called "files".
-- insert … on conflict ensures re-runnability.
insert into storage.buckets (id, name, public)
values ('files', 'files', false)
on conflict (id) do nothing;

-- Owner can INSERT objects into their own folder (userId/…)
drop policy if exists "Owner can upload" on storage.objects;
create policy "Owner can upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can SELECT (read / download) their own objects
drop policy if exists "Owner can read own objects" on storage.objects;
create policy "Owner can read own objects" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can UPDATE their own objects
drop policy if exists "Owner can update own objects" on storage.objects;
create policy "Owner can update own objects" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can DELETE their own objects
drop policy if exists "Owner can delete own objects" on storage.objects;
create policy "Owner can delete own objects" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
