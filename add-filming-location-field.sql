-- ADD FILMING LOCATION FIELD TO PROJECT DATABASES
-- Run this in your Supabase SQL Editor
-- Adds a primary filming location field for project databases

-- =============================================================================
-- STEP 1: ADD FILMING LOCATION COLUMN
-- =============================================================================

-- Add filming_location field to project_databases table
ALTER TABLE project_databases
ADD COLUMN IF NOT EXISTS filming_location TEXT;

-- Add comment for the new field
COMMENT ON COLUMN project_databases.filming_location IS 'Primary filming location for the project (free text input)';

-- =============================================================================
-- STEP 2: UPDATE EXISTING PROJECTS (OPTIONAL)
-- =============================================================================

-- You can optionally set a default value for existing projects
-- UPDATE project_databases 
-- SET filming_location = 'Location TBD' 
-- WHERE filming_location IS NULL;

-- =============================================================================
-- STEP 3: VERIFICATION
-- =============================================================================

-- Verify the column was added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'project_databases'
AND column_name = 'filming_location'
AND table_schema = 'public';

-- Show updated table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'project_databases'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test query to see the new field
SELECT 
    id,
    project_name,
    filming_location,
    description,
    created_at
FROM project_databases
LIMIT 5;

SELECT 'FILMING LOCATION FIELD ADDED SUCCESSFULLY' as status;
