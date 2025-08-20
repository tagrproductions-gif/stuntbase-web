-- Fix the foreign key constraint issue
-- Run this in your Supabase SQL Editor

-- First, let's see what the problematic constraint looks like
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE 
    conrelid::regclass::text = 'profiles'
    AND conname = 'profiles_id_fkey';

-- If the constraint is incorrectly set up, we'll drop it
-- (The id column should NOT have a foreign key constraint)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Verify the constraint is gone
SELECT 
    conname as constraint_name
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE 
    conrelid::regclass::text = 'profiles'
    AND conname = 'profiles_id_fkey';

-- Now try to create a test profile to see if it works
-- Don't actually run this, but this is what should work now:
-- INSERT INTO profiles (user_id, full_name, email) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test User', 'test@example.com');
