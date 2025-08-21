-- =====================================================
-- 2. ADD FOREIGN KEY CONSTRAINTS WITH CASCADE DELETES
-- This prevents orphan data by automatically cleaning up related records
-- =====================================================

BEGIN;

-- Add foreign key constraint for profile_photos -> profiles
-- This ensures when a profile is deleted, all its photos are automatically deleted
ALTER TABLE profile_photos 
DROP CONSTRAINT IF EXISTS fk_profile_photos_profile_id;

ALTER TABLE profile_photos 
ADD CONSTRAINT fk_profile_photos_profile_id 
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for profile_skills -> profiles  
-- This ensures when a profile is deleted, all its skills are automatically deleted
ALTER TABLE profile_skills 
DROP CONSTRAINT IF EXISTS fk_profile_skills_profile_id;

ALTER TABLE profile_skills 
ADD CONSTRAINT fk_profile_skills_profile_id 
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for profile_certifications -> profiles
-- This ensures when a profile is deleted, all its certifications are automatically deleted  
ALTER TABLE profile_certifications 
DROP CONSTRAINT IF EXISTS fk_profile_certifications_profile_id;

ALTER TABLE profile_certifications 
ADD CONSTRAINT fk_profile_certifications_profile_id 
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for profile_views -> profiles (if it exists)
-- This ensures when a profile is deleted, all its view records are automatically deleted
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_views') THEN
        ALTER TABLE profile_views 
        DROP CONSTRAINT IF EXISTS fk_profile_views_profile_id;
        
        ALTER TABLE profile_views 
        ADD CONSTRAINT fk_profile_views_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance on foreign key columns
CREATE INDEX IF NOT EXISTS idx_profile_photos_profile_id ON profile_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_certifications_profile_id ON profile_certifications(profile_id);

-- Verify the constraints were added
SELECT 'FOREIGN KEY CONSTRAINTS ADDED:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('profile_photos', 'profile_skills', 'profile_certifications', 'profile_views')
ORDER BY tc.table_name, tc.constraint_name;

COMMIT;

-- =====================================================
-- IMPORTANT REPERCUSSIONS OF THIS CHANGE:
-- =====================================================
-- ✅ POSITIVE:
-- - Automatic cleanup of related data when profiles are deleted
-- - Prevents orphaned records in profile_photos, profile_skills, profile_certifications
-- - Database ensures referential integrity
-- - No more need for manual cleanup in deleteProfileAction()
--
-- ⚠️  POTENTIAL ISSUES:
-- - If there's existing orphaned data, this migration might fail
-- - Applications must handle cascade delete behavior
-- - Cannot delete profiles if related tables have issues
--
-- 🔧 BEFORE/AFTER:
-- BEFORE: Manual deletion in code: deleteProfileAction() explicitly deletes related records
-- AFTER: Automatic deletion: Database handles cleanup via CASCADE constraints
-- =====================================================
