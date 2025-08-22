import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { User, Settings, Search, PlusCircle } from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'
import { getCurrentUserProfileViewStats } from '@/lib/supabase/profile-views'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if user has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Welcome back, {user.email}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{viewStats?.total_views || profile?.view_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {viewStats?.views_last_30_days || 0} in the last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.is_public ? 'Public' : 'Private'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.is_public ? 'Visible to casting directors' : 'Hidden from search'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Listed</CardTitle>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Add skills to your profile</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your stunt performer profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile ? (
                <>
                  <Link href={`/profile/${profile.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href={`/profile/${profile.id}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      View Public Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/profile/create" className="block">
                  <Button className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Profile
                  </Button>
                </Link>
              )}
              <Link href="/search" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Search Other Performers
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent profile activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">No recent activity to show.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
