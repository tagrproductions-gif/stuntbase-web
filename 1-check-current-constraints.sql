-- =====================================================
-- 1. CHECK CURRENT DATABASE CONSTRAINTS AND RELATIONSHIPS
-- Run this first to see what we're working with
-- =====================================================

-- Check all current foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Check current table structure for our key tables
SELECT 'PROFILES TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'PROFILE_PHOTOS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profile_photos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'PROFILE_SKILLS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profile_skills' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'PROFILE_CERTIFICATIONS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profile_certifications' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any orphaned data currently in the system
SELECT 'ORPHANED PROFILE_PHOTOS (no matching profile):' as info;
SELECT COUNT(*) as orphaned_photos_count
FROM profile_photos pp
LEFT JOIN profiles p ON pp.profile_id = p.id
WHERE p.id IS NULL;

SELECT 'ORPHANED PROFILE_SKILLS (no matching profile):' as info;
SELECT COUNT(*) as orphaned_skills_count
FROM profile_skills ps
LEFT JOIN profiles p ON ps.profile_id = p.id
WHERE p.id IS NULL;

SELECT 'ORPHANED PROFILE_CERTIFICATIONS (no matching profile):' as info;
SELECT COUNT(*) as orphaned_certs_count
FROM profile_certifications pc
LEFT JOIN profiles p ON pc.profile_id = p.id
WHERE p.id IS NULL;

-- Check storage buckets exist
SELECT 'STORAGE BUCKETS:' as info;
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name IN ('profile-photos', 'resumes')
ORDER BY name;
