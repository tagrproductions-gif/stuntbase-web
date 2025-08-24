-- ADD STUNT COORDINATORS TABLE
-- Run this in your Supabase SQL Editor
-- Creates a lightweight table for stunt coordinators who don't need full profiles

-- =============================================================================
-- STEP 1: CREATE STUNT COORDINATORS TABLE
-- =============================================================================

-- Table to store basic coordinator information
CREATE TABLE IF NOT EXISTS stunt_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coordinator_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one coordinator record per user
  UNIQUE(user_id)
);

-- Add comments for documentation
COMMENT ON TABLE stunt_coordinators IS 'Basic information for stunt coordinators who create project databases';
COMMENT ON COLUMN stunt_coordinators.user_id IS 'Reference to the auth user';
COMMENT ON COLUMN stunt_coordinators.coordinator_name IS 'Display name for the coordinator';

-- =============================================================================
-- STEP 2: CREATE PERFORMANCE INDEXES
-- =============================================================================

-- Index for fast coordinator lookups by user
CREATE INDEX IF NOT EXISTS idx_stunt_coordinators_user_id ON stunt_coordinators(user_id);

-- =============================================================================
-- STEP 3: CREATE UPDATED_AT TRIGGER
-- =============================================================================

-- Ensure updated_at is automatically updated
CREATE OR REPLACE FUNCTION update_stunt_coordinators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_stunt_coordinators_updated_at ON stunt_coordinators;
CREATE TRIGGER update_stunt_coordinators_updated_at
    BEFORE UPDATE ON stunt_coordinators
    FOR EACH ROW
    EXECUTE FUNCTION update_stunt_coordinators_updated_at();

-- =============================================================================
-- STEP 4: CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE stunt_coordinators ENABLE ROW LEVEL SECURITY;

-- Users can view their own coordinator record
CREATE POLICY "Users can view own coordinator record" ON stunt_coordinators
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own coordinator record
CREATE POLICY "Users can create own coordinator record" ON stunt_coordinators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own coordinator record
CREATE POLICY "Users can update own coordinator record" ON stunt_coordinators
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own coordinator record
CREATE POLICY "Users can delete own coordinator record" ON stunt_coordinators
    FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view coordinator names for project database display
-- (This allows showing coordinator names on public project listings)
CREATE POLICY "Anyone can view coordinator names for projects" ON stunt_coordinators
    FOR SELECT USING (true);

-- =============================================================================
-- STEP 5: MODIFY PROJECT DATABASES TABLE TO INCLUDE COORDINATOR NAME
-- =============================================================================

-- Add coordinator_name field to project_databases for easier display
-- This denormalizes the data but improves query performance
ALTER TABLE project_databases 
ADD COLUMN IF NOT EXISTS coordinator_name TEXT;

-- Add comment for the new field
COMMENT ON COLUMN project_databases.coordinator_name IS 'Cached coordinator name for display purposes';

-- =============================================================================
-- STEP 6: VERIFICATION QUERIES
-- =============================================================================

-- Verify table was created
SELECT 'STUNT COORDINATORS TABLE CREATED SUCCESSFULLY' as status;

-- Show table structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stunt_coordinators'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'stunt_coordinators'
AND schemaname = 'public'
ORDER BY indexname;
