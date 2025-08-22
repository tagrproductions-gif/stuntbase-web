import { createClient } from './client'
import { createClient as createServerClient } from './server'

/**
 * Record a profile view using your existing system
 * This function should be called whenever someone views a profile page
 */
export async function recordProfileView(
  profileId: string,
  context: {
    userAgent?: string
    referrer?: string
    ipAddress?: string
  } = {}
) {
  try {
    const supabase = createClient()
    
    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if this is the profile owner viewing their own profile
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single()
      
      // Don't record self-views
      if (profile?.user_id === user.id) {
        return false
      }
    }

    // Record the view in profile_views table
    const { error: insertError } = await supabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        viewer_id: user?.id || null,
        viewer_ip: context.ipAddress || null,
        user_agent: context.userAgent || null,
        viewed_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error inserting profile view:', insertError)
      // Don't fail silently, but don't break the page either
    }

    // Use your existing function to increment the counter
    const { error: rpcError } = await supabase.rpc('increment_profile_views', {
      profile_id: profileId
    })

    if (rpcError) {
      console.error('Error incrementing profile views:', rpcError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error recording profile view:', error)
    return false
  }
}

/**
 * Get profile view statistics using your existing profile_analytics view
 * Only the profile owner can access this data
 */
export async function getProfileViewStats(profileId: string) {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('profile_analytics')
      .select('*')
      .eq('profile_id', profileId)
      .single()

    if (error) {
      console.error('Error fetching profile view stats:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching profile view stats:', error)
    return null
  }
}

/**
 * Get profile view statistics for the current user's profile
 */
export async function getCurrentUserProfileViewStats() {
  try {
    const supabase = createServerClient()
    
    // First get the current user's profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return null

    // Then get the view stats
    return getProfileViewStats(profile.id)
  } catch (error) {
    console.error('Error fetching current user profile view stats:', error)
    return null
  }
}

/**
 * Get recent profile views for the current user's profile
 * Returns detailed view records (without sensitive viewer info)
 */
export async function getRecentProfileViews(profileId: string, limit: number = 10) {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('profile_views')
      .select(`
        id,
        viewed_at,
        user_agent
      `)
      .eq('profile_id', profileId)
      .order('viewed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent profile views:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recent profile views:', error)
    return []
  }
}
