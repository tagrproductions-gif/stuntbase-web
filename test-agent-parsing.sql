-- Test what Agent 1 is returning vs what database expects

-- Check actual availability values in database
SELECT 'AVAILABILITY_STATUS values in database:' as check_type;
SELECT DISTINCT availability_status, COUNT(*) 
FROM profiles 
WHERE availability_status IS NOT NULL
GROUP BY availability_status;

-- Check actual gender values in database  
SELECT 'GENDER values in database:' as check_type;
SELECT DISTINCT gender, COUNT(*)
FROM profiles
WHERE gender IS NOT NULL  
GROUP BY gender;

-- Check actual location values
SELECT 'LOCATION values in database:' as check_type;
SELECT DISTINCT primary_location_structured, COUNT(*)
FROM profiles
WHERE primary_location_structured IS NOT NULL
GROUP BY primary_location_structured;

-- Check what "LA" should map to
SELECT 'Checking LA mapping:' as check_type;
SELECT value, label, aliases
FROM (
  VALUES 
    ('los-angeles-ca', 'Los Angeles, CA', ARRAY['la', 'los angeles', 'hollywood', 'weho', 'burbank', 'studio city', 'beverly hills', 'santa monica'])
) as locations(value, label, aliases);
