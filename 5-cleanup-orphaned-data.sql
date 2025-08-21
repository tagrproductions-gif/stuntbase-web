-- =====================================================
-- 5. CLEANUP EXISTING ORPHANED DATA
-- Run this to clean up any existing orphaned data before adding constraints
-- =====================================================

-- Backup orphaned data before deletion (for safety)
CREATE TEMP TABLE orphaned_photos_backup AS
SELECT pp.*, 'orphaned - no matching profile' as reason
FROM profile_photos pp
LEFT JOIN profiles p ON pp.profile_id = p.id
WHERE p.id IS NULL;

CREATE TEMP TABLE orphaned_skills_backup AS
SELECT ps.*, 'orphaned - no matching profile' as reason
FROM profile_skills ps
LEFT JOIN profiles p ON ps.profile_id = p.id
WHERE p.id IS NULL;

CREATE TEMP TABLE orphaned_certs_backup AS
SELECT pc.*, 'orphaned - no matching profile' as reason
FROM profile_certifications pc
LEFT JOIN profiles p ON pc.profile_id = p.id
WHERE p.id IS NULL;

-- Show what we found before deletion
SELECT 'ORPHANED DATA FOUND:' as info;

SELECT COUNT(*) as orphaned_photos_count
FROM orphaned_photos_backup;

SELECT COUNT(*) as orphaned_skills_count
FROM orphaned_skills_backup;

SELECT COUNT(*) as orphaned_certs_count
FROM orphaned_certs_backup;

-- Show details of orphaned photos (these files should be cleaned from storage)
SELECT 'ORPHANED PHOTOS DETAILS:' as info;
SELECT id, profile_id, file_path, file_name, created_at
FROM orphaned_photos_backup
ORDER BY created_at DESC;

-- Delete orphaned data
DELETE FROM profile_photos 
WHERE id IN (SELECT id FROM orphaned_photos_backup);

DELETE FROM profile_skills 
WHERE id IN (SELECT id FROM orphaned_skills_backup);

DELETE FROM profile_certifications 
WHERE id IN (SELECT id FROM orphaned_certs_backup);

-- Also clean up any profile_views for non-existent profiles (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_views') THEN
        CREATE TEMP TABLE orphaned_views_backup AS
        SELECT pv.*, 'orphaned - no matching profile' as reason
        FROM profile_views pv
        LEFT JOIN profiles p ON pv.profile_id = p.id
        WHERE p.id IS NULL;
        
        DELETE FROM profile_views 
        WHERE id IN (SELECT id FROM orphaned_views_backup);
        
        RAISE NOTICE 'Cleaned up % orphaned profile views', (SELECT COUNT(*) FROM orphaned_views_backup);
    END IF;
END $$;

-- Verify cleanup
SELECT 'ORPHANED DATA AFTER CLEANUP:' as info;

SELECT COUNT(*) as remaining_orphaned_photos
FROM profile_photos pp
LEFT JOIN profiles p ON pp.profile_id = p.id
WHERE p.id IS NULL;

SELECT COUNT(*) as remaining_orphaned_skills
FROM profile_skills ps
LEFT JOIN profiles p ON ps.profile_id = p.id
WHERE p.id IS NULL;

SELECT COUNT(*) as remaining_orphaned_certs
FROM profile_certifications pc
LEFT JOIN profiles p ON pc.profile_id = p.id
WHERE p.id IS NULL;

-- Create function to identify storage files that should be cleaned up
CREATE OR REPLACE FUNCTION get_storage_cleanup_list()
RETURNS TABLE(
    bucket_name TEXT,
    file_path TEXT,
    reason TEXT
) AS $$
BEGIN
    -- Return storage paths from the orphaned photos we just deleted
    RETURN QUERY
    SELECT 
        'profile-photos'::TEXT,
        regexp_replace(opb.file_path, '.*\/profile-photos\/', ''),
        'orphaned photo - profile deleted'::TEXT
    FROM orphaned_photos_backup opb;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Show storage cleanup list
SELECT 'STORAGE FILES TO CLEANUP:' as info;
SELECT * FROM get_storage_cleanup_list();

-- =====================================================
-- MANUAL STORAGE CLEANUP REQUIRED:
-- =====================================================
-- The above query shows storage files that should be deleted.
-- You need to delete these manually from Supabase Storage or via your app:
-- 
-- 1. Go to Supabase Dashboard > Storage > profile-photos
-- 2. Delete the files listed above
-- 
-- OR use the Supabase CLI:
-- supabase storage rm profile-photos [file-path]
-- 
-- OR use your application's deleteResume/deletePhoto functions
-- =====================================================

-- Drop the temporary backup tables (uncomment if you're sure)
-- DROP TABLE orphaned_photos_backup;
-- DROP TABLE orphaned_skills_backup;  
-- DROP TABLE orphaned_certs_backup;
