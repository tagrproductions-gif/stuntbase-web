-- Check storage bucket existence and policies
SELECT 
  name,
  id,
  public
FROM storage.buckets 
WHERE name = 'profile-photos';

-- Check storage policies
SELECT 
  name,
  definition,
  check_expression
FROM storage.policies 
WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'profile-photos');

-- Check if RLS is enabled on storage objects
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
