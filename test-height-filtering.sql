-- Test height filtering logic
-- This tests the same logic we're using in the code

-- Sample data showing how height filtering should work
SELECT 
  'SAMPLE_DATA' as test_type,
  full_name,
  height_feet,
  height_inches,
  (height_feet * 12 + COALESCE(height_inches, 0)) as total_inches,
  CASE 
    WHEN height_feet IS NULL THEN 'No height data'
    ELSE CONCAT(height_feet, '''', COALESCE(height_inches, 0), '"')
  END as height_display
FROM profiles 
WHERE is_public = true
AND height_feet IS NOT NULL
ORDER BY (height_feet * 12 + COALESCE(height_inches, 0));

-- Test minimum height filter (e.g., 66 inches = 5'6")
-- This should return people who are 5'6" or taller
SELECT 
  'MIN_HEIGHT_TEST_66_INCHES' as test_type,
  full_name,
  height_feet,
  height_inches,
  (height_feet * 12 + COALESCE(height_inches, 0)) as total_inches,
  CONCAT(height_feet, '''', COALESCE(height_inches, 0), '"') as height_display
FROM profiles 
WHERE is_public = true
AND height_feet IS NOT NULL
AND (
  height_feet > 5 OR 
  (height_feet = 5 AND COALESCE(height_inches, 0) >= 6)
)
ORDER BY (height_feet * 12 + COALESCE(height_inches, 0));

-- Test maximum height filter (e.g., 72 inches = 6'0")  
-- This should return people who are 6'0" or shorter
SELECT 
  'MAX_HEIGHT_TEST_72_INCHES' as test_type,
  full_name,
  height_feet,
  height_inches,
  (height_feet * 12 + COALESCE(height_inches, 0)) as total_inches,
  CONCAT(height_feet, '''', COALESCE(height_inches, 0), '"') as height_display
FROM profiles 
WHERE is_public = true
AND height_feet IS NOT NULL
AND (
  height_feet < 6 OR 
  (height_feet = 6 AND COALESCE(height_inches, 0) <= 0)
)
ORDER BY (height_feet * 12 + COALESCE(height_inches, 0));

-- Test range filter (e.g., 66-72 inches = 5'6" to 6'0")
-- This should return people between 5'6" and 6'0"
SELECT 
  'HEIGHT_RANGE_TEST_66_TO_72' as test_type,
  full_name,
  height_feet,
  height_inches,
  (height_feet * 12 + COALESCE(height_inches, 0)) as total_inches,
  CONCAT(height_feet, '''', COALESCE(height_inches, 0), '"') as height_display
FROM profiles 
WHERE is_public = true
AND height_feet IS NOT NULL
AND (
  -- Minimum: 5'6" or taller
  (height_feet > 5 OR (height_feet = 5 AND COALESCE(height_inches, 0) >= 6))
  AND
  -- Maximum: 6'0" or shorter  
  (height_feet < 6 OR (height_feet = 6 AND COALESCE(height_inches, 0) <= 0))
)
ORDER BY (height_feet * 12 + COALESCE(height_inches, 0));
