-- ADD PROFILE PHOTO FIELD TO STUNT COORDINATORS TABLE
-- Run this in your Supabase SQL Editor

-- Add profile_photo_url field to stunt_coordinators table
ALTER TABLE stunt_coordinators 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add comment for the new field
COMMENT ON COLUMN stunt_coordinators.profile_photo_url IS 'URL to the coordinator profile photo stored in Supabase storage';

-- Verify the change
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stunt_coordinators'
AND table_schema = 'public'
ORDER BY ordinal_position;
