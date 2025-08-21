-- =====================================================
-- TEST YOUR EXISTING PROFILE VIEWS SYSTEM
-- Run this in Supabase SQL Editor to verify everything works
-- =====================================================

-- 1. Check if your increment_profile_views function works
-- Replace 'your-profile-id-here' with an actual profile ID from your profiles table
SELECT increment_profile_views('f312c9b7-220c-4352-ba25-48d421964c98');

-- 2. Check the profile_analytics view to see the data
SELECT * FROM profile_analytics 
WHERE profile_id = 'f312c9b7-220c-4352-ba25-48d421964c98';

-- 3. Check the profiles table view_count was updated
SELECT id, full_name, view_count 
FROM profiles 
WHERE id = 'f312c9b7-220c-4352-ba25-48d421964c98';

-- 4. Check recent views in profile_views table
SELECT * FROM profile_views 
WHERE profile_id = 'f312c9b7-220c-4352-ba25-48d421964c98'
ORDER BY viewed_at DESC 
LIMIT 5;

-- 5. See all profile analytics for debugging
SELECT 
  profile_id,
  full_name,
  view_count,
  total_views,
  views_last_30_days,
  views_last_7_days,
  unique_registered_viewers,
  unique_anonymous_viewers
FROM profile_analytics
ORDER BY total_views DESC;
