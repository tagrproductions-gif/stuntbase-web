-- Fix Can's profile to have proper gender and structured location

UPDATE profiles 
SET 
  gender = 'Man',
  primary_location_structured = 'atlanta-ga',
  travel_radius = 'local'
WHERE full_name = 'Can Michael Cihangir';

-- Verify the update
SELECT 
  full_name,
  gender,
  location,
  primary_location_structured,
  travel_radius
FROM profiles 
WHERE full_name = 'Can Michael Cihangir';
