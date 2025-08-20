-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check profile_photos table structure (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profile_photos' 
ORDER BY ordinal_position;

-- Check profile_skills table structure (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profile_skills' 
ORDER BY ordinal_position;

-- Check profile_certifications table structure (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profile_certifications' 
ORDER BY ordinal_position;

-- Check what's actually in the profiles table (sample data)
SELECT id, full_name, location, height_feet, height_inches, bio, is_public
FROM profiles 
LIMIT 5;

-- Check if there are any photos
SELECT table_name, column_name
FROM information_schema.columns 
WHERE table_name LIKE '%photo%' 
ORDER BY table_name, ordinal_position;

-- Check if there are any skills
SELECT table_name, column_name
FROM information_schema.columns 
WHERE table_name LIKE '%skill%' 
ORDER BY table_name, ordinal_position;

-- Check if there are any certifications
SELECT table_name, column_name
FROM information_schema.columns 
WHERE table_name LIKE '%cert%' 
ORDER BY table_name, ordinal_position;
