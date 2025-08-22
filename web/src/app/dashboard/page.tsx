import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { User, Settings, Search, PlusCircle } from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'
import { getCurrentUserProfileViewStats } from '@/lib/supabase/profile-views'

// Helper function to get primary photo
function getPrimaryPhoto(profile: any) {
  return profile?.profile_photos?.find((p: any) => p.is_primary) || profile?.profile_photos?.[0]
}

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if user has a profile with photos
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_photos (*)
    `)
    .eq('user_id', user.id)
    .single()

  // Get profile view statistics from your existing profile_analytics view
  const viewStats = profile ? await getCurrentUserProfileViewStats() : null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Header with Large Portrait Photo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Large Profile Photo */}
            <div className="flex-shrink-0">
              {profile && getPrimaryPhoto(profile) ? (
                <div className="relative w-32 h-40 sm:w-36 sm:h-48 lg:w-40 lg:h-52">
                  <Image
                    src={getPrimaryPhoto(profile).file_path}
                    alt={profile.full_name || 'Profile'}
                    fill
                    className="object-cover rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-32 h-40 sm:w-36 sm:h-48 lg:w-40 lg:h-52 bg-muted rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Header Text */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {profile?.full_name ? `Welcome back, ${profile.full_name}` : 'Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
                {profile?.full_name ? user.email : `Welcome back, ${user.email}`}
              </p>
              {profile?.location && (
                <p className="text-muted-foreground text-sm sm:text-base mt-2">
                  📍 {profile.location}
                </p>
              )}
              
              {/* Quick Stats for Profile Users */}
              {profile && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-semibold text-foreground">{viewStats?.total_views || profile?.view_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-semibold text-foreground">{profile.is_public ? 'Public' : 'Private'}</p>
                    <p className="text-xs text-muted-foreground">Visibility</p>
                  </div>
                  {profile.experience_years && (
                    <div className="text-center sm:text-left">
                      <p className="text-lg font-semibold text-foreground">{profile.experience_years}y</p>
                      <p className="text-xs text-muted-foreground">Experience</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!profile ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                Create your stunt performer profile to start connecting with casting directors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile/create">
                <Button>Create Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{viewStats?.views_last_30_days || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Views in the last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.bio && profile.location && getPrimaryPhoto(profile) ? '85%' : profile.bio || profile.location ? '65%' : '40%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.bio && profile.location && getPrimaryPhoto(profile) ? 'Almost complete!' : 'Add more details to improve visibility'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your stunt performer profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile ? (
                <>
                  <Link href={`/profile/${profile.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href={`/profile/${profile.id}`} className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <User className="mr-2 h-4 w-4" />
                      View Public Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/profile/create" className="block">
                  <Button className="w-full justify-start border-2 shadow-lg">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Profile
                  </Button>
                </Link>
              )}
              <Link href="/search" className="block">
                <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                  <Search className="mr-2 h-4 w-4" />
                  Search Other Performers
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="block">
                <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
