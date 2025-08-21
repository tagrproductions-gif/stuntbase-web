-- =====================================================
-- 3. CREATE STORAGE CLEANUP FUNCTIONS AND TRIGGERS
-- This handles automatic cleanup of files in Supabase Storage
-- =====================================================

-- Create function to clean up profile photos from storage
CREATE OR REPLACE FUNCTION cleanup_profile_photos_storage()
RETURNS TRIGGER AS $$
DECLARE
    photo_record RECORD;
    storage_path TEXT;
BEGIN
    -- Loop through all photos for this profile and delete from storage
    FOR photo_record IN 
        SELECT file_path FROM profile_photos WHERE profile_id = OLD.id
    LOOP
        -- Extract storage path from public URL
        -- URLs look like: https://...supabase.co/storage/v1/object/public/profile-photos/{storage-path}
        storage_path := regexp_replace(photo_record.file_path, '.*\/profile-photos\/', '');
        
        -- Delete from storage (this is a simplified approach - in reality you'd call a Supabase Edge Function)
        -- For now, we'll log what should be deleted
        RAISE NOTICE 'Should delete photo from storage: profile-photos/%', storage_path;
    END LOOP;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up resume from storage  
CREATE OR REPLACE FUNCTION cleanup_resume_storage()
RETURNS TRIGGER AS $$
DECLARE
    storage_path TEXT;
BEGIN
    -- Check if profile has a resume to clean up
    IF OLD.resume_url IS NOT NULL THEN
        -- Extract storage path from public URL
        -- URLs look like: https://...supabase.co/storage/v1/object/public/resumes/{storage-path}
        storage_path := regexp_replace(OLD.resume_url, '.*\/resumes\/', '');
        
        -- Delete from storage (this is a simplified approach - in reality you'd call a Supabase Edge Function)
        -- For now, we'll log what should be deleted
        RAISE NOTICE 'Should delete resume from storage: resumes/%', storage_path;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create combined cleanup function that handles both photos and resume
CREATE OR REPLACE FUNCTION cleanup_profile_storage()
RETURNS TRIGGER AS $$
DECLARE
    photo_record RECORD;
    photo_storage_path TEXT;
    resume_storage_path TEXT;
BEGIN
    -- Clean up photos
    FOR photo_record IN 
        SELECT file_path FROM profile_photos WHERE profile_id = OLD.id
    LOOP
        photo_storage_path := regexp_replace(photo_record.file_path, '.*\/profile-photos\/', '');
        RAISE NOTICE 'Profile cleanup - Should delete photo: profile-photos/%', photo_storage_path;
    END LOOP;
    
    -- Clean up resume
    IF OLD.resume_url IS NOT NULL THEN
        resume_storage_path := regexp_replace(OLD.resume_url, '.*\/resumes\/', '');
        RAISE NOTICE 'Profile cleanup - Should delete resume: resumes/%', resume_storage_path;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs BEFORE profile deletion to clean up storage
DROP TRIGGER IF EXISTS profile_storage_cleanup_trigger ON profiles;
CREATE TRIGGER profile_storage_cleanup_trigger
    BEFORE DELETE ON profiles
    FOR EACH ROW 
    EXECUTE FUNCTION cleanup_profile_storage();

-- Create function to clean up individual photo from storage
CREATE OR REPLACE FUNCTION cleanup_single_photo_storage()
RETURNS TRIGGER AS $$
DECLARE
    storage_path TEXT;
BEGIN
    -- Extract storage path from the deleted photo's file_path
    storage_path := regexp_replace(OLD.file_path, '.*\/profile-photos\/', '');
    RAISE NOTICE 'Photo deletion - Should delete from storage: profile-photos/%', storage_path;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for individual photo deletion
DROP TRIGGER IF EXISTS photo_storage_cleanup_trigger ON profile_photos;
CREATE TRIGGER photo_storage_cleanup_trigger
    BEFORE DELETE ON profile_photos
    FOR EACH ROW 
    EXECUTE FUNCTION cleanup_single_photo_storage();

-- Test the triggers (optional)
SELECT 'STORAGE CLEANUP TRIGGERS CREATED:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND event_object_table IN ('profiles', 'profile_photos')
    AND trigger_name LIKE '%cleanup%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- IMPORTANT NOTES ABOUT STORAGE CLEANUP:
-- =====================================================
-- 🚨 LIMITATION: PostgreSQL triggers cannot directly call Supabase Storage API
-- 
-- ✅ WHAT THIS DOES:
-- - Logs storage paths that should be deleted via RAISE NOTICE
-- - Provides the foundation for proper cleanup
-- 
-- 🔧 TO COMPLETE STORAGE CLEANUP, YOU NEED ONE OF:
-- 1. Supabase Edge Function called by trigger
-- 2. Application-level cleanup (current approach in your code)
-- 3. Periodic cleanup job that checks for orphaned files
-- 
-- 💡 YOUR CURRENT CODE ALREADY HANDLES STORAGE CLEANUP CORRECTLY
-- in deleteProfileAction() and deletePhotoAction() - these triggers
-- provide additional safety net and logging
-- =====================================================
