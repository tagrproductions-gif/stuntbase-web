-- PROJECT DATABASES SCHEMA
-- Run this in your Supabase SQL Editor
-- Creates tables for stunt coordinator project-specific databases

-- =============================================================================
-- STEP 1: CREATE PROJECT DATABASES TABLE
-- =============================================================================

-- Table to store project databases created by coordinators
CREATE TABLE IF NOT EXISTS project_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE project_databases IS 'Project-specific databases created by stunt coordinators';
COMMENT ON COLUMN project_databases.creator_user_id IS 'User ID of the coordinator who created this project';
COMMENT ON COLUMN project_databases.project_name IS 'Name of the project (e.g., "Stranger Things Season 5")';
COMMENT ON COLUMN project_databases.description IS 'Optional description of the project';
COMMENT ON COLUMN project_databases.is_active IS 'Whether the project is accepting submissions';

-- =============================================================================
-- STEP 2: CREATE PROJECT SUBMISSIONS TABLE
-- =============================================================================

-- Junction table linking profiles to project databases
CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project_databases(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  
  -- Ensure a profile can only submit once per project
  UNIQUE(project_id, profile_id)
);

-- Add comments for documentation
COMMENT ON TABLE project_submissions IS 'Tracks which profiles have submitted to which project databases';
COMMENT ON COLUMN project_submissions.project_id IS 'Reference to the project database';
COMMENT ON COLUMN project_submissions.profile_id IS 'Reference to the submitted profile';
COMMENT ON COLUMN project_submissions.status IS 'Submission status (pending, approved, rejected)';
COMMENT ON COLUMN project_submissions.notes IS 'Optional notes from coordinator about submission';

-- =============================================================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- =============================================================================

-- Index for fast project lookups by creator
CREATE INDEX IF NOT EXISTS idx_project_databases_creator ON project_databases(creator_user_id);

-- Index for active projects
CREATE INDEX IF NOT EXISTS idx_project_databases_active ON project_databases(is_active) WHERE is_active = TRUE;

-- Index for fast project submission lookups
CREATE INDEX IF NOT EXISTS idx_project_submissions_project ON project_submissions(project_id);

-- Index for profile submission history
CREATE INDEX IF NOT EXISTS idx_project_submissions_profile ON project_submissions(profile_id);

-- Composite index for project + status queries
CREATE INDEX IF NOT EXISTS idx_project_submissions_project_status ON project_submissions(project_id, status);

-- =============================================================================
-- STEP 4: CREATE UPDATED_AT TRIGGER FOR PROJECT DATABASES
-- =============================================================================

-- Ensure updated_at is automatically updated
CREATE OR REPLACE FUNCTION update_project_databases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_project_databases_updated_at ON project_databases;
CREATE TRIGGER update_project_databases_updated_at
    BEFORE UPDATE ON project_databases
    FOR EACH ROW
    EXECUTE FUNCTION update_project_databases_updated_at();

-- =============================================================================
-- STEP 5: CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE project_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Project databases policies
-- Anyone can view active project databases
CREATE POLICY "Anyone can view active project databases" ON project_databases
    FOR SELECT USING (is_active = TRUE);

-- Only authenticated users can create project databases
CREATE POLICY "Authenticated users can create project databases" ON project_databases
    FOR INSERT WITH CHECK (auth.uid() = creator_user_id);

-- Only creators can update their own project databases
CREATE POLICY "Creators can update own project databases" ON project_databases
    FOR UPDATE USING (auth.uid() = creator_user_id);

-- Only creators can delete their own project databases
CREATE POLICY "Creators can delete own project databases" ON project_databases
    FOR DELETE USING (auth.uid() = creator_user_id);

-- Project submissions policies
-- Project creators can view all submissions to their projects
CREATE POLICY "Project creators can view submissions" ON project_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_databases 
            WHERE project_databases.id = project_submissions.project_id 
            AND project_databases.creator_user_id = auth.uid()
        )
        OR 
        -- Users can view their own submissions
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = project_submissions.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Only profile owners can submit their profiles
CREATE POLICY "Profile owners can submit to projects" ON project_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = project_submissions.profile_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- Project creators can update submission status
CREATE POLICY "Project creators can update submission status" ON project_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_databases 
            WHERE project_databases.id = project_submissions.project_id 
            AND project_databases.creator_user_id = auth.uid()
        )
    );

-- =============================================================================
-- STEP 6: VERIFICATION QUERIES
-- =============================================================================

-- Verify tables were created
SELECT 'PROJECT DATABASES SCHEMA CREATED SUCCESSFULLY' as status;

-- Show table structures
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('project_databases', 'project_submissions')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Show indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('project_databases', 'project_submissions')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Show foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('project_databases', 'project_submissions')
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
