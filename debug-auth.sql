-- Debug authentication in Supabase SQL Editor
-- Run these queries to check authentication status

-- 1. Check if you're authenticated
SELECT 
    auth.uid() as user_id,
    auth.email() as email,
    auth.role() as role;

-- 2. Check if there are any auth users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check current session info
SELECT 
    CASE 
        WHEN auth.uid() IS NULL THEN 'No authentication session'
        ELSE 'Authenticated as: ' || auth.email()
    END as auth_status;

-- 4. Test RLS policies by trying to insert a test record (will fail due to RLS, but shows which policy is blocking)
-- Don't actually run this, but this is what's happening:
-- INSERT INTO profiles (user_id, full_name, email) VALUES (auth.uid(), 'Test User', 'test@example.com');
