-- =====================================================
-- 4. CREATE SAFER UPLOAD FUNCTIONS WITH TRANSACTION SUPPORT
-- These functions help prevent orphan data during upload operations
-- =====================================================

-- Create function for safe profile creation with resume
CREATE OR REPLACE FUNCTION create_profile_with_resume(
    p_user_id UUID,
    p_profile_data JSONB,
    p_skills JSONB DEFAULT '[]'::JSONB,
    p_certifications JSONB DEFAULT '[]'::JSONB,
    p_resume_data JSONB DEFAULT NULL
) RETURNS TABLE(
    profile_id UUID,
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    new_profile_id UUID;
    skill_record JSONB;
    cert_record JSONB;
BEGIN
    -- Start transaction
    BEGIN
        -- Insert the profile
        INSERT INTO profiles (
            user_id,
            full_name,
            email,
            bio,
            location,
            secondary_location,
            primary_location_structured,
            secondary_location_structured,
            travel_radius,
            phone,
            hair_color,
            ethnicity,
            gender,
            union_status,
            loan_out_status,
            website,
            imdb_url,
            reel_url,
            resume_url,
            resume_filename,
            resume_file_size,
            resume_uploaded_at,
            availability_status,
            height_feet,
            height_inches,
            weight_lbs,
            shirt_neck,
            shirt_sleeve,
            pants_waist,
            pants_inseam,
            shoe_size,
            t_shirt_size,
            hat_size,
            glove_size,
            jacket_size,
            jacket_length,
            dress_size,
            pants_size,
            underbust,
            hips,
            chest,
            waist,
            is_public
        ) VALUES (
            p_user_id,
            (p_profile_data->>'full_name')::TEXT,
            (p_profile_data->>'email')::TEXT,
            NULLIF(p_profile_data->>'bio', ''),
            NULLIF(p_profile_data->>'location', ''),
            NULLIF(p_profile_data->>'secondary_location', ''),
            (p_profile_data->'primary_location_structured'),
            (p_profile_data->'secondary_location_structured'),
            COALESCE((p_profile_data->>'travel_radius')::TEXT, 'local'),
            NULLIF(p_profile_data->>'phone', ''),
            NULLIF(p_profile_data->>'hair_color', ''),
            NULLIF(p_profile_data->>'ethnicity', ''),
            NULLIF(p_profile_data->>'gender', ''),
            NULLIF(p_profile_data->>'union_status', ''),
            COALESCE((p_profile_data->>'loan_out_status')::TEXT, 'Unknown'),
            NULLIF(p_profile_data->>'website', ''),
            NULLIF(p_profile_data->>'imdb_url', ''),
            NULLIF(p_profile_data->>'reel_url', ''),
            NULLIF(p_resume_data->>'url', ''),
            NULLIF(p_resume_data->>'fileName', ''),
            (p_resume_data->>'fileSize')::INTEGER,
            CASE WHEN p_resume_data IS NOT NULL THEN NOW() ELSE NULL END,
            NULLIF(p_profile_data->>'availability_status', ''),
            (p_profile_data->>'height_feet')::INTEGER,
            (p_profile_data->>'height_inches')::INTEGER,
            (p_profile_data->>'weight_lbs')::INTEGER,
            (p_profile_data->>'shirt_neck')::INTEGER,
            (p_profile_data->>'shirt_sleeve')::INTEGER,
            (p_profile_data->>'pants_waist')::INTEGER,
            (p_profile_data->>'pants_inseam')::INTEGER,
            (p_profile_data->>'shoe_size')::INTEGER,
            NULLIF(p_profile_data->>'t_shirt_size', ''),
            NULLIF(p_profile_data->>'hat_size', ''),
            NULLIF(p_profile_data->>'glove_size', ''),
            (p_profile_data->>'jacket_size')::INTEGER,
            NULLIF(p_profile_data->>'jacket_length', ''),
            (p_profile_data->>'dress_size')::INTEGER,
            (p_profile_data->>'pants_size')::INTEGER,
            (p_profile_data->>'underbust')::INTEGER,
            (p_profile_data->>'hips')::INTEGER,
            (p_profile_data->>'chest')::INTEGER,
            (p_profile_data->>'waist')::INTEGER,
            COALESCE((p_profile_data->>'is_public')::BOOLEAN, true)
        ) RETURNING id INTO new_profile_id;

        -- Insert skills
        FOR skill_record IN SELECT * FROM jsonb_array_elements(p_skills)
        LOOP
            INSERT INTO profile_skills (profile_id, skill_id, proficiency_level)
            VALUES (
                new_profile_id,
                (skill_record->>'skill_id')::TEXT,
                (skill_record->>'proficiency_level')::TEXT
            );
        END LOOP;

        -- Insert certifications
        FOR cert_record IN SELECT * FROM jsonb_array_elements(p_certifications)
        LOOP
            INSERT INTO profile_certifications (profile_id, certification_id, date_obtained, expiry_date, certification_number)
            VALUES (
                new_profile_id,
                (cert_record->>'certification_id')::TEXT,
                (cert_record->>'date_obtained')::DATE,
                (cert_record->>'expiry_date')::DATE,
                NULLIF(cert_record->>'certification_number', '')
            );
        END LOOP;

        -- Return success
        RETURN QUERY SELECT new_profile_id, true, NULL::TEXT;

    EXCEPTION WHEN OTHERS THEN
        -- Return error
        RETURN QUERY SELECT NULL::UUID, false, SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for safe photo addition
CREATE OR REPLACE FUNCTION add_profile_photo_safe(
    p_profile_id UUID,
    p_file_path TEXT,
    p_file_name TEXT,
    p_is_primary BOOLEAN DEFAULT false,
    p_user_id UUID DEFAULT NULL
) RETURNS TABLE(
    photo_id UUID,
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    new_photo_id UUID;
    max_sort_order INTEGER;
BEGIN
    -- Verify ownership if user_id provided
    IF p_user_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = p_profile_id AND user_id = p_user_id
        ) THEN
            RETURN QUERY SELECT NULL::UUID, false, 'Unauthorized access'::TEXT;
            RETURN;
        END IF;
    END IF;

    BEGIN
        -- Get next sort order
        SELECT COALESCE(MAX(sort_order), 0) + 1 
        INTO max_sort_order
        FROM profile_photos 
        WHERE profile_id = p_profile_id;

        -- Insert photo record
        INSERT INTO profile_photos (profile_id, file_path, file_name, is_primary, sort_order)
        VALUES (p_profile_id, p_file_path, p_file_name, p_is_primary, max_sort_order)
        RETURNING id INTO new_photo_id;

        -- Return success
        RETURN QUERY SELECT new_photo_id, true, NULL::TEXT;

    EXCEPTION WHEN OTHERS THEN
        -- Return error
        RETURN QUERY SELECT NULL::UUID, false, SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check for orphaned storage files
CREATE OR REPLACE FUNCTION find_orphaned_storage_references()
RETURNS TABLE(
    table_name TEXT,
    record_id UUID,
    file_reference TEXT,
    issue_type TEXT
) AS $$
BEGIN
    -- Find profile photos that reference non-existent profiles
    RETURN QUERY
    SELECT 
        'profile_photos'::TEXT,
        pp.id,
        pp.file_path,
        'orphaned_photo_record'::TEXT
    FROM profile_photos pp
    LEFT JOIN profiles p ON pp.profile_id = p.id
    WHERE p.id IS NULL;

    -- Find profiles with resume URLs that might be orphaned
    -- (This is harder to detect without checking actual storage)
    RETURN QUERY
    SELECT 
        'profiles'::TEXT,
        p.id,
        p.resume_url,
        'potential_orphaned_resume'::TEXT
    FROM profiles p
    WHERE p.resume_url IS NOT NULL
    AND p.resume_url != '';

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_profile_with_resume TO authenticated;
GRANT EXECUTE ON FUNCTION add_profile_photo_safe TO authenticated;
GRANT EXECUTE ON FUNCTION find_orphaned_storage_references TO authenticated;

SELECT 'TRANSACTION-SAFE FUNCTIONS CREATED:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'create_profile_with_resume',
        'add_profile_photo_safe', 
        'find_orphaned_storage_references'
    )
ORDER BY routine_name;

-- =====================================================
-- HOW TO USE THESE FUNCTIONS:
-- =====================================================
-- 1. create_profile_with_resume(): Creates profile + skills + certs in one transaction
-- 2. add_profile_photo_safe(): Safely adds photo with ownership verification
-- 3. find_orphaned_storage_references(): Finds potential orphaned records
--
-- REPERCUSSIONS:
-- ✅ BEFORE: Multi-step operations could fail partway and leave inconsistent data
-- ✅ AFTER: Atomic operations ensure all-or-nothing success
-- 
-- ⚠️  NOTE: Your existing code will continue to work - these are additional
-- safer alternatives that you can optionally migrate to
-- =====================================================
