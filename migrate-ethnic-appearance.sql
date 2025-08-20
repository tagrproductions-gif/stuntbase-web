-- =====================================
-- ETHNIC APPEARANCE MIGRATION & CONSTRAINTS
-- =====================================

-- 1. First, let's see what ethnic values we currently have
SELECT 'CURRENT ETHNIC VALUES' as status;

SELECT 
  ethnicity,
  COUNT(*) as count
FROM profiles 
WHERE ethnicity IS NOT NULL AND ethnicity != ''
GROUP BY ethnicity
ORDER BY count DESC;

-- 2. Map existing ethnic values to the new structured values
SELECT 'MIGRATING EXISTING DATA' as status;

-- Update Caucasian/White variations
UPDATE profiles 
SET ethnicity = 'WHITE'
WHERE LOWER(ethnicity) SIMILAR TO '%(white|caucasian|european)%';

-- Update Black/African variations
UPDATE profiles 
SET ethnicity = 'BLACK'
WHERE LOWER(ethnicity) SIMILAR TO '%(black|african|afro)%';

-- Update Asian variations
UPDATE profiles 
SET ethnicity = 'ASIAN'
WHERE LOWER(ethnicity) SIMILAR TO '%(asian|chinese|japanese|korean|indian|vietnamese|thai|filipino)%';

-- Update Hispanic/Latino variations
UPDATE profiles 
SET ethnicity = 'HISPANIC'
WHERE LOWER(ethnicity) SIMILAR TO '%(hispanic|latino|latina|mexican|spanish|puerto rican)%';

-- Update Middle Eastern variations
UPDATE profiles 
SET ethnicity = 'MIDDLE_EASTERN'
WHERE LOWER(ethnicity) SIMILAR TO '%(middle eastern|arab|persian|turkish|lebanese|iranian)%';

-- 3. Check for any remaining unmapped values
SELECT 'UNMAPPED VALUES (need manual review)' as status;

SELECT 
  ethnicity,
  COUNT(*) as count
FROM profiles 
WHERE ethnicity IS NOT NULL 
  AND ethnicity != ''
  AND ethnicity NOT IN ('WHITE', 'BLACK', 'ASIAN', 'HISPANIC', 'MIDDLE_EASTERN')
GROUP BY ethnicity
ORDER BY count DESC;

-- 4. Add database constraint to enforce only valid values
SELECT 'ADDING DATABASE CONSTRAINTS' as status;

-- Add check constraint for ethnic appearance values
ALTER TABLE profiles 
ADD CONSTRAINT valid_ethnicity 
CHECK (ethnicity IS NULL OR ethnicity IN ('WHITE', 'BLACK', 'ASIAN', 'HISPANIC', 'MIDDLE_EASTERN'));

-- 5. Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON profiles(ethnicity) WHERE ethnicity IS NOT NULL;

-- 6. Final verification
SELECT 'FINAL VERIFICATION' as status;

SELECT 
  ethnicity,
  COUNT(*) as count
FROM profiles 
GROUP BY ethnicity
ORDER BY count DESC;

SELECT 'MIGRATION COMPLETE ✅' as status;
