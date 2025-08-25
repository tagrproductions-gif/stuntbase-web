import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { User, Settings, Search, PlusCircle, Bot } from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'
import { getCurrentUserProfileViewStats } from '@/lib/supabase/profile-views'
import { ProjectDatabasesWidget } from '@/components/dashboard/ProjectDatabasesWidget'
import { MySubmissionsWidget } from '@/components/dashboard/MySubmissionsWidget'
import { CoordinatorPhotoChange } from '@/components/dashboard/coordinator-photo-change'
import { SignOutButton } from '@/components/dashboard/sign-out-button'

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
      id, full_name, bio, gender, ethnicity, height_feet, height_inches, weight_lbs,
      location, primary_location_structured, secondary_location_structured, 
      union_status, availability_status, travel_radius, reel_url, website, 
      resume_url, phone, email, created_at, updated_at, is_public, user_id,
      profile_photos (id, file_path, file_name, is_primary, sort_order)
    `)
    .eq('user_id', user.id)
    .single()

  // Check if user is a coordinator (🚀 MEMORY FIX: specific fields only)
  const { data: coordinator } = await supabase
    .from('stunt_coordinators')
    .select('id, user_id, coordinator_name, profile_photo_url, created_at')
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
              <div className="space-y-3">
                {profile && getPrimaryPhoto(profile) ? (
                  <div className="relative w-32 h-40 sm:w-36 sm:h-48 lg:w-40 lg:h-52">
                    <Image
                      src={getPrimaryPhoto(profile).file_path}
                      alt={profile.full_name || 'Profile'}
                      fill
                      className="object-cover rounded-xl shadow-lg"
                    />
                  </div>
                ) : coordinator?.profile_photo_url ? (
                  <div className="relative w-32 h-40 sm:w-36 sm:h-48 lg:w-40 lg:h-52">
                    <Image
                      src={coordinator.profile_photo_url}
                      alt={coordinator.coordinator_name || 'Coordinator'}
                      fill
                      className="object-cover rounded-xl shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-40 sm:w-36 sm:h-48 lg:w-40 lg:h-52 bg-muted rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground" />
                  </div>
                )}
                
                {/* Add Change Photo button for coordinators */}
                {coordinator && (
                  <div className="w-32 sm:w-36 lg:w-40">
                    <CoordinatorPhotoChange 
                      coordinatorId={coordinator.id} 
                      hasExistingPhoto={!!coordinator.profile_photo_url}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Header Text */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {profile?.full_name ? `Welcome back, ${profile.full_name}` : 
                 coordinator?.coordinator_name ? `Welcome back, ${coordinator.coordinator_name}` : 'Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
                {profile?.full_name ? user.email : 
                 coordinator?.coordinator_name ? `${user.email} (Stunt Coordinator)` : 
                 `Welcome back, ${user.email}`}
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
                    <p className="text-lg font-semibold text-foreground">{viewStats?.total_views || 0}</p>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-semibold text-foreground">{profile.is_public ? 'Public' : 'Private'}</p>
                    <p className="text-xs text-muted-foreground">Visibility</p>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {!profile && !coordinator ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Get Started
              </CardTitle>
              <CardDescription>
                Choose your role to start using our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile/role-selection">
                <Button>Choose Your Role</Button>
              </Link>
            </CardContent>
          </Card>
        ) : profile ? (
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
        ) : coordinator ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coordinator Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  Ready to create project databases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Type</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Coordinator</div>
                <p className="text-xs text-muted-foreground">
                  Private account for project management
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* For coordinators: Database widget on left, Quick Actions on right */}
          {coordinator ? (
            <>
              {/* Project Databases Widget - Left side for coordinators */}
              <ProjectDatabasesWidget className="lg:row-span-1" />
              
              {/* Quick Actions Widget - Right side for coordinators */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your coordinator account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Bot className="mr-2 h-4 w-4" />
                      AI Search All Performers
                    </Button>
                  </Link>

                  <Link href="/search" className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Search className="mr-2 h-4 w-4" />
                      Filter Search All Performers
                    </Button>
                  </Link>

                  <Link href="/dashboard/settings" className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                  </Link>
                  
                  <SignOutButton />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* My Submissions Widget - Left side for performers */}
              {profile && (
                <MySubmissionsWidget className="lg:row-span-1" />
              )}
              
              {/* Quick Actions Widget - Right side for performers and users without profiles */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your stunt performer profile
                  </CardDescription>
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
                  ) : null}
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Bot className="mr-2 h-4 w-4" />
                      AI Search All Performers
                    </Button>
                  </Link>

                  <Link href="/search" className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Search className="mr-2 h-4 w-4" />
                      Filter Search All Performers
                    </Button>
                  </Link>

                  <Link href="/dashboard/settings" className="block">
                    <Button variant="outline" className="w-full justify-start border-2 shadow-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                  </Link>
                  
                  <SignOutButton />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
