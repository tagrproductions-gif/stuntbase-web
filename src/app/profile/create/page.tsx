import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileCreateForm } from './profile-create-form'

export default async function CreateProfilePage() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if user already has a profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingProfile) {
    redirect(`/profile/${existingProfile.id}/edit`)
  }

  // Check if this is a returning user (has auth account but no profile)
  const isReturningUser = user.created_at && new Date(user.created_at) < new Date(Date.now() - 60000) // Account older than 1 minute

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          {isReturningUser ? (
            <>
              <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
              <p className="text-muted-foreground mt-2">
                Let&apos;s create your new StuntBase profile. All your previous data has been removed as requested.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground">Create Your Profile</h1>
              <p className="text-muted-foreground mt-2">
                Build your professional stunt performer profile to connect with casting directors
              </p>
            </>
          )}
        </div>

        <ProfileCreateForm user={user} />
      </div>
    </div>
  )
}
