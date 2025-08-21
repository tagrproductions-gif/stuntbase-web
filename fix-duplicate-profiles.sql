-- Fix duplicate profile creation issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's add a unique constraint on user_id to prevent future duplicates
-- This will ensure only one profile per user can exist
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 2. If the above fails due to existing duplicates, we need to clean up first
-- Before running the constraint, check if duplicates exist by running:
-- SELECT user_id, COUNT(*) FROM profiles GROUP BY user_id HAVING COUNT(*) > 1;

-- 3. If duplicates exist, you'll need to decide which ones to keep
-- This query will help you identify duplicates and their details:
/*
SELECT 
    user_id,
    id,
    full_name,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_num
FROM profiles 
WHERE user_id IN (
    SELECT user_id 
    FROM profiles 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
)
ORDER BY user_id, created_at;
*/

-- 4. To delete duplicate profiles (keeping only the first one created), run:
-- WARNING: This will permanently delete data. Make sure to backup first!
/*
DELETE FROM profiles 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_num
        FROM profiles
    ) t 
    WHERE row_num > 1
);
*/

-- 5. After cleanup, add the unique constraint:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 6. Verify the constraint was added:
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
    AND tc.constraint_type = 'UNIQUE';
