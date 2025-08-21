-- =====================================================
-- FIX VIEW MIGRATION - Run this instead
-- =====================================================

-- First, drop the existing view
DROP VIEW IF EXISTS profiles_with_locations;

-- Now create the updated view with new cities
CREATE VIEW profiles_with_locations AS
SELECT 
  p.*,
  -- Extract market info from structured locations (UPDATED with new cities)
  CASE 
    WHEN p.primary_location_structured IN (
      'los-angeles-ca', 'new-york-ny', 'atlanta-ga', 'chicago-il', 
      'miami-fl', 'las-vegas-nv', 'austin-tx', 'orlando-fl',
      'new-orleans-la'  -- Added New Orleans as Tier 1
    ) 
    THEN 'tier1'
    WHEN p.primary_location_structured IN (
      'san-francisco-ca', 'san-diego-ca', 'dallas-tx', 'houston-tx', 
      'seattle-wa', 'portland-or', 'denver-co', 'phoenix-az', 
      'boston-ma', 'philadelphia-pa', 'nashville-tn', 'charlotte-nc', 
      'tampa-fl', 'jacksonville-fl', 'sacramento-ca',
      -- NEW TIER 2 CITIES
      'albuquerque-nm', 'pittsburgh-pa', 'richmond-va', 'wilmington-nc',
      'salt-lake-city-ut', 'detroit-mi', 'cleveland-oh', 'baltimore-md',
      'kansas-city-mo'
    )
    THEN 'tier2'
    WHEN p.primary_location_structured IN (
      'vancouver-bc', 'toronto-on', 'london-uk', 'dublin-ie',
      -- NEW INTERNATIONAL CITIES
      'montreal-qc', 'budapest-hu', 'prague-cz', 'valletta-mt'
    )
    THEN 'international'
    ELSE NULL
  END as primary_market_tier,
  
  -- Extract state from structured location (UPDATED with new states)
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
    -- NEW STATES
    WHEN p.primary_location_structured LIKE '%-la' THEN 'LA'
    WHEN p.primary_location_structured LIKE '%-nm' THEN 'NM'
    WHEN p.primary_location_structured LIKE '%-va' THEN 'VA'
    WHEN p.primary_location_structured LIKE '%-ut' THEN 'UT'
    WHEN p.primary_location_structured LIKE '%-mi' THEN 'MI'
    WHEN p.primary_location_structured LIKE '%-oh' THEN 'OH'
    WHEN p.primary_location_structured LIKE '%-md' THEN 'MD'
    WHEN p.primary_location_structured LIKE '%-mo' THEN 'MO'
    -- INTERNATIONAL
    WHEN p.primary_location_structured LIKE '%-bc' THEN 'BC'
    WHEN p.primary_location_structured LIKE '%-on' THEN 'ON'
    WHEN p.primary_location_structured LIKE '%-qc' THEN 'QC'
    ELSE p.state -- Fall back to existing state field
  END as computed_state,
  
  -- Combine all location info for search
  COALESCE(p.primary_location_structured, p.location) as best_location
FROM profiles p;

-- Grant permissions on updated view
GRANT SELECT ON profiles_with_locations TO anon, authenticated;

-- =====================================================
-- ADD MIGRATION MAPPINGS FOR NEW CITIES
-- =====================================================

-- New Orleans area
UPDATE profiles 
SET primary_location_structured = 'new-orleans-la'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%new orleans%' OR
  LOWER(location) LIKE '%nola%' OR  
  LOWER(location) LIKE '%french quarter%' OR
  LOWER(city) LIKE '%new orleans%' OR
  LOWER(city) = 'nola' OR
  state = 'LA' AND LOWER(city) LIKE '%orleans%'
);

-- Albuquerque area
UPDATE profiles 
SET primary_location_structured = 'albuquerque-nm'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%albuquerque%' OR
  LOWER(location) LIKE '%abq%' OR
  LOWER(city) LIKE '%albuquerque%' OR
  state = 'NM' AND city IS NOT NULL
);

-- Pittsburgh area
UPDATE profiles 
SET primary_location_structured = 'pittsburgh-pa'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%pittsburgh%' OR
  LOWER(location) LIKE '%steel city%' OR
  LOWER(city) LIKE '%pittsburgh%' OR
  (state = 'PA' AND LOWER(city) LIKE '%pittsburgh%')
);

-- Richmond area
UPDATE profiles 
SET primary_location_structured = 'richmond-va'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%richmond%' OR
  LOWER(city) LIKE '%richmond%' OR
  (state = 'VA' AND LOWER(city) LIKE '%richmond%')
);

-- Wilmington area
UPDATE profiles 
SET primary_location_structured = 'wilmington-nc'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%wilmington%' OR
  LOWER(city) LIKE '%wilmington%' OR
  (state = 'NC' AND LOWER(city) LIKE '%wilmington%')
);

-- Salt Lake City area
UPDATE profiles 
SET primary_location_structured = 'salt-lake-city-ut'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%salt lake%' OR
  LOWER(location) LIKE '%slc%' OR
  LOWER(city) LIKE '%salt lake%' OR
  state = 'UT' AND city IS NOT NULL
);

-- Detroit area
UPDATE profiles 
SET primary_location_structured = 'detroit-mi'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%detroit%' OR
  LOWER(location) LIKE '%motor city%' OR
  LOWER(city) LIKE '%detroit%' OR
  state = 'MI' AND LOWER(city) LIKE '%detroit%'
);

-- Cleveland area
UPDATE profiles 
SET primary_location_structured = 'cleveland-oh'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%cleveland%' OR
  LOWER(city) LIKE '%cleveland%' OR
  (state = 'OH' AND LOWER(city) LIKE '%cleveland%')
);

-- Baltimore area
UPDATE profiles 
SET primary_location_structured = 'baltimore-md'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%baltimore%' OR
  LOWER(city) LIKE '%baltimore%' OR
  (state = 'MD' AND LOWER(city) LIKE '%baltimore%')
);

-- Kansas City area
UPDATE profiles 
SET primary_location_structured = 'kansas-city-mo'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%kansas city%' OR
  LOWER(city) LIKE '%kansas city%' OR
  (state = 'MO' AND LOWER(city) LIKE '%kansas%')
);

-- Montreal area
UPDATE profiles 
SET primary_location_structured = 'montreal-qc'
WHERE primary_location_structured IS NULL 
AND (
  LOWER(location) LIKE '%montreal%' OR
  LOWER(city) LIKE '%montreal%' OR
  (state = 'QC' AND city IS NOT NULL) OR
  (country = 'Canada' AND LOWER(city) LIKE '%montreal%')
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check new location mappings
SELECT 
  primary_location_structured,
  COUNT(*) as profile_count
FROM profiles 
WHERE primary_location_structured IN (
  'new-orleans-la', 'albuquerque-nm', 'pittsburgh-pa', 'richmond-va', 
  'wilmington-nc', 'salt-lake-city-ut', 'detroit-mi', 'cleveland-oh', 
  'baltimore-md', 'kansas-city-mo', 'montreal-qc'
)
GROUP BY primary_location_structured
ORDER BY profile_count DESC;

COMMIT;
