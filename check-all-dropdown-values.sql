-- COMPREHENSIVE CHECK OF ALL DROPDOWN/ENUM VALUES IN PROFILES
-- Run this in Supabase SQL Editor to see all possible values used

-- =============================================================================
-- DEMOGRAPHICS
-- =============================================================================

SELECT 'GENDER VALUES:' as section;
SELECT gender, COUNT(*) as count
FROM profiles 
WHERE gender IS NOT NULL
GROUP BY gender
ORDER BY count DESC;

SELECT 'ETHNICITY VALUES:' as section;
SELECT ethnicity, COUNT(*) as count
FROM profiles 
WHERE ethnicity IS NOT NULL
GROUP BY ethnicity
ORDER BY count DESC;

SELECT 'HAIR COLOR VALUES:' as section;
SELECT hair_color, COUNT(*) as count
FROM profiles 
WHERE hair_color IS NOT NULL
GROUP BY hair_color
ORDER BY count DESC;

SELECT 'EYE COLOR VALUES:' as section;
SELECT eye_color, COUNT(*) as count
FROM profiles 
WHERE eye_color IS NOT NULL
GROUP BY eye_color
ORDER BY count DESC;

-- =============================================================================
-- PROFESSIONAL STATUS
-- =============================================================================

SELECT 'UNION STATUS VALUES:' as section;
SELECT union_status, COUNT(*) as count
FROM profiles 
WHERE union_status IS NOT NULL
GROUP BY union_status
ORDER BY count DESC;

SELECT 'AVAILABILITY STATUS VALUES:' as section;
SELECT availability_status, COUNT(*) as count
FROM profiles 
WHERE availability_status IS NOT NULL
GROUP BY availability_status
ORDER BY count DESC;

SELECT 'STATUS VALUES:' as section;
SELECT status, COUNT(*) as count
FROM profiles 
WHERE status IS NOT NULL
GROUP BY status
ORDER BY count DESC;

SELECT 'LOAN OUT STATUS VALUES:' as section;
SELECT loan_out_status, COUNT(*) as count
FROM profiles 
WHERE loan_out_status IS NOT NULL
GROUP BY loan_out_status
ORDER BY count DESC;

SELECT 'PREFERRED CONTACT VALUES:' as section;
SELECT preferred_contact, COUNT(*) as count
FROM profiles 
WHERE preferred_contact IS NOT NULL
GROUP BY preferred_contact
ORDER BY count DESC;

-- =============================================================================
-- WARDROBE/SIZING
-- =============================================================================

SELECT 'T-SHIRT SIZE VALUES:' as section;
SELECT t_shirt_size, COUNT(*) as count
FROM profiles 
WHERE t_shirt_size IS NOT NULL
GROUP BY t_shirt_size
ORDER BY count DESC;

SELECT 'HAT SIZE VALUES:' as section;
SELECT hat_size, COUNT(*) as count
FROM profiles 
WHERE hat_size IS NOT NULL
GROUP BY hat_size
ORDER BY count DESC;

SELECT 'GLOVE SIZE VALUES:' as section;
SELECT glove_size, COUNT(*) as count
FROM profiles 
WHERE glove_size IS NOT NULL
GROUP BY glove_size
ORDER BY count DESC;

SELECT 'JACKET LENGTH VALUES:' as section;
SELECT jacket_length, COUNT(*) as count
FROM profiles 
WHERE jacket_length IS NOT NULL
GROUP BY jacket_length
ORDER BY count DESC;

-- =============================================================================
-- SKILLS & CERTIFICATIONS
-- =============================================================================

SELECT 'SKILL NAMES:' as section;
SELECT skill_id, COUNT(*) as count
FROM profile_skills 
GROUP BY skill_id
ORDER BY count DESC;

SELECT 'PROFICIENCY LEVELS:' as section;
SELECT proficiency_level, COUNT(*) as count
FROM profile_skills 
WHERE proficiency_level IS NOT NULL
GROUP BY proficiency_level
ORDER BY count DESC;

SELECT 'CERTIFICATION NAMES:' as section;
SELECT certification_id, COUNT(*) as count
FROM profile_certifications 
GROUP BY certification_id
ORDER BY count DESC;

-- =============================================================================
-- LOCATIONS
-- =============================================================================

SELECT 'COUNTRY VALUES:' as section;
SELECT country, COUNT(*) as count
FROM profiles 
WHERE country IS NOT NULL
GROUP BY country
ORDER BY count DESC;

SELECT 'STATE VALUES:' as section;
SELECT state, COUNT(*) as count
FROM profiles 
WHERE state IS NOT NULL
GROUP BY state
ORDER BY count DESC;

SELECT 'CITY VALUES:' as section;
SELECT city, COUNT(*) as count
FROM profiles 
WHERE city IS NOT NULL
GROUP BY city
ORDER BY count DESC;

SELECT 'LOCATION VALUES (free form):' as section;
SELECT location, COUNT(*) as count
FROM profiles 
WHERE location IS NOT NULL
GROUP BY location
ORDER BY count DESC;

-- =============================================================================
-- SUMMARY OF NON-NULL DATA COMPLETENESS
-- =============================================================================

SELECT 'DATA COMPLETENESS SUMMARY:' as section;

SELECT 
  COUNT(*) as total_profiles,
  COUNT(gender) as has_gender,
  COUNT(ethnicity) as has_ethnicity,
  COUNT(hair_color) as has_hair_color,
  COUNT(eye_color) as has_eye_color,
  COUNT(union_status) as has_union_status,
  COUNT(availability_status) as has_availability_status,
  COUNT(bio) as has_bio,
  COUNT(location) as has_location,
  COUNT(city) as has_city,
  COUNT(state) as has_state
FROM profiles;
