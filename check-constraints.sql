-- Check all constraints on the profiles table
-- Run this in your Supabase SQL Editor to diagnose the issue

-- 1. Check all foreign key constraints on profiles table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='profiles';

-- 2. Check the specific constraint that's failing
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE 
    conrelid::regclass::text = 'profiles'
    AND conname = 'profiles_id_fkey';

-- 3. Check the current table structure
\d profiles;
