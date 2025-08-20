-- STREAMLINE PROFILES MIGRATION FOR SUPABASE
-- This migration removes unwanted fields and adds new wardrobe fields
-- ⚠️ WARNING: This will permanently delete data in removed columns

-- =============================================================================
-- STEP 1: BACKUP EXISTING DATA (Run this first to backup before changes)
-- =============================================================================

-- Create backup table with current data
CREATE TABLE profiles_backup_20241217 AS 
SELECT * FROM profiles;

-- =============================================================================
-- STEP 2: REMOVE UNWANTED COLUMNS
-- =============================================================================

-- Remove experience/travel fields
ALTER TABLE profiles DROP COLUMN IF EXISTS experience_years;
ALTER TABLE profiles DROP COLUMN IF EXISTS years_experience;
ALTER TABLE profiles DROP COLUMN IF EXISTS travel_radius;

-- Remove day rate fields  
ALTER TABLE profiles DROP COLUMN IF EXISTS day_rate_min;
ALTER TABLE profiles DROP COLUMN IF EXISTS day_rate_max;

-- Remove emergency contact fields
ALTER TABLE profiles DROP COLUMN IF EXISTS emergency_contact_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS emergency_contact_phone;

-- Remove instagram field
ALTER TABLE profiles DROP COLUMN IF EXISTS instagram;

-- Remove other unused fields
ALTER TABLE profiles DROP COLUMN IF EXISTS twitter;
ALTER TABLE profiles DROP COLUMN IF EXISTS facebook;

-- =============================================================================
-- STEP 3: ADD NEW WARDROBE FIELDS
-- =============================================================================

-- Universal wardrobe fields (all genders)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shirt_neck DECIMAL(4,1);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shirt_sleeve INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pants_waist INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pants_inseam INTEGER; 
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shoe_size DECIMAL(3,1);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS t_shirt_size VARCHAR(5);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hat_size VARCHAR(10);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS glove_size VARCHAR(5);

-- Male-specific wardrobe fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jacket_size INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS jacket_length VARCHAR(5);

-- Female-specific wardrobe fields  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dress_size INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pants_size INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS underbust INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hips INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chest INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS waist INTEGER;

-- =============================================================================
-- STEP 4: ADD MISSING COMPETITOR FIELDS
-- =============================================================================

-- Add loan out status (seen as "Loan Out?" in competitor)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loan_out_status VARCHAR(20) DEFAULT 'Unknown';

-- Add secondary location (seen in competitor)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secondary_location TEXT;

-- =============================================================================
-- STEP 5: CLEAN UP DUPLICATE FIELDS
-- =============================================================================

-- Keep website, remove website_url (they're duplicates)
UPDATE profiles SET website = COALESCE(website, website_url) WHERE website IS NULL AND website_url IS NOT NULL;
ALTER TABLE profiles DROP COLUMN IF EXISTS website_url;

-- =============================================================================
-- STEP 6: VERIFY CHANGES
-- =============================================================================

-- Show final column structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Count rows to ensure no data loss
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'profiles_backup_20241217' as table_name, COUNT(*) as row_count FROM profiles_backup_20241217;
