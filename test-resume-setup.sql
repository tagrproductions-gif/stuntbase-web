-- Check if resume fields exist in profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE 'resume%'
ORDER BY column_name;

-- Check if resumes storage bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'resumes';

-- Check storage policies for resumes bucket
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%resume%'
ORDER BY policyname;
