import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/[id]/submissions - Get all submissions for a project (only for project creator)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Check if user is the creator of this project
    const { data: project, error: projectError } = await supabase
      .from('project_databases')
      .select('creator_user_id, project_name')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.creator_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the project creator can view submissions' }, { status: 403 })
    }

    // Get all submissions for this project with profile details
    const { data: submissions, error } = await supabase
      .from('project_submissions')
      .select(`
        id,
        submitted_at,
        status,
        notes,
        profiles (
          id,
          full_name,
          location,
          height_feet,
          height_inches,
          weight_lbs,
          hair_color,
          eye_color,
          gender,
          ethnicity,
          union_status,
          availability_status,
          primary_location_structured,
          travel_radius,
          profile_photos (
            file_path,
            is_primary
          )
        )
      `)
      .eq('project_id', projectId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    return NextResponse.json({ 
      submissions: submissions || [],
      project_name: project.project_name
    })
  } catch (error) {
    console.error('Get submissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
