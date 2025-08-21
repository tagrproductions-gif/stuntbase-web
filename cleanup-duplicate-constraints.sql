-- =====================================================
-- CLEANUP DUPLICATE FOREIGN KEY CONSTRAINTS
-- You have duplicate constraints - this removes the extras
-- =====================================================

-- Remove the newer constraints (keeping the original ones)
ALTER TABLE profile_photos DROP CONSTRAINT IF EXISTS fk_profile_photos_profile_id;
ALTER TABLE profile_skills DROP CONSTRAINT IF EXISTS fk_profile_skills_profile_id;
ALTER TABLE profile_certifications DROP CONSTRAINT IF EXISTS fk_profile_certifications_profile_id;
ALTER TABLE profile_views DROP CONSTRAINT IF EXISTS fk_profile_views_profile_id;

-- Verify we still have the CASCADE constraints
SELECT 'REMAINING FOREIGN KEY CONSTRAINTS:' as info;
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
