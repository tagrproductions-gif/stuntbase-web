-- Quick fix for immediate profile creation issues
-- Run this in your Supabase SQL Editor

-- Add the availability_status column that's causing the error
ALTER TABLE profiles 
ADD COLUMN availability_status TEXT 
CHECK (availability_status IN ('available', 'busy', 'unavailable'));

-- Add other essential columns for profile creation
ALTER TABLE profiles 
ADD COLUMN hair_color TEXT,
ADD COLUMN eye_color TEXT,
ADD COLUMN ethnicity TEXT,
ADD COLUMN gender TEXT,
ADD COLUMN years_experience INTEGER,
ADD COLUMN union_status TEXT,
ADD COLUMN rates_day DECIMAL(10,2),
ADD COLUMN rates_week DECIMAL(10,2),
ADD COLUMN rates_month DECIMAL(10,2),
ADD COLUMN height INTEGER,
ADD COLUMN weight INTEGER;

-- Verify the columns were added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN (
  'availability_status', 'hair_color', 'eye_color', 'ethnicity', 
  'gender', 'years_experience', 'union_status', 'rates_day', 
  'rates_week', 'rates_month', 'height', 'weight'
);
