-- DEBUG: Check the migration results in detail

-- Show all profiles with their old and new location data
SELECT 
  id,
  full_name,
  location as old_location,
  city as old_city, 
  state as old_state,
  primary_location_structured as new_structured_location,
  travel_radius
FROM profiles
ORDER BY full_name;

-- Show the breakdown again
SELECT 
  primary_location_structured,
  COUNT(*) as profile_count,
  STRING_AGG(full_name, ', ') as profile_names
FROM profiles 
WHERE primary_location_structured IS NOT NULL
GROUP BY primary_location_structured
ORDER BY profile_count DESC;

-- Check if there are any unmapped profiles
SELECT 
  'Unmapped Profiles' as status,
  id,
  full_name,
  location,
  city, 
  state
FROM profiles 
WHERE primary_location_structured IS NULL
AND (location IS NOT NULL OR city IS NOT NULL);

-- Show total counts
SELECT 
  COUNT(*) as total_profiles,
  COUNT(primary_location_structured) as mapped_profiles,
  COUNT(*) - COUNT(primary_location_structured) as unmapped_profiles
FROM profiles;
