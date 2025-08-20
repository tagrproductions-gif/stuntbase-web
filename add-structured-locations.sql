-- =====================================================
-- STRUCTURED LOCATIONS MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add new structured location fields to profiles table
ALTER TABLE profiles 
ADD COLUMN primary_location_structured VARCHAR(50),
ADD COLUMN secondary_location_structured VARCHAR(50),
ADD COLUMN travel_radius VARCHAR(20) DEFAULT 'local';

-- Add comments for documentation
COMMENT ON COLUMN profiles.primary_location_structured IS 'Structured primary location (e.g., los-angeles-ca)';
COMMENT ON COLUMN profiles.secondary_location_structured IS 'Structured secondary location (e.g., atlanta-ga)';
COMMENT ON COLUMN profiles.travel_radius IS 'Willingness to travel (local, 50, 100, 200, state, regional, national, international)';

-- Create indexes for faster searching
CREATE INDEX idx_profiles_primary_location_structured ON profiles(primary_location_structured);
CREATE INDEX idx_profiles_secondary_location_structured ON profiles(secondary_location_structured);
CREATE INDEX idx_profiles_travel_radius ON profiles(travel_radius);

-- Create a view that combines old and new location data for easier querying
CREATE OR REPLACE VIEW profiles_with_locations AS
SELECT 
  p.*,
  -- Extract market info from structured locations
  CASE 
    WHEN p.primary_location_structured IN ('los-angeles-ca', 'new-york-ny', 'atlanta-ga', 'chicago-il', 'miami-fl', 'las-vegas-nv', 'austin-tx', 'orlando-fl') 
    THEN 'tier1'
    WHEN p.primary_location_structured IN ('san-francisco-ca', 'san-diego-ca', 'dallas-tx', 'houston-tx', 'seattle-wa', 'portland-or', 'denver-co', 'phoenix-az', 'boston-ma', 'philadelphia-pa', 'nashville-tn', 'charlotte-nc', 'tampa-fl', 'jacksonville-fl', 'sacramento-ca')
    THEN 'tier2'
    WHEN p.primary_location_structured IN ('vancouver-bc', 'toronto-on', 'london-uk', 'dublin-ie')
    THEN 'international'
    ELSE NULL
  END as primary_market_tier,
  
  -- Extract state from structured location
  CASE 
    WHEN p.primary_location_structured LIKE '%-ca' THEN 'CA'
    WHEN p.primary_location_structured LIKE '%-ny' THEN 'NY'
    WHEN p.primary_location_structured LIKE '%-ga' THEN 'GA'
    WHEN p.primary_location_structured LIKE '%-il' THEN 'IL'
    WHEN p.primary_location_structured LIKE '%-fl' THEN 'FL'
    WHEN p.primary_location_structured LIKE '%-nv' THEN 'NV'
    WHEN p.primary_location_structured LIKE '%-tx' THEN 'TX'
    WHEN p.primary_location_structured LIKE '%-wa' THEN 'WA'
    WHEN p.primary_location_structured LIKE '%-or' THEN 'OR'
    WHEN p.primary_location_structured LIKE '%-co' THEN 'CO'
    WHEN p.primary_location_structured LIKE '%-az' THEN 'AZ'
    WHEN p.primary_location_structured LIKE '%-ma' THEN 'MA'
    WHEN p.primary_location_structured LIKE '%-pa' THEN 'PA'
    WHEN p.primary_location_structured LIKE '%-tn' THEN 'TN'
    WHEN p.primary_location_structured LIKE '%-nc' THEN 'NC'
    WHEN p.primary_location_structured LIKE '%-bc' THEN 'BC'
    WHEN p.primary_location_structured LIKE '%-on' THEN 'ON'
    ELSE p.state -- Fall back to existing state field
  END as computed_state,
  
  -- Combine all location info for search
  COALESCE(p.primary_location_structured, p.location) as best_location
FROM profiles p;

-- Update RLS policies for new fields (copy existing policies)
-- Enable RLS on the view
ALTER VIEW profiles_with_locations OWNER TO postgres;

-- Grant permissions
GRANT SELECT ON profiles_with_locations TO anon, authenticated;

