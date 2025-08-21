-- RLS Policies for StuntGhost profiles table
-- Run this in your Supabase SQL Editor

-- First, ensure RLS is enabled on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to INSERT their own profile
-- This allows authenticated users to create a profile where user_id matches their auth.uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to UPDATE their own profile
-- This allows users to update profiles where user_id matches their auth.uid()
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to SELECT their own profile
-- This allows users to read their own profile data
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 4: Allow public to SELECT public profiles
-- This allows anyone (including unauthenticated users) to view public profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (is_public = true);

-- Policy 5: Allow authenticated users to SELECT all public profiles
-- This ensures authenticated users can also see public profiles
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON profiles;
CREATE POLICY "Authenticated users can view public profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_public = true);

-- Policy 6: Allow users to DELETE their own profile (optional)
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test that user_id column exists and is properly configured
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'user_id';
