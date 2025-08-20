import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditForm } from './profile-edit-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditProfilePageProps {
  params: {
    id: string
  }
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  console.log('Edit page - User ID:', user.id)
  console.log('Edit page - Profile ID:', params.id)

  // First, get just the profile to check ownership
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  console.log('Edit page - Profile data:', profile)
  console.log('Edit page - Profile error:', profileError)

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Profile</h1>
          <p className="text-muted-foreground mb-4">{profileError.message}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Check if user owns this profile
  if (profile.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Unauthorized</h1>
          <p className="text-muted-foreground mb-4">You can only edit your own profile.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get related data separately
  let profileSkills: any[] = []
  let profileCertifications: any[] = []
  let profilePhotos: any[] = []

  try {
    const { data: skills } = await supabase
      .from('profile_skills')
      .select('id, proficiency_level, skill_id')
      .eq('profile_id', params.id)
    profileSkills = skills || []
  } catch (e) {
    console.warn('Could not load skills for editing:', e)
  }

  try {
    const { data: certs } = await supabase
      .from('profile_certifications')
      .select('id, date_obtained, expiry_date, certification_number, certification_id')
      .eq('profile_id', params.id)
    profileCertifications = certs || []
  } catch (e) {
    console.warn('Could not load certifications for editing:', e)
  }

  try {
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', params.id)
      .order('sort_order')
    profilePhotos = photos || []
  } catch (e) {
    console.warn('Could not load photos for editing:', e)
  }

  // Combine the data
  const enrichedProfile = {
    ...profile,
    profile_skills: profileSkills,
    profile_certifications: profileCertifications,
    profile_photos: profilePhotos
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/profile/${params.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Edit Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your professional stunt performer profile
          </p>
        </div>

        <ProfileEditForm profile={enrichedProfile} />
      </div>
    </div>
  )
}
