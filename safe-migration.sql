-- Safe migration that only adds columns if they don't exist
-- Run this in your Supabase SQL Editor

DO $$ 
BEGIN
    -- Add availability_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'availability_status'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN availability_status TEXT 
        CHECK (availability_status IN ('available', 'busy', 'unavailable'));
    END IF;

    -- Add gender column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'gender'
    ) THEN
        ALTER TABLE profiles ADD COLUMN gender TEXT;
    END IF;

    -- Add years_experience column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE profiles ADD COLUMN years_experience INTEGER;
    END IF;

    -- Add union_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'union_status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN union_status TEXT;
    END IF;

    -- Add travel_radius column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'travel_radius'
    ) THEN
        ALTER TABLE profiles ADD COLUMN travel_radius INTEGER;
    END IF;

    -- Add rates columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'rates_day'
    ) THEN
        ALTER TABLE profiles ADD COLUMN rates_day DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'rates_week'
    ) THEN
        ALTER TABLE profiles ADD COLUMN rates_week DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'rates_month'
    ) THEN
        ALTER TABLE profiles ADD COLUMN rates_month DECIMAL(10,2);
    END IF;

    -- Add social media columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'website'
    ) THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'imdb_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN imdb_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'reel_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN reel_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'instagram'
    ) THEN
        ALTER TABLE profiles ADD COLUMN instagram TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'twitter'
    ) THEN
        ALTER TABLE profiles ADD COLUMN twitter TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'facebook'
    ) THEN
        ALTER TABLE profiles ADD COLUMN facebook TEXT;
    END IF;

    -- Add emergency contact columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'emergency_contact_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN emergency_contact_name TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'emergency_contact_phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN emergency_contact_phone TEXT;
    END IF;

END $$;

-- Verify which columns now exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;
