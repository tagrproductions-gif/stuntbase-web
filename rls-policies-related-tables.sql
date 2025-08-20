-- RLS Policies for related tables (skills, certifications, photos)
-- Run this in your Supabase SQL Editor after the main profiles policies

-- =============================================================================
-- PROFILE_SKILLS TABLE POLICIES
-- =============================================================================

-- Enable RLS on profile_skills
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

-- Allow users to manage skills for their own profiles
DROP POLICY IF EXISTS "Users can manage their own profile skills" ON profile_skills;
CREATE POLICY "Users can manage their own profile skills"
ON profile_skills FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_skills.profile_id 
        AND profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_skills.profile_id 
        AND profiles.user_id = auth.uid()
    )
);

-- Allow public to view skills for public profiles
DROP POLICY IF EXISTS "Public can view skills for public profiles" ON profile_skills;
CREATE POLICY "Public can view skills for public profiles"
ON profile_skills FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_skills.profile_id 
        AND profiles.is_public = true
    )
);

-- =============================================================================
-- PROFILE_CERTIFICATIONS TABLE POLICIES
-- =============================================================================

-- Enable RLS on profile_certifications
ALTER TABLE profile_certifications ENABLE ROW LEVEL SECURITY;

-- Allow users to manage certifications for their own profiles
DROP POLICY IF EXISTS "Users can manage their own profile certifications" ON profile_certifications;
CREATE POLICY "Users can manage their own profile certifications"
ON profile_certifications FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_certifications.profile_id 
        AND profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_certifications.profile_id 
        AND profiles.user_id = auth.uid()
    )
);

-- Allow public to view certifications for public profiles
DROP POLICY IF EXISTS "Public can view certifications for public profiles" ON profile_certifications;
CREATE POLICY "Public can view certifications for public profiles"
ON profile_certifications FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_certifications.profile_id 
        AND profiles.is_public = true
    )
);

-- =============================================================================
-- PROFILE_PHOTOS TABLE POLICIES
-- =============================================================================

-- Enable RLS on profile_photos
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

-- Allow users to manage photos for their own profiles
DROP POLICY IF EXISTS "Users can manage their own profile photos" ON profile_photos;
CREATE POLICY "Users can manage their own profile photos"
ON profile_photos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_photos.profile_id 
        AND profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_photos.profile_id 
        AND profiles.user_id = auth.uid()
    )
);

-- Allow public to view photos for public profiles
DROP POLICY IF EXISTS "Public can view photos for public profiles" ON profile_photos;
CREATE POLICY "Public can view photos for public profiles"
ON profile_photos FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_photos.profile_id 
        AND profiles.is_public = true
    )
);

-- =============================================================================
-- SKILLS AND CERTIFICATIONS LOOKUP TABLES
-- =============================================================================

-- Skills table - allow everyone to read (for dropdowns)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view skills" ON skills;
CREATE POLICY "Everyone can view skills"
ON skills FOR SELECT
TO public
USING (true);

-- Certifications table - allow everyone to read (for dropdowns)
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view certifications" ON certifications;
CREATE POLICY "Everyone can view certifications"
ON certifications FOR SELECT
TO public
USING (true);

-- =============================================================================
-- SEARCH_LOGS TABLE POLICIES (Optional)
-- =============================================================================

-- Enable RLS on search_logs (only authenticated users can log searches)
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert search logs (for analytics)
DROP POLICY IF EXISTS "Anyone can log searches" ON search_logs;
CREATE POLICY "Anyone can log searches"
ON search_logs FOR INSERT
TO public
WITH CHECK (true);

-- Only allow reading search logs for admin users (optional)
-- You can modify this based on your admin needs

-- =============================================================================
-- VERIFY ALL POLICIES
-- =============================================================================

-- Check all policies are in place
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename IN ('profiles', 'profile_skills', 'profile_certifications', 'profile_photos', 'skills', 'certifications', 'search_logs')
ORDER BY tablename, policyname;
