-- =====================================================
-- MIGRATE EXISTING LOCATION DATA TO STRUCTURED FORMAT
-- Run this AFTER running add-structured-locations.sql
-- =====================================================

-- First, let's see what we're working with
SELECT 'BEFORE MIGRATION - Data Overview' as status;

SELECT 
  'Current Location Data' as report,
  COUNT(*) as total_profiles,
  COUNT(location) as has_location,
  COUNT(city) as has_city,
  COUNT(state) as has_state,
  COUNT(primary_location_structured) as has_structured_location
FROM profiles;

SELECT 'Sample of unmapped locations:' as report;
SELECT DISTINCT location, city, state, country
FROM profiles 
WHERE primary_location_structured IS NULL
AND (location IS NOT NULL OR city IS NOT NULL)
LIMIT 20;

-- =====================================================
-- AUTOMATED MAPPING BASED ON YOUR CURRENT DATA
-- =====================================================

-- Los Angeles area (priority mapping)
UPDATE profiles 
SET primary_location_structured = 'los-angeles-ca',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(COALESCE(location, '')) LIKE '%los angeles%' OR
  LOWER(COALESCE(location, '')) LIKE '%la%' OR  
  LOWER(COALESCE(location, '')) LIKE '%hollywood%' OR
  LOWER(COALESCE(location, '')) LIKE '%west hollywood%' OR
  LOWER(COALESCE(location, '')) LIKE '%burbank%' OR
  LOWER(COALESCE(location, '')) LIKE '%santa monica%' OR
  LOWER(COALESCE(city, '')) LIKE '%los angeles%' OR
  LOWER(COALESCE(city, '')) = 'la' OR
  (state = 'CA' AND LOWER(COALESCE(city, '')) LIKE '%hollywood%')
);

-- Atlanta area (your current profile)
UPDATE profiles
SET primary_location_structured = 'atlanta-ga',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%atlanta%' OR
  LOWER(COALESCE(location, '')) LIKE '%atl%' OR
  LOWER(COALESCE(city, '')) LIKE '%atlanta%' OR
  (state = 'GA' AND COALESCE(city, '') != '')
);

-- New York area
UPDATE profiles
SET primary_location_structured = 'new-york-ny',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%new york%' OR
  LOWER(COALESCE(location, '')) LIKE '%nyc%' OR
  LOWER(COALESCE(location, '')) LIKE '%manhattan%' OR
  LOWER(COALESCE(location, '')) LIKE '%brooklyn%' OR
  LOWER(COALESCE(city, '')) LIKE '%new york%' OR
  LOWER(COALESCE(city, '')) = 'nyc' OR
  (state = 'NY' AND COALESCE(city, '') != '')
);

-- Chicago
UPDATE profiles
SET primary_location_structured = 'chicago-il',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%chicago%' OR
  LOWER(COALESCE(city, '')) LIKE '%chicago%' OR
  (state = 'IL' AND COALESCE(city, '') != '')
);

-- Miami
UPDATE profiles  
SET primary_location_structured = 'miami-fl',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%miami%' OR
  LOWER(COALESCE(location, '')) LIKE '%south beach%' OR
  LOWER(COALESCE(city, '')) LIKE '%miami%'
);

-- Las Vegas
UPDATE profiles
SET primary_location_structured = 'las-vegas-nv',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%las vegas%' OR
  LOWER(COALESCE(location, '')) LIKE '%vegas%' OR
  LOWER(COALESCE(city, '')) LIKE '%las vegas%' OR
  LOWER(COALESCE(city, '')) = 'vegas'
);

-- Austin  
UPDATE profiles
SET primary_location_structured = 'austin-tx',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%austin%' OR
  LOWER(COALESCE(city, '')) LIKE '%austin%'
);

-- Orlando
UPDATE profiles
SET primary_location_structured = 'orlando-fl',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%orlando%' OR
  LOWER(COALESCE(city, '')) LIKE '%orlando%'
);

-- San Francisco
UPDATE profiles
SET primary_location_structured = 'san-francisco-ca',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%san francisco%' OR
  LOWER(COALESCE(location, '')) LIKE '%sf%' OR
  LOWER(COALESCE(city, '')) LIKE '%san francisco%'
);

-- Seattle
UPDATE profiles
SET primary_location_structured = 'seattle-wa',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%seattle%' OR
  LOWER(COALESCE(city, '')) LIKE '%seattle%'
);

-- Dallas
UPDATE profiles
SET primary_location_structured = 'dallas-tx',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%dallas%' OR
  LOWER(COALESCE(city, '')) LIKE '%dallas%'
);

-- Phoenix
UPDATE profiles
SET primary_location_structured = 'phoenix-az',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%phoenix%' OR
  LOWER(COALESCE(city, '')) LIKE '%phoenix%'
);

-- Boston
UPDATE profiles
SET primary_location_structured = 'boston-ma',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%boston%' OR
  LOWER(COALESCE(city, '')) LIKE '%boston%'
);

-- Vancouver (International)
UPDATE profiles
SET primary_location_structured = 'vancouver-bc',
    travel_radius = 'local'
WHERE primary_location_structured IS NULL
AND (
  LOWER(COALESCE(location, '')) LIKE '%vancouver%' OR
  LOWER(COALESCE(city, '')) LIKE '%vancouver%'
);

-- Set default travel radius for any remaining profiles
UPDATE profiles 
SET travel_radius = 'local' 
WHERE travel_radius IS NULL;

-- =====================================================
-- VERIFICATION AND REPORTING
-- =====================================================

SELECT 'AFTER MIGRATION - Results' as status;

-- Migration success report
SELECT 
  'Migration Results' as report,
  COUNT(*) as total_profiles,
  COUNT(primary_location_structured) as successfully_mapped,
  COUNT(*) - COUNT(primary_location_structured) as still_unmapped,
  ROUND(COUNT(primary_location_structured) * 100.0 / COUNT(*), 2) as success_percentage
FROM profiles;

-- Breakdown by structured location
SELECT 
  'Mapped Locations Breakdown' as report,
  primary_location_structured,
  COUNT(*) as profile_count
FROM profiles 
WHERE primary_location_structured IS NOT NULL
GROUP BY primary_location_structured
ORDER BY profile_count DESC;

-- Show remaining unmapped profiles for manual review
SELECT 
  'Unmapped Profiles Requiring Manual Review' as report,
  id, 
  full_name, 
  location, 
  city, 
  state, 
  country
FROM profiles 
WHERE primary_location_structured IS NULL
AND (location IS NOT NULL OR city IS NOT NULL)
ORDER BY full_name;

-- Show profiles with no location data at all
SELECT 
  'Profiles With No Location Data' as report,
  COUNT(*) as count
FROM profiles 
WHERE primary_location_structured IS NULL
AND location IS NULL 
AND city IS NULL 
AND state IS NULL;

COMMIT;
