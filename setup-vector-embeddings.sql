-- VECTOR EMBEDDINGS SETUP FOR SEMANTIC SEARCH
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- STEP 1: ENABLE PGVECTOR EXTENSION
-- =============================================================================

-- Enable the pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- STEP 2: ADD EMBEDDING COLUMNS TO PROFILES TABLE
-- =============================================================================

-- Add embedding column for profile content (bio + skills + certifications)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Add index for fast vector similarity search
CREATE INDEX IF NOT EXISTS profiles_content_embedding_idx 
ON profiles 
USING ivfflat (content_embedding vector_cosine_ops) 
WITH (lists = 100);

-- Add embedding metadata
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS embedding_generated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS embedding_content_hash text;

-- =============================================================================
-- STEP 3: CREATE EMBEDDING CONTENT VIEW
-- =============================================================================

-- Function to generate searchable content for embeddings
CREATE OR REPLACE FUNCTION get_profile_embedding_content(profile_id uuid)
RETURNS text AS $$
DECLARE
    result text;
    profile_data record;
    skills_text text;
    certs_text text;
BEGIN
    -- Get basic profile data
    SELECT 
        full_name, bio, location, city, state, 
        gender, ethnicity, hair_color, eye_color,
        height_feet, height_inches, weight_lbs
    INTO profile_data
    FROM profiles 
    WHERE id = profile_id;
    
    -- Get skills
    SELECT string_agg(skill_id || ' (' || proficiency_level || ')', ', ')
    INTO skills_text
    FROM profile_skills 
    WHERE profile_skills.profile_id = get_profile_embedding_content.profile_id;
    
    -- Get certifications
    SELECT string_agg(certification_id, ', ')
    INTO certs_text
    FROM profile_certifications 
    WHERE profile_certifications.profile_id = get_profile_embedding_content.profile_id;
    
    -- Build comprehensive content string
    result := '';
    
    IF profile_data.full_name IS NOT NULL THEN
        result := result || 'Name: ' || profile_data.full_name || '. ';
    END IF;
    
    IF profile_data.bio IS NOT NULL THEN
        result := result || 'Bio: ' || profile_data.bio || '. ';
    END IF;
    
    IF profile_data.location IS NOT NULL OR profile_data.city IS NOT NULL THEN
        result := result || 'Location: ' || 
                  COALESCE(profile_data.city || ', ' || profile_data.state, profile_data.location) || '. ';
    END IF;
    
    IF profile_data.gender IS NOT NULL THEN
        result := result || 'Gender: ' || profile_data.gender || '. ';
    END IF;
    
    IF profile_data.ethnicity IS NOT NULL THEN
        result := result || 'Ethnicity: ' || profile_data.ethnicity || '. ';
    END IF;
    
    IF profile_data.height_feet IS NOT NULL AND profile_data.height_inches IS NOT NULL THEN
        result := result || 'Height: ' || profile_data.height_feet || ' feet ' || 
                  profile_data.height_inches || ' inches. ';
    END IF;
    
    IF profile_data.weight_lbs IS NOT NULL THEN
        result := result || 'Weight: ' || profile_data.weight_lbs || ' lbs. ';
    END IF;
    
    IF profile_data.hair_color IS NOT NULL THEN
        result := result || 'Hair: ' || profile_data.hair_color || '. ';
    END IF;
    
    IF profile_data.eye_color IS NOT NULL THEN
        result := result || 'Eyes: ' || profile_data.eye_color || '. ';
    END IF;
    
    IF skills_text IS NOT NULL THEN
        result := result || 'Skills: ' || skills_text || '. ';
    END IF;
    
    IF certs_text IS NOT NULL THEN
        result := result || 'Certifications: ' || certs_text || '. ';
    END IF;
    
    RETURN TRIM(result);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STEP 4: CREATE SEARCH FUNCTIONS
-- =============================================================================

-- Function for semantic similarity search
CREATE OR REPLACE FUNCTION search_profiles_by_embedding(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.8,
    max_results int DEFAULT 50
)
RETURNS TABLE(
    id uuid,
    full_name text,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        (1 - (p.content_embedding <=> query_embedding)) as similarity
    FROM profiles p
    WHERE 
        p.content_embedding IS NOT NULL 
        AND p.is_public = true
        AND (1 - (p.content_embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY p.content_embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STEP 5: SAMPLE USAGE QUERIES
-- =============================================================================

-- Check if extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verify the new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE '%embedding%';

-- Test the embedding content function
SELECT 
    id, 
    full_name,
    get_profile_embedding_content(id) as embedding_content
FROM profiles 
WHERE is_public = true 
LIMIT 3;

-- Check index creation
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' AND indexname LIKE '%embedding%';
