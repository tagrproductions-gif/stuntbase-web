-- Debug duplicate profile creation issue
-- Run this in your Supabase SQL Editor to check for duplicate profiles

-- 1. Check how many profiles exist per user_id
SELECT 
    user_id,
    COUNT(*) as profile_count,
    STRING_AGG(id::text, ', ') as profile_ids,
    STRING_AGG(full_name, ', ') as names,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM profiles 
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY profile_count DESC;

-- 2. Check recent profile creations (last 24 hours)
SELECT 
    id, 
    user_id, 
    full_name, 
    email,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as profile_number
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY user_id, created_at;

-- 3. Check if there's a unique constraint on user_id
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'profiles' 
    AND tc.table_schema = 'public'
    AND (tc.constraint_type = 'UNIQUE' OR tc.constraint_type = 'PRIMARY KEY');

-- 4. Check total profiles count
SELECT COUNT(*) as total_profiles FROM profiles;

-- 5. Check for any database triggers that might create profiles
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';
