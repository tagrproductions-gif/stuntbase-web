import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileDisplay } from './profile-display'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient()

  console.log('Fetching profile:', params.id)

  // First, try to get just the basic profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  console.log('Profile data:', profile)
  console.log('Profile error:', error)

  if (error) {
    console.error('Database error:', error)
    return <div className="p-8">Error loading profile: {error.message}</div>
  }

  if (!profile) {
    notFound()
  }

  // Check if profile is public or if user owns it
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.user_id
  const canView = profile.is_public || isOwner

  console.log('Auth check - User ID:', user?.id)
  console.log('Auth check - Profile user_id:', profile.user_id)
  console.log('Auth check - Is owner?', isOwner)
  console.log('Auth check - Can view?', canView)

  if (!canView) {
    return <div className="p-8">This profile is private.</div>
  }

  // Try to get related data (skills, certifications, photos) separately
  // This way if any of these fail, we can still show the basic profile
  let profileSkills: any[] = []
  let profileCertifications: any[] = []
  let profilePhotos: any[] = []

  try {
    const { data: skills } = await supabase
      .from('profile_skills')
      .select(`
        id,
        proficiency_level,
        skills (
          id,
          name,
          category
        )
      `)
      .eq('profile_id', params.id)
    profileSkills = skills || []
  } catch (e) {
    console.warn('Could not load skills:', e)
  }

  try {
    const { data: certs } = await supabase
      .from('profile_certifications')
      .select(`
        id,
        date_obtained,
        expiry_date,
        certification_number,
        certifications (
          id,
          name,
          issuing_organization
        )
      `)
      .eq('profile_id', params.id)
    profileCertifications = certs || []
  } catch (e) {
    console.warn('Could not load certifications:', e)
  }

  try {
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', params.id)
      .order('sort_order')
    profilePhotos = photos || []
  } catch (e) {
    console.warn('Could not load photos:', e)
  }

  // Combine the data
  const enrichedProfile = {
    ...profile,
    profile_skills: profileSkills,
    profile_certifications: profileCertifications,
    profile_photos: profilePhotos
  }

  return <ProfileDisplay profile={enrichedProfile} isOwner={isOwner} />
}
