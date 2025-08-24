import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/my-submissions - Get current user's project submissions
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile (only performers can have submissions)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get submissions with project details
    const { data: submissions, error } = await supabase
      .from('project_submissions')
      .select(`
        id,
        submitted_at,
        status,
        notes,
        project_databases (
          id,
          project_name,
          description,
          coordinator_name,
          created_at
        )
      `)
      .eq('profile_id', profile.id)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    return NextResponse.json({ submissions: submissions || [] })
  } catch (error) {
    console.error('My submissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
