-- CLEAN STUNT COORDINATORS SETUP
-- Run this entire script in Supabase SQL Editor

-- Create stunt_coordinators table
CREATE TABLE IF NOT EXISTS stunt_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coordinator_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add comments
COMMENT ON TABLE stunt_coordinators IS 'Basic information for stunt coordinators who create project databases';
COMMENT ON COLUMN stunt_coordinators.user_id IS 'Reference to the auth user';
COMMENT ON COLUMN stunt_coordinators.coordinator_name IS 'Display name for the coordinator';

-- Create index
CREATE INDEX IF NOT EXISTS idx_stunt_coordinators_user_id ON stunt_coordinators(user_id);

-- Create trigger function
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

-- Enable RLS
ALTER TABLE stunt_coordinators ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own coordinator record" ON stunt_coordinators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coordinator record" ON stunt_coordinators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coordinator record" ON stunt_coordinators
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coordinator record" ON stunt_coordinators
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view coordinator names for projects" ON stunt_coordinators
    FOR SELECT USING (true);

-- Add coordinator_name field to project_databases
ALTER TABLE project_databases 
ADD COLUMN IF NOT EXISTS coordinator_name TEXT;

COMMENT ON COLUMN project_databases.coordinator_name IS 'Cached coordinator name for display purposes';

-- Verify everything worked
SELECT 'STUNT COORDINATORS SETUP COMPLETE' as status;
