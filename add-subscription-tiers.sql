-- ADD SUBSCRIPTION TIERS TO PROFILES TABLE
-- This adds subscription tier tracking for resume analysis features
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- STEP 1: ADD SUBSCRIPTION TIER COLUMN
-- =============================================================================

-- Add subscription_tier column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Add subscription_expires_at for Pro plan expiration tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Add subscription_updated_at for tracking plan changes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =============================================================================
-- STEP 2: CREATE TIER ENUM (Optional - for type safety)
-- =============================================================================

-- Create enum for subscription tiers (optional but recommended)
DO $$ BEGIN
    CREATE TYPE subscription_tier_enum AS ENUM ('free', 'pro', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update column to use enum (optional)
-- ALTER TABLE profiles ALTER COLUMN subscription_tier TYPE subscription_tier_enum USING subscription_tier::subscription_tier_enum;

-- =============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for fast tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Index for active Pro users
CREATE INDEX IF NOT EXISTS idx_profiles_active_pro ON profiles(subscription_tier, subscription_expires_at) 
WHERE subscription_tier IN ('pro', 'premium');

-- =============================================================================
-- STEP 4: UPDATE EXISTING PROFILES TO FREE TIER
-- =============================================================================

-- Set all existing profiles to 'free' tier
UPDATE profiles 
SET subscription_tier = 'free', 
    subscription_updated_at = NOW()
WHERE subscription_tier IS NULL;

-- =============================================================================
-- STEP 5: VERIFY CHANGES
-- =============================================================================

-- Show updated column structure
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name LIKE '%subscription%'
ORDER BY ordinal_position;

-- Show tier distribution
SELECT subscription_tier, COUNT(*) as count
FROM profiles 
GROUP BY subscription_tier
ORDER BY count DESC;
