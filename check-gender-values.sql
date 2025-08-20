-- Check what gender values are actually used in the database
-- Run this in Supabase SQL Editor

SELECT 
  gender, 
  COUNT(*) as count
FROM profiles 
WHERE gender IS NOT NULL
GROUP BY gender
ORDER BY count DESC;

-- Also check a few sample profiles
SELECT id, full_name, gender 
FROM profiles 
WHERE gender IS NOT NULL
LIMIT 10;
