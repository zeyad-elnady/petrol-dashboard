-- =====================================================
-- SUPABASE STORAGE BUCKETS AND POLICIES SETUP
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This will create storage buckets and set up access policies

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Create well-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'well-photos',
  'well-photos',
  true,  -- Public access for reading
  10485760,  -- 10MB limit (in bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create well-voice-notes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'well-voice-notes',
  'well-voice-notes',
  true,  -- Public access for reading
  52428800,  -- 50MB limit (in bytes)
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Create hazard-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hazard-photos',
  'hazard-photos',
  true,  -- Public access for reading
  10485760,  -- 10MB limit (in bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES - WELL PHOTOS
-- =====================================================

-- Allow authenticated users to upload well photos
CREATE POLICY "Authenticated users can upload well photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'well-photos' AND
  auth.uid() IS NOT NULL
);

-- Allow public read access to well photos
CREATE POLICY "Public read access to well photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'well-photos');

-- Allow users to update their own well photos
CREATE POLICY "Users can update well photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'well-photos')
WITH CHECK (bucket_id = 'well-photos');

-- Allow users to delete well photos
CREATE POLICY "Users can delete well photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'well-photos');

-- =====================================================
-- 3. STORAGE POLICIES - WELL VOICE NOTES
-- =====================================================

-- Allow authenticated users to upload voice notes
CREATE POLICY "Authenticated users can upload voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'well-voice-notes' AND
  auth.uid() IS NOT NULL
);

-- Allow public read access to voice notes
CREATE POLICY "Public read access to voice notes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'well-voice-notes');

-- Allow users to update voice notes
CREATE POLICY "Users can update voice notes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'well-voice-notes')
WITH CHECK (bucket_id = 'well-voice-notes');

-- Allow users to delete voice notes
CREATE POLICY "Users can delete voice notes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'well-voice-notes');

-- =====================================================
-- 4. STORAGE POLICIES - HAZARD PHOTOS
-- =====================================================

-- Allow authenticated users to upload hazard photos
CREATE POLICY "Authenticated users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hazard-photos' AND
  auth.uid() IS NOT NULL
);

-- Allow public read access to hazard photos
CREATE POLICY "Public read access to hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');

-- Allow users to update their hazard photos
CREATE POLICY "Users can update hazard photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hazard-photos')
WITH CHECK (bucket_id = 'hazard-photos');

-- Allow users to delete hazard photos
CREATE POLICY "Users can delete hazard photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hazard-photos');

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY ON DATABASE TABLES
-- =====================================================
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_safety_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntary_action_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. DATABASE TABLE POLICIES
-- =====================================================

-- USERS TABLE POLICIES
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- WELLS TABLE POLICIES
CREATE POLICY "Users can view all wells"
ON wells FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create wells"
ON wells FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Wells creators can update their wells"
ON wells FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- WELL PHOTOS POLICIES
CREATE POLICY "Users can view all well photos"
ON well_photos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can upload well photos"
ON well_photos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- WELL VOICE NOTES POLICIES
CREATE POLICY "Users can view all voice notes"
ON well_voice_notes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can upload voice notes"
ON well_voice_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = recorded_by);

-- WELL SAFETY CHECKLIST POLICIES
CREATE POLICY "Users can view all checklists"
ON well_safety_checklist FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create checklist entries"
ON well_safety_checklist FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = checked_by);

CREATE POLICY "Users can update their checklist entries"
ON well_safety_checklist FOR UPDATE
TO authenticated
USING (auth.uid() = checked_by)
WITH CHECK (auth.uid() = checked_by);

-- HAZARDS TABLE POLICIES
CREATE POLICY "Users can view all hazards"
ON hazards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create hazards"
ON hazards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Hazard reporters can update their hazards"
ON hazards FOR UPDATE
TO authenticated
USING (auth.uid() = reported_by)
WITH CHECK (auth.uid() = reported_by);

-- HSE TASKS POLICIES
CREATE POLICY "Users can view their assigned tasks"
ON hse_tasks FOR SELECT
TO authenticated
USING (auth.uid() = assigned_to);

CREATE POLICY "Users can update their assigned tasks"
ON hse_tasks FOR UPDATE
TO authenticated
USING (auth.uid() = assigned_to)
WITH CHECK (auth.uid() = assigned_to);

-- DAILY REPORTS POLICIES
CREATE POLICY "Users can view all daily reports"
ON daily_reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create daily reports"
ON daily_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- VOLUNTARY ACTIONS POLICIES
CREATE POLICY "Users can view all voluntary action templates"
ON voluntary_action_templates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their voluntary actions"
ON voluntary_actions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their voluntary actions"
ON voluntary_actions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their voluntary actions"
ON voluntary_actions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. VERIFY SETUP
-- =====================================================

-- Check if buckets were created successfully
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('well-photos', 'well-voice-notes', 'hazard-photos');

-- Check storage policies
SELECT policyname, tablename, roles, cmd
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- Check table policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
