-- Add missing columns to profiles table
-- Run this SQL in your Supabase SQL Editor

-- Add availability_status column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS availability_status TEXT 
CHECK (availability_status IN ('available', 'busy', 'unavailable'));

-- Add any other potentially missing columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hair_color TEXT,
ADD COLUMN IF NOT EXISTS eye_color TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS imdb_url TEXT,
ADD COLUMN IF NOT EXISTS reel_url TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS union_status TEXT,
ADD COLUMN IF NOT EXISTS travel_radius INTEGER,
ADD COLUMN IF NOT EXISTS rates_day DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rates_week DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rates_month DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS weight INTEGER;

-- Update the updated_at column to use a trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
