-- =====================================================
-- FIX STORAGE PERMISSIONS FOR WELL PHOTOS
-- Run this script in the Supabase SQL Editor
-- =====================================================

-- 1. Create the bucket if it doesn't exist (optional, usually exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('well-photos', 'well-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts (optional but safer)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated selects" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok22a_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok22a_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok22a_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok22a_3" ON storage.objects;

-- 3. Create POLICY for INSERT (Uploads)
-- This allows any authenticated user to upload files to the 'well-photos' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'well-photos' );

-- 4. Create POLICY for SELECT (Viewing)
-- This allows any authenticated user to view files in the 'well-photos' bucket
CREATE POLICY "Allow authenticated selects"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'well-photos' );

-- 5. Create POLICY for UPDATE (optional, if you allow overwriting)
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'well-photos' );

-- 6. Voice Notes Bucket (Duplicate logic if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('well-voice-notes', 'well-voice-notes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads voice"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'well-voice-notes' );

CREATE POLICY "Allow authenticated selects voice"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'well-voice-notes' );
