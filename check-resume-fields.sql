-- Check if resume fields actually exist in the profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE 'resume%'
ORDER BY column_name;

-- Also check if the resumes bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'resumes';
