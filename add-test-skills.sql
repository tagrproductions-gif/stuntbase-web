-- Add test skills to your profile
-- Run this in Supabase SQL Editor

-- Your profile ID (from the diagnostic results)
-- f2eb49f1-c6e9-4292-b332-f00426ecb3d0

-- Add some skills for testing
INSERT INTO profile_skills (profile_id, skill_id, proficiency_level, years_experience) VALUES
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'martial arts', 'intermediate', 5),
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'stunt driving', 'advanced', 8),
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'motorcycle riding', 'expert', 10),
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'wire work', 'beginner', 2);

-- Add some certifications
INSERT INTO profile_certifications (profile_id, certification_id, date_obtained) VALUES
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'CPR/First Aid', '2023-01-15'),
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'Motorcycle License', '2015-06-20'),
('f2eb49f1-c6e9-4292-b332-f00426ecb3d0', 'SAG-AFTRA Member', '2020-03-10');

-- Add a bio to your profile
UPDATE profiles 
SET bio = 'Experienced stunt performer based in Atlanta with over 10 years in the industry. Specializes in motorcycle stunts, martial arts choreography, and wire work. SAG-AFTRA member with extensive experience in action films and TV shows.'
WHERE id = 'f2eb49f1-c6e9-4292-b332-f00426ecb3d0';

-- Verify the additions
SELECT 'VERIFICATION:' as section;

SELECT 
  (SELECT COUNT(*) FROM profile_skills WHERE profile_id = 'f2eb49f1-c6e9-4292-b332-f00426ecb3d0') as skills_added,
  (SELECT COUNT(*) FROM profile_certifications WHERE profile_id = 'f2eb49f1-c6e9-4292-b332-f00426ecb3d0') as certs_added,
  (SELECT CASE WHEN bio IS NOT NULL THEN 'Bio added' ELSE 'Bio still missing' END FROM profiles WHERE id = 'f2eb49f1-c6e9-4292-b332-f00426ecb3d0') as bio_status;
