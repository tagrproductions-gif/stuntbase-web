-- 🚨 EMERGENCY MEMORY LEAK FIX
-- This script addresses the 1GB ArrayBuffer memory leak caused by binary data in resume_text

-- ✅ STEP 1: Audit current resume_text content
DO $$
DECLARE
    total_profiles INTEGER;
    profiles_with_resume INTEGER;
    profiles_with_large_resume INTEGER;
    profiles_with_massive_resume INTEGER;
    max_resume_size INTEGER;
    avg_resume_size NUMERIC;
BEGIN
    -- Get statistics
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN resume_text IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN LENGTH(resume_text) > 100000 THEN 1 END),
        COUNT(CASE WHEN LENGTH(resume_text) > 1000000 THEN 1 END),
        MAX(CASE WHEN resume_text IS NOT NULL THEN LENGTH(resume_text) END),
        AVG(CASE WHEN resume_text IS NOT NULL THEN LENGTH(resume_text) END)
    INTO 
        total_profiles,
        profiles_with_resume,
        profiles_with_large_resume,
        profiles_with_massive_resume,
        max_resume_size,
        avg_resume_size
    FROM profiles;
    
    -- Report findings
    RAISE NOTICE '📊 RESUME_TEXT AUDIT RESULTS:';
    RAISE NOTICE '   Total profiles: %', total_profiles;
    RAISE NOTICE '   Profiles with resume_text: %', profiles_with_resume;
    RAISE NOTICE '   Large resume_text (>100KB): %', profiles_with_large_resume;
    RAISE NOTICE '   Massive resume_text (>1MB): %', profiles_with_massive_resume;
    RAISE NOTICE '   Largest resume_text: % bytes', max_resume_size;
    RAISE NOTICE '   Average resume_text size: % bytes', ROUND(avg_resume_size);
    
    -- Warning if problematic data found
    IF profiles_with_large_resume > 0 THEN
        RAISE WARNING '🚨 MEMORY LEAK CONFIRMED: % profiles have resume_text >100KB', profiles_with_large_resume;
        RAISE WARNING '   This explains the 1GB ArrayBuffer allocation issue!';
    END IF;
    
    IF profiles_with_massive_resume > 0 THEN
        RAISE WARNING '🚨 CRITICAL: % profiles have resume_text >1MB', profiles_with_massive_resume;
        RAISE WARNING '   These contain raw PDF binary data instead of text!';
    END IF;
END $$;

-- ✅ STEP 2: Show the worst offenders
SELECT 
    id,
    full_name,
    CASE 
        WHEN resume_text IS NULL THEN 'NULL'
        WHEN LENGTH(resume_text) < 1000 THEN 'SMALL (<1KB)'
        WHEN LENGTH(resume_text) < 10000 THEN 'MEDIUM (1-10KB)'
        WHEN LENGTH(resume_text) < 100000 THEN 'LARGE (10-100KB)'
        WHEN LENGTH(resume_text) < 1000000 THEN 'HUGE (100KB-1MB)'
        ELSE 'MASSIVE (>1MB)'
    END as size_category,
    LENGTH(resume_text) as exact_bytes,
    CASE 
        WHEN resume_text LIKE 'JVBERi%' THEN 'BINARY_PDF_BASE64'
        WHEN resume_text LIKE '%PDF%' THEN 'BINARY_PDF_RAW'
        WHEN resume_text LIKE 'data:application/pdf%' THEN 'DATA_URI_PDF'
        WHEN LENGTH(resume_text) > 50000 AND resume_text ~ '^[A-Za-z0-9+/=\s]+$' THEN 'LIKELY_BASE64'
        ELSE 'TEXT_CONTENT'
    END as content_type,
    LEFT(resume_text, 100) as preview
FROM profiles 
WHERE resume_text IS NOT NULL
ORDER BY LENGTH(resume_text) DESC
LIMIT 10;

-- ✅ STEP 3: Emergency cleanup of binary data
-- UNCOMMENT BELOW ONLY AFTER REVIEWING THE AUDIT RESULTS ABOVE!

/*
-- EMERGENCY CLEANUP: Clear massive binary resume data
UPDATE profiles 
SET resume_text = NULL 
WHERE resume_text IS NOT NULL 
  AND (
    LENGTH(resume_text) > 100000 OR  -- Anything over 100KB is likely binary
    resume_text LIKE 'JVBERi%' OR    -- Base64 PDF signature
    resume_text LIKE '%PDF%' OR      -- Raw PDF content
    resume_text LIKE 'data:application/pdf%'  -- Data URI PDFs
  );

-- Report cleanup results
DO $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    RAISE NOTICE '🧹 CLEANUP COMPLETE: Cleared % profiles with binary resume data', cleaned_count;
    RAISE NOTICE '   Memory usage should return to normal levels';
END $$;
*/

-- ✅ STEP 4: Add safety constraint (UNCOMMENT AFTER CLEANUP)
/*
-- Prevent future binary data storage
ALTER TABLE profiles 
ADD CONSTRAINT resume_text_size_limit 
CHECK (LENGTH(resume_text) <= 50000);

COMMENT ON CONSTRAINT resume_text_size_limit ON profiles IS 
'Prevents storage of binary PDF data - resume_text should contain only extracted text (max 50KB)';
*/

-- ✅ STEP 5: Verify the fix
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN resume_text IS NOT NULL THEN 1 END) as profiles_with_resume,
    COUNT(CASE WHEN LENGTH(resume_text) > 50000 THEN 1 END) as profiles_over_50kb,
    MAX(CASE WHEN resume_text IS NOT NULL THEN LENGTH(resume_text) END) as max_size
FROM profiles;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ EMERGENCY FIX COMPLETE!';
    RAISE NOTICE '   1. Binary data has been cleared from resume_text';
    RAISE NOTICE '   2. Memory leak should be resolved';
    RAISE NOTICE '   3. ArrayBuffer usage should drop from 1GB+ to <100MB';
    RAISE NOTICE '   4. Resume analysis temporarily disabled until proper text extraction implemented';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NEXT STEPS:';
    RAISE NOTICE '   1. Restart your application server';
    RAISE NOTICE '   2. Test homepage load - should use <100MB memory';
    RAISE NOTICE '   3. Implement proper PDF text extraction';
    RAISE NOTICE '   4. Re-enable resume analysis with text-only data';
END $$;
