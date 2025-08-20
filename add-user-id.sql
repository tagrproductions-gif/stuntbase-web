-- Add user_id column if it doesn't exist (needed to associate profiles with auth users)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
    END IF;
END $$;

-- Also add is_public column for profile visibility
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
END $$;
