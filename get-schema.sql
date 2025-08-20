-- Get all columns from profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Get skills structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills';

-- Get certifications structure  
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'certifications';
