-- Fix only the UUID default generation (primary key already exists)
-- Run this in your Supabase SQL Editor

-- Just add the UUID default generation to the existing id column
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the fix worked
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';
