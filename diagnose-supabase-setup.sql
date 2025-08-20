-- COMPREHENSIVE SUPABASE SETUP DIAGNOSTIC
-- Run this in your Supabase SQL Editor to check what's set up

-- =============================================================================
-- 1. CHECK EXISTING TABLES
-- =============================================================================

SELECT 'EXISTING TABLES:' as section;

SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- 2. CHECK PROFILES TABLE STRUCTURE
-- =============================================================================

SELECT 'PROFILES TABLE COLUMNS:' as section;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- =============================================================================
-- 3. CHECK PROFILE_SKILLS TABLE
-- =============================================================================

SELECT 'PROFILE_SKILLS TABLE:' as section;

-- Check if table exists
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_skills')
  THEN 'Table EXISTS'
  ELSE 'Table MISSING'
END as profile_skills_status;

-- Check structure if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profile_skills' 
ORDER BY ordinal_position;

-- =============================================================================
-- 4. CHECK PROFILE_CERTIFICATIONS TABLE
-- =============================================================================

SELECT 'PROFILE_CERTIFICATIONS TABLE:' as section;

-- Check if table exists
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_certifications')
  THEN 'Table EXISTS'
  ELSE 'Table MISSING'
END as profile_certifications_status;

-- Check structure if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profile_certifications' 
ORDER BY ordinal_position;

-- =============================================================================
-- 5. CHECK PROFILE_PHOTOS TABLE
-- =============================================================================

SELECT 'PROFILE_PHOTOS TABLE:' as section;

-- Check if table exists
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_photos')
  THEN 'Table EXISTS'
  ELSE 'Table MISSING'
END as profile_photos_status;

-- Check structure if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profile_photos' 
ORDER BY ordinal_position;

-- =============================================================================
-- 6. CHECK VECTOR EXTENSION
-- =============================================================================

SELECT 'VECTOR EXTENSION:' as section;

SELECT extname, extversion
FROM pg_extension 
WHERE extname = 'vector';

-- If no results, vector extension is not installed

-- =============================================================================
-- 7. CHECK VECTOR FUNCTIONS
-- =============================================================================

SELECT 'VECTOR FUNCTIONS:' as section;

SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%embedding%'
ORDER BY routine_name;

-- =============================================================================
-- 8. CHECK DATA COUNTS
-- =============================================================================

SELECT 'DATA COUNTS:' as section;

SELECT 
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE is_public = true) as public_profiles,
  (SELECT COUNT(*) FROM profile_photos) as total_photos,
  (SELECT COUNT(*) FROM profile_skills) as total_skills,
  (SELECT COUNT(*) FROM profile_certifications) as total_certifications;

-- =============================================================================
-- 9. CHECK SPECIFIC PROFILE DATA
-- =============================================================================

SELECT 'YOUR PROFILE DATA:' as section;

SELECT 
  id,
  full_name,
  location,
  height_feet,
  height_inches,
  gender,
  is_public,
  bio IS NOT NULL as has_bio
FROM profiles 
WHERE full_name LIKE '%Cihangir%'
LIMIT 1;

-- =============================================================================
-- 10. CHECK SKILLS FOR YOUR PROFILE
-- =============================================================================

SELECT 'YOUR SKILLS:' as section;

SELECT 
  ps.skill_id,
  ps.proficiency_level,
  ps.years_experience
FROM profile_skills ps
JOIN profiles p ON ps.profile_id = p.id
WHERE p.full_name LIKE '%Cihangir%';

-- =============================================================================
-- 11. CHECK RLS POLICIES
-- =============================================================================

SELECT 'RLS POLICIES:' as section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'profile_skills', 'profile_certifications', 'profile_photos')
ORDER BY tablename, policyname;

-- =============================================================================
-- SUMMARY
-- =============================================================================

SELECT 'SETUP SUMMARY:' as section;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    THEN '✅ Profiles table exists'
    ELSE '❌ Profiles table missing'
  END as profiles_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_skills')
    THEN '✅ Skills table exists'
    ELSE '❌ Skills table missing'
  END as skills_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_photos')
    THEN '✅ Photos table exists'
    ELSE '❌ Photos table missing'
  END as photos_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
    THEN '✅ Vector extension installed'
    ELSE '❌ Vector extension missing'
  END as vector_check;
