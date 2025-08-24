import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/debug/project-submissions - Debug endpoint to check project submissions
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .single()

    // Get all project submissions for this user
    const { data: submissions, error: submissionsError } = await supabase
      .from('project_submissions')
      .select(`
        id,
        project_id,
        profile_id,
        status,
        submitted_at,
        project_databases (
          id,
          project_name,
          creator_user_id
        )
      `)
      .eq('profile_id', profile?.id)

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('project_databases')
      .select('id, project_name, creator_user_id')
      .eq('is_active', true)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile,
      submissions: submissions || [],
      projects: projects || [],
      errors: {
        submissions: submissionsError?.message,
        projects: projectsError?.message
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
