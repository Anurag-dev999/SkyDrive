-- ============================================================
-- SkyDrive — Public Share Policies
-- Run this in the Supabase SQL Editor AFTER supabase_setup.sql.
-- It is safe to re-run (uses DROP … IF EXISTS).
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Let anonymous users read metadata of shared, non-trashed files
-- ──────────────────────────────────────────────────────────────

drop policy if exists "Anon can read shared file metadata" on public.files;
create policy "Anon can read shared file metadata" on public.files
  for select to anon
  using (is_shared = true and is_trashed = false);

-- ──────────────────────────────────────────────────────────────
-- 2. Let anonymous users download storage objects for shared files
--    This is what makes the /share/[id] page work without auth.
-- ──────────────────────────────────────────────────────────────

drop policy if exists "Anon can download shared storage objects" on storage.objects;
create policy "Anon can download shared storage objects" on storage.objects
  for select to anon
  using (
    bucket_id = 'files'
    and exists (
      select 1
      from public.files f
      where f.file_path = storage.objects.name
        and f.is_shared  = true
        and f.is_trashed = false
    )
  );
