-- Get actual data ranges and distinct values for reactive filters
-- Run this in Supabase SQL Editor to see what data exists

-- Check distinct values for gender
SELECT 'GENDER VALUES:' as category, gender as value, COUNT(*) as count
FROM profiles 
WHERE is_public = true AND gender IS NOT NULL
GROUP BY gender
ORDER BY count DESC;

-- Check distinct values for ethnicity  
SELECT 'ETHNICITY VALUES:' as category, ethnicity as value, COUNT(*) as count
FROM profiles 
WHERE is_public = true AND ethnicity IS NOT NULL
GROUP BY ethnicity
ORDER BY count DESC;

-- Check distinct values for locations (both old and new)
SELECT 'PRIMARY LOCATIONS:' as category, 
       COALESCE(primary_location_structured, location) as value, 
       COUNT(*) as count
FROM profiles 
WHERE is_public = true 
AND (primary_location_structured IS NOT NULL OR location IS NOT NULL)
GROUP BY COALESCE(primary_location_structured, location)
ORDER BY count DESC;

-- Check height ranges (in total inches)
SELECT 'HEIGHT DISTRIBUTION:' as category,
       CASE 
         WHEN (height_feet * 12 + COALESCE(height_inches, 0)) < 60 THEN 'Under 5 feet'
         WHEN (height_feet * 12 + COALESCE(height_inches, 0)) BETWEEN 60 AND 65 THEN '5\' - 5\'5"'
         WHEN (height_feet * 12 + COALESCE(height_inches, 0)) BETWEEN 66 AND 72 THEN '5\'6" - 6\''
         WHEN (height_feet * 12 + COALESCE(height_inches, 0)) > 72 THEN 'Over 6 feet'
         ELSE 'Unknown'
       END as height_range,
       COUNT(*) as count,
       MIN(height_feet * 12 + COALESCE(height_inches, 0)) as min_inches,
       MAX(height_feet * 12 + COALESCE(height_inches, 0)) as max_inches
FROM profiles 
WHERE is_public = true AND height_feet IS NOT NULL
GROUP BY height_range
ORDER BY min_inches;

-- Check weight ranges
SELECT 'WEIGHT DISTRIBUTION:' as category,
       CASE 
         WHEN weight_lbs < 120 THEN 'Under 120 lbs'
         WHEN weight_lbs BETWEEN 120 AND 150 THEN '120 - 150 lbs'
         WHEN weight_lbs BETWEEN 151 AND 180 THEN '151 - 180 lbs'
         WHEN weight_lbs BETWEEN 181 AND 220 THEN '181 - 220 lbs'
         WHEN weight_lbs > 220 THEN 'Over 220 lbs'
         ELSE 'Unknown'
       END as weight_range,
       COUNT(*) as count,
       MIN(weight_lbs) as min_weight,
       MAX(weight_lbs) as max_weight
FROM profiles 
WHERE is_public = true AND weight_lbs IS NOT NULL
GROUP BY weight_range
ORDER BY min_weight;

-- Get min/max values for sliders
SELECT 
  'HEIGHT_RANGE' as metric,
  MIN(height_feet * 12 + COALESCE(height_inches, 0)) as min_value,
  MAX(height_feet * 12 + COALESCE(height_inches, 0)) as max_value,
  COUNT(*) as total_profiles
FROM profiles 
WHERE is_public = true AND height_feet IS NOT NULL

UNION ALL

SELECT 
  'WEIGHT_RANGE' as metric,
  MIN(weight_lbs) as min_value,
  MAX(weight_lbs) as max_value,
  COUNT(*) as total_profiles
FROM profiles 
WHERE is_public = true AND weight_lbs IS NOT NULL;

-- Check union status values
SELECT 'UNION STATUS:' as category, union_status as value, COUNT(*) as count
FROM profiles 
WHERE is_public = true AND union_status IS NOT NULL
GROUP BY union_status
ORDER BY count DESC;

-- Check availability status values
SELECT 'AVAILABILITY:' as category, availability_status as value, COUNT(*) as count
FROM profiles 
WHERE is_public = true AND availability_status IS NOT NULL
GROUP BY availability_status
ORDER BY count DESC;
