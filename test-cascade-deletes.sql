-- =====================================================
-- TEST CASCADE DELETE FUNCTIONALITY
-- This tests that your constraints work properly
-- =====================================================

-- Step 1: Create a test profile (you can skip this if you have existing profiles)
/*
INSERT INTO profiles (user_id, full_name, email, is_public)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with a real user_id or create test user
    'Test Profile for Cascade',
    'test@example.com',
    false
);
*/

-- Step 2: Check what profiles exist
SELECT 'EXISTING PROFILES:' as info;
SELECT id, full_name, email, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Pick a profile and see its related data
-- Replace 'your-profile-id' with an actual profile ID from above
SELECT 'RELATED DATA FOR A PROFILE:' as info;

-- Count photos
SELECT 
    'Photos' as data_type,
    COUNT(*) as count
FROM profile_photos 
WHERE profile_id = 'your-profile-id-here'; -- Replace this

-- Count skills  
SELECT 
    'Skills' as data_type,
    COUNT(*) as count
FROM profile_skills 
WHERE profile_id = 'your-profile-id-here'; -- Replace this

-- Count certifications
SELECT 
    'Certifications' as data_type,
    COUNT(*) as count
FROM profile_certifications 
WHERE profile_id = 'your-profile-id-here'; -- Replace this

-- Count views
SELECT 
    'Views' as data_type,
    COUNT(*) as count
FROM profile_views 
WHERE profile_id = 'your-profile-id-here'; -- Replace this

-- Step 4: Test the cascade (ONLY IF YOU'RE SURE!)
-- Uncomment and replace the profile ID to test deletion
/*
DELETE FROM profiles WHERE id = 'your-test-profile-id-here';
*/

-- Step 5: Verify cascade worked
-- Check that all related data was automatically deleted
/*
SELECT 'AFTER CASCADE DELETE:' as info;

SELECT COUNT(*) as remaining_photos FROM profile_photos WHERE profile_id = 'your-test-profile-id-here';
SELECT COUNT(*) as remaining_skills FROM profile_skills WHERE profile_id = 'your-test-profile-id-here';  
SELECT COUNT(*) as remaining_certs FROM profile_certifications WHERE profile_id = 'your-test-profile-id-here';
SELECT COUNT(*) as remaining_views FROM profile_views WHERE profile_id = 'your-test-profile-id-here';
*/

-- All counts above should be 0 if cascade delete worked!
