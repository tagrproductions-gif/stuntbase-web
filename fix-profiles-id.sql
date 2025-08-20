-- Fix the profiles table ID column to auto-generate UUIDs
-- Run this in your Supabase SQL Editor

-- First, let's check the current structure of the profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';

-- Check if the id column has a default value for UUID generation
-- If not, we need to add it

-- Add UUID default generation to the id column if it doesn't exist
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Also ensure the id column is the primary key
ALTER TABLE profiles 
ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Verify the fix
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';

-- Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';
