-- =====================================================
-- CHECK CURRENT DATABASE STATE
-- Run this in Supabase SQL Editor to see what's actually there
-- =====================================================

-- 1. List all tables in the public schema
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Get the actual structure of the profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check what other tables exist (skills, certifications, etc.)
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name != 'profiles'
GROUP BY table_name
ORDER BY table_name;

-- 4. Check if profile_views table already exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profile_views' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check what views exist
SELECT table_name, view_definition
FROM information_schema.views 
WHERE table_schema = 'public';

-- 6. Check what functions exist (including RPC functions)
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 7. Sample some actual data from profiles table (first 3 records)
SELECT 
    id, 
    user_id, 
    full_name, 
    email,
    is_public,
    created_at,
    updated_at
FROM profiles 
LIMIT 3;

-- 8. Check foreign key relationships
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
