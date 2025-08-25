-- 🔍 MEMORY LEAK AUDIT QUERIES
-- Find what's causing 1GB+ ArrayBuffer growth on page loads

-- ✅ 1. Check size of resume_text fields (main suspect)
-- This will show profiles with massive resume_text content
SELECT 
  id,
  full_name,
  CASE 
    WHEN resume_text IS NULL THEN 'NULL'
    WHEN LENGTH(resume_text) = 0 THEN 'EMPTY'
    WHEN LENGTH(resume_text) < 1000 THEN 'SMALL (<1KB)'
    WHEN LENGTH(resume_text) < 10000 THEN 'MEDIUM (1-10KB)'
    WHEN LENGTH(resume_text) < 100000 THEN 'LARGE (10-100KB)'
    WHEN LENGTH(resume_text) < 1000000 THEN 'HUGE (100KB-1MB)'
    ELSE 'MASSIVE (>1MB)'
  END as resume_text_size,
  LENGTH(resume_text) as exact_bytes,
  SUBSTRING(resume_text, 1, 100) as preview_start
FROM profiles 
WHERE resume_text IS NOT NULL
ORDER BY LENGTH(resume_text) DESC
LIMIT 20;

-- ✅ 2. Check for base64 encoded content in resume_text (PDF binary data)
-- Base64 content typically starts with specific patterns
SELECT 
  id,
  full_name,
  LENGTH(resume_text) as size_bytes,
  CASE 
    WHEN resume_text LIKE 'JVBERi%' THEN 'PDF_BASE64_START'
    WHEN resume_text LIKE '%PDF%' THEN 'CONTAINS_PDF'
    WHEN resume_text LIKE 'data:application/pdf%' THEN 'DATA_URI_PDF'
    WHEN resume_text LIKE 'data:image%' THEN 'DATA_URI_IMAGE'
    WHEN LENGTH(resume_text) > 50000 AND resume_text ~ '^[A-Za-z0-9+/=]+$' THEN 'LIKELY_BASE64'
    ELSE 'TEXT_CONTENT'
  END as content_type,
  LEFT(resume_text, 50) as start_content
FROM profiles 
WHERE resume_text IS NOT NULL 
  AND LENGTH(resume_text) > 10000
ORDER BY LENGTH(resume_text) DESC;

-- ✅ 3. Check profile_photos for large data URLs or embedded content
SELECT 
  p.id as profile_id,
  p.full_name,
  COUNT(pp.id) as photo_count,
  STRING_AGG(
    CASE 
      WHEN pp.file_path LIKE 'data:%' THEN 'DATA_URI'
      WHEN LENGTH(pp.file_path) > 1000 THEN 'LARGE_URL'
      ELSE 'NORMAL_URL'
    END, 
    ', '
  ) as photo_types,
  MAX(LENGTH(pp.file_path)) as largest_photo_path_length
FROM profiles p
LEFT JOIN profile_photos pp ON p.id = pp.profile_id
WHERE pp.file_path IS NOT NULL
GROUP BY p.id, p.full_name
HAVING MAX(LENGTH(pp.file_path)) > 100 OR COUNT(pp.id) > 5
ORDER BY largest_photo_path_length DESC;

-- ✅ 4. Check for large text fields in general
SELECT 
  'profiles' as table_name,
  id,
  full_name,
  COALESCE(LENGTH(bio), 0) as bio_length,
  COALESCE(LENGTH(resume_text), 0) as resume_text_length,
  COALESCE(LENGTH(location), 0) as location_length,
  (COALESCE(LENGTH(bio), 0) + COALESCE(LENGTH(resume_text), 0) + COALESCE(LENGTH(location), 0)) as total_text_length
FROM profiles 
WHERE (COALESCE(LENGTH(bio), 0) + COALESCE(LENGTH(resume_text), 0) + COALESCE(LENGTH(location), 0)) > 50000
ORDER BY total_text_length DESC
LIMIT 10;

-- ✅ 5. Check coordinator photos for base64 data
SELECT 
  id,
  coordinator_name,
  CASE 
    WHEN photo_url LIKE 'data:%' THEN 'DATA_URI_PHOTO'
    WHEN LENGTH(photo_url) > 1000 THEN 'LARGE_URL'
    ELSE 'NORMAL_URL'
  END as photo_type,
  LENGTH(photo_url) as photo_url_length,
  LEFT(photo_url, 100) as photo_preview
FROM stunt_coordinators 
WHERE photo_url IS NOT NULL
ORDER BY LENGTH(photo_url) DESC;

-- ✅ 6. Summary statistics
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN resume_text IS NOT NULL THEN 1 END) as profiles_with_resume,
  COUNT(CASE WHEN LENGTH(resume_text) > 100000 THEN 1 END) as profiles_with_large_resume,
  COUNT(CASE WHEN LENGTH(resume_text) > 1000000 THEN 1 END) as profiles_with_massive_resume,
  AVG(CASE WHEN resume_text IS NOT NULL THEN LENGTH(resume_text) END) as avg_resume_size,
  MAX(CASE WHEN resume_text IS NOT NULL THEN LENGTH(resume_text) END) as max_resume_size
FROM profiles;

-- 🚨 CRITICAL: Check if there are any profiles with base64 PDF content
-- This is the most likely culprit for 1GB ArrayBuffer allocations
SELECT 
  COUNT(*) as profiles_with_possible_base64_pdf
FROM profiles 
WHERE resume_text IS NOT NULL 
  AND (
    resume_text LIKE 'JVBERi%' OR  -- Base64 PDF signature
    resume_text LIKE '%PDF%' OR    -- Raw PDF content
    (LENGTH(resume_text) > 100000 AND resume_text ~ '^[A-Za-z0-9+/=\s]+$') -- Large base64-like content
  );