-- =====================================================
-- DATA MIGRATION: Map existing free-form locations to structured ones
-- =====================================================

-- Los Angeles area
UPDATE profiles 
SET primary_location_structured = 'los-angeles-ca'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%los angeles%' OR
  LOWER(location) LIKE '%la%' OR  
  LOWER(location) LIKE '%hollywood%' OR
  LOWER(location) LIKE '%west hollywood%' OR
  LOWER(location) LIKE '%weho%' OR
  LOWER(location) LIKE '%burbank%' OR
  LOWER(location) LIKE '%studio city%' OR
  LOWER(location) LIKE '%beverly hills%' OR
  LOWER(location) LIKE '%santa monica%' OR
  LOWER(city) LIKE '%los angeles%' OR
  LOWER(city) = 'la' OR
  state = 'CA' AND LOWER(city) LIKE '%hollywood%'
);

-- Atlanta area  
UPDATE profiles
SET primary_location_structured = 'atlanta-ga'
WHERE primary_location_structured IS NULL
AND (
  LOWER(location) LIKE '%atlanta%' OR
  LOWER(location) LIKE '%atl%' OR
  LOWER(city) LIKE '%atlanta%' OR
  state = 'GA' AND city IS NOT NULL
);

-- New York area
UPDATE profiles
SET primary_location_structured = 'new-york-ny' 
WHERE primary_location_structured IS NULL
AND (
  LOWER(location) LIKE '%new york%' OR
  LOWER(location) LIKE '%nyc%' OR
  LOWER(location) LIKE '%manhattan%' OR
  LOWER(location) LIKE '%brooklyn%' OR
  LOWER(city) LIKE '%new york%' OR
  LOWER(city) = 'nyc' OR
  state = 'NY' AND city IS NOT NULL
);

-- Chicago
UPDATE profiles
SET primary_location_structured = 'chicago-il'
WHERE primary_location_structured IS NULL
AND (
  LOWER(location) LIKE '%chicago%' OR
  LOWER(city) LIKE '%chicago%' OR
  state = 'IL' AND city IS NOT NULL
);

-- Miami
UPDATE profiles  
SET primary_location_structured = 'miami-fl'
WHERE primary_location_structured IS NULL
AND (
  LOWER(location) LIKE '%miami%' OR
  LOWER(location) LIKE '%south beach%' OR
  LOWER(city) LIKE '%miami%'
);

-- Las Vegas
UPDATE profiles
SET primary_location_structured = 'las-vegas-nv'
WHERE primary_location_structured IS NULL
AND (
  LOWER(location) LIKE '%las vegas%' OR
  LOWER(location) LIKE '%vegas%' OR
  LOWER(city) LIKE '%las vegas%' OR
  LOWER(city) = 'vegas'
);

-- Austin  
UPDATE profiles
SET primary_location_structured = 'austin-tx'
WHERE primary_location_structured IS NULL
AND (
  LOWER(location) LIKE '%austin%' OR
  LOWER(city) LIKE '%austin%'
);

-- Add more mapping as needed for other cities...

-- Set default travel radius for existing profiles
UPDATE profiles 
SET travel_radius = 'local' 
WHERE travel_radius IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check migration results
SELECT 
  'Before Migration' as status,
  COUNT(*) as total_profiles,
  COUNT(location) as has_old_location,
  COUNT(primary_location_structured) as has_new_location
FROM profiles
WHERE primary_location_structured IS NULL

UNION ALL

SELECT 
  'After Migration' as status,
  COUNT(*) as total_profiles, 
  COUNT(location) as has_old_location,
  COUNT(primary_location_structured) as has_new_location
FROM profiles
WHERE primary_location_structured IS NOT NULL;

-- Show breakdown by structured location
SELECT 
  primary_location_structured,
  COUNT(*) as profile_count
FROM profiles 
WHERE primary_location_structured IS NOT NULL
GROUP BY primary_location_structured
ORDER BY profile_count DESC;

-- Show unmapped profiles (need manual review)
SELECT id, full_name, location, city, state, country
FROM profiles 
WHERE primary_location_structured IS NULL
AND (location IS NOT NULL OR city IS NOT NULL);

COMMIT;
