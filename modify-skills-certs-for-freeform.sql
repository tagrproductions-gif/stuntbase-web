-- Migration to allow free-form skills and certifications
-- This maintains backward compatibility while allowing direct text entry

BEGIN;

-- ============================================================================
-- STEP 1: Modify profile_skills table to allow text-based skills
-- ============================================================================

-- Drop the foreign key constraint for skills
ALTER TABLE profile_skills DROP CONSTRAINT IF EXISTS profile_skills_skill_id_fkey;

-- Change skill_id from integer to text to allow storing skill names directly
ALTER TABLE profile_skills ALTER COLUMN skill_id TYPE text USING skill_id::text;

-- Update existing records to use skill names instead of IDs
UPDATE profile_skills 
SET skill_id = skills.name 
FROM skills 
WHERE profile_skills.skill_id::integer = skills.id
AND profile_skills.skill_id ~ '^[0-9]+$'; -- Only update if it's currently a number

-- ============================================================================
-- STEP 2: Modify profile_certifications table to allow text-based certifications
-- ============================================================================

-- Drop the foreign key constraint for certifications
ALTER TABLE profile_certifications DROP CONSTRAINT IF EXISTS profile_certifications_certification_id_fkey;

-- Change certification_id from integer to text to allow storing certification names directly
ALTER TABLE profile_certifications ALTER COLUMN certification_id TYPE text USING certification_id::text;

-- Update existing records to use certification names instead of IDs
UPDATE profile_certifications 
SET certification_id = certifications.name 
FROM certifications 
WHERE profile_certifications.certification_id::integer = certifications.id
AND profile_certifications.certification_id ~ '^[0-9]+$'; -- Only update if it's currently a number

-- ============================================================================
-- STEP 3: Add indexes for performance (since we're no longer using foreign keys)
-- ============================================================================

-- Add index on skill names for faster searches
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_name ON profile_skills(skill_id);

-- Add index on certification names for faster searches  
CREATE INDEX IF NOT EXISTS idx_profile_certifications_cert_name ON profile_certifications(certification_id);

-- ============================================================================
-- STEP 4: Update RLS policies (if needed)
-- ============================================================================

-- The existing RLS policies should still work since they're based on profile_id
-- But let's make sure they exist and are correct

-- Drop and recreate RLS policies for profile_skills
DROP POLICY IF EXISTS "Users can manage their own profile skills" ON profile_skills;
CREATE POLICY "Users can manage their own profile skills"
ON profile_skills FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_skills.profile_id 
        AND profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_skills.profile_id 
        AND profiles.user_id = auth.uid()
    )
);

-- Allow public to view skills for public profiles
DROP POLICY IF EXISTS "Public can view skills for public profiles" ON profile_skills;
CREATE POLICY "Public can view skills for public profiles"
ON profile_skills FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_skills.profile_id 
        AND profiles.is_public = true
    )
);

-- Drop and recreate RLS policies for profile_certifications
DROP POLICY IF EXISTS "Users can manage their own profile certifications" ON profile_certifications;
CREATE POLICY "Users can manage their own profile certifications"
ON profile_certifications FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_certifications.profile_id 
        AND profiles.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_certifications.profile_id 
        AND profiles.user_id = auth.uid()
    )
);

-- Allow public to view certifications for public profiles
DROP POLICY IF EXISTS "Public can view certifications for public profiles" ON profile_certifications;
CREATE POLICY "Public can view certifications for public profiles"
ON profile_certifications FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = profile_certifications.profile_id 
        AND profiles.is_public = true
    )
);

-- ============================================================================
-- STEP 5: Verification queries
-- ============================================================================

-- Verify the changes
SELECT 'Skills table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profile_skills' 
ORDER BY ordinal_position;

SELECT 'Certifications table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profile_certifications' 
ORDER BY ordinal_position;

-- Check if there are any remaining numeric skill_ids (should be none after migration)
SELECT 'Remaining numeric skill_ids:' as info;
SELECT COUNT(*) as count
FROM profile_skills 
WHERE skill_id ~ '^[0-9]+$';

-- Check if there are any remaining numeric certification_ids (should be none after migration)
SELECT 'Remaining numeric certification_ids:' as info;
SELECT COUNT(*) as count
FROM profile_certifications 
WHERE certification_id ~ '^[0-9]+$';

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The skills and certifications lookup tables are preserved for reference
-- 2. Existing data is migrated from IDs to names automatically
-- 3. New entries can now store skill/certification names directly as text
-- 4. The profile display code already handles both formats (skill.skills?.name || skill.skill_id)
-- 5. RLS policies are updated to work with the new structure
-- ============================================================================
