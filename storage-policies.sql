-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create bucket if it doesn't exist (you may have already done this)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload photos to their own profile folder
CREATE POLICY "Users can upload photos to their own profile folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Policy: Allow authenticated users to view all photos (since profiles can be public)
CREATE POLICY "Anyone can view profile photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Policy: Allow users to update photos in their own profile folder
CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Policy: Allow users to delete photos in their own profile folder
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
);
