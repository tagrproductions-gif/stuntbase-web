-- ADD RESUME SUPPORT MIGRATION
-- This adds resume upload functionality to profiles
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- STEP 1: ADD RESUME COLUMN TO PROFILES TABLE
-- =============================================================================

-- Add resume_url column to store the URL/path to the uploaded resume
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Add resume_filename column to store the original filename
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_filename TEXT;

-- Add resume_file_size column to track file size (for compression decisions)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_file_size INTEGER;

-- Add resume_uploaded_at timestamp
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- STEP 2: CREATE RESUME STORAGE BUCKET (if not exists)
-- =============================================================================

-- This creates a storage bucket specifically for resumes
-- You may need to run this in the Supabase Storage section instead
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;
*/

-- =============================================================================
-- STEP 3: ADD RLS POLICIES FOR RESUME STORAGE
-- =============================================================================

-- Policy: Allow authenticated users to upload resumes to their own folder
-- This should be added in Supabase Storage Policies section:
/*
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow public access to view resumes (since profiles can be public)
CREATE POLICY "Anyone can view resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

-- Policy: Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
*/

-- =============================================================================
-- STEP 4: VERIFY CHANGES
-- =============================================================================

-- Show updated column structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE '%resume%'
ORDER BY ordinal_position;

-- Show current profiles count
SELECT COUNT(*) as total_profiles FROM profiles;
