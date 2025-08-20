-- Check if profile_photos table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profile_photos';

-- Check RLS policies on profile_photos
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profile_photos';

-- Try to insert a test record (this will show the exact error)
INSERT INTO profile_photos (profile_id, photo_url, caption, is_primary, display_order)
VALUES ('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'test-url', 'test', false, 1);
