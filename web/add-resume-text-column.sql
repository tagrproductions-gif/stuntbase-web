-- Add column to store extracted resume text to avoid re-parsing PDFs
-- This eliminates the need to download and parse PDFs on every search

ALTER TABLE profiles 
ADD COLUMN resume_text TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN profiles.resume_text IS 'Extracted text from PDF resume to avoid re-parsing on every search';

-- Add index for text search if needed
CREATE INDEX IF NOT EXISTS idx_profiles_resume_text ON profiles USING gin(to_tsvector('english', resume_text));
