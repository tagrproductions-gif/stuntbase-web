-- Debug filter matching
-- Run this to see what data exists vs what filters are being sent

-- Check what actual data exists in profiles
SELECT 
  'SAMPLE PROFILES' as debug_category,
  id,
  full_name,
  gender,
  ethnicity,
  location,
  primary_location_structured,
  height_feet,
  height_inches,
  (height_feet * 12 + COALESCE(height_inches, 0)) as total_height_inches,
  weight_lbs,
  union_status,
  availability_status
FROM profiles 
WHERE is_public = true
LIMIT 5;

-- Check distinct values to match against filter options
SELECT 'GENDER_VALUES' as category, gender, COUNT(*) as count
FROM profiles WHERE is_public = true AND gender IS NOT NULL
GROUP BY gender;

SELECT 'ETHNICITY_VALUES' as category, ethnicity, COUNT(*) as count  
FROM profiles WHERE is_public = true AND ethnicity IS NOT NULL
GROUP BY ethnicity;

SELECT 'LOCATION_VALUES' as category, 
       COALESCE(primary_location_structured, location) as location_value, 
       COUNT(*) as count
FROM profiles WHERE is_public = true 
AND (primary_location_structured IS NOT NULL OR location IS NOT NULL)
GROUP BY COALESCE(primary_location_structured, location)
ORDER BY count DESC;

SELECT 'UNION_STATUS_VALUES' as category, union_status, COUNT(*) as count
FROM profiles WHERE is_public = true AND union_status IS NOT NULL  
GROUP BY union_status;

SELECT 'AVAILABILITY_VALUES' as category, availability_status, COUNT(*) as count
FROM profiles WHERE is_public = true AND availability_status IS NOT NULL
GROUP BY availability_status;
