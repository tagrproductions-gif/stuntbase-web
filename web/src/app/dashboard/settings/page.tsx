import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  User, 
  Settings, 
  Bell, 
  Eye, 
  Shield, 
  CreditCard, 
  Trash2, 
  Crown,
  Zap,
  Users,
  ChevronRight
} from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'
import { DeleteProfileSection } from './delete-profile-section'
import { DeleteCoordinatorSection } from './delete-coordinator-section'
import { ChangePasswordSection } from './change-password-section'

export default async function SettingsPage() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get user's coordinator profile
  const { data: coordinator } = await supabase
    .from('stunt_coordinators')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your account, subscription, and profile preferences
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Subscription Status */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Crown className="h-5 w-5 text-primary" />
                Subscription Plan
              </CardTitle>
              <CardDescription className="text-sm">
                Manage your StuntPitch subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">Free Plan</span>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Basic profile visibility</p>
                  </div>
                </div>
                <Button variant="outline" disabled className="w-full sm:w-auto text-sm">
                  <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
                  Upgrade Plan
                </Button>
              </div>

              {/* Subscription Tiers Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-6">
                <div className="p-4 border border-border rounded-lg opacity-75">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Pro Plan</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Priority search placement</li>
                    <li>• Unlimited photo uploads</li>
                    <li>• Contact info visibility</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
                
                <div className="p-4 border border-border rounded-lg opacity-75">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Premium Plan</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Everything in Pro</li>
                    <li>• Featured profile badge</li>
                    <li>• Direct casting notifications</li>
                    <li>• Profile verification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                {coordinator ? 'Manage your coordinator profile and settings' : 'Manage your performer profile and visibility'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coordinator ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Coordinator Profile</p>
                      <p className="text-sm text-muted-foreground">
                        {coordinator.coordinator_name} - Create and manage project databases
                      </p>
                    </div>
                  </div>
                  <Link href="/projects/create">
                    <Button variant="outline" size="sm">
                      Create Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.is_public ? 'Public - visible to casting directors' : 'Private - only visible to you'}
                      </p>
                    </div>
                  </div>
                  <Link href={profile ? `/profile/${profile.id}/edit` : '/profile/create'}>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Casting opportunities and profile views
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                  <Badge variant="secondary" className="ml-2">Pro</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your data and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChangePasswordSection />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Download My Data</p>
                    <p className="text-sm text-muted-foreground">
                      Export all your profile data
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Export Data
                  <Badge variant="secondary" className="ml-2">Pro</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {coordinator ? (
            <DeleteCoordinatorSection coordinator={coordinator} />
          ) : (
            <DeleteProfileSection profile={profile} />
          )}
        </div>
      </div>
    </div>
  )
}
