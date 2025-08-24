import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/my-projects - Get only the current user's project databases
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error in my-projects:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Fetching projects for user:', user.id)

    // Get projects first without the potentially problematic join
    const { data: projects, error } = await supabase
      .from('project_databases')
      .select(`
        id,
        project_name,
        description,
        filming_location,
        created_at,
        creator_user_id
      `)
      .eq('is_active', true)
      .eq('creator_user_id', user.id) // Only projects created by this user
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Get creator info for each project and get submission counts separately
    if (projects && projects.length > 0) {
      const projectsWithCreators = await Promise.all(
        projects.map(async (project) => {
          // Get submission count for this project
          const { count: submissionCount, error: submissionError } = await supabase
            .from('project_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
          
          const finalSubmissionCount = submissionError ? 0 : (submissionCount || 0)
          
          // Try to get profile first
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, id')
            .eq('user_id', project.creator_user_id)
            .single()
          
          // If no profile, try to get coordinator info
          let creatorName = profile?.full_name
          let creatorId = profile?.id || null
          
          if (!profile) {
            const { data: coordinator } = await supabase
              .from('stunt_coordinators')
              .select('coordinator_name')
              .eq('user_id', project.creator_user_id)
              .single()
            
            creatorName = coordinator?.coordinator_name || 'Unknown Creator'
          }
          
          return {
            ...project,
            submission_count: finalSubmissionCount,
            profiles: { full_name: creatorName, id: creatorId }
          }
        })
      )
      return NextResponse.json({ projects: projectsWithCreators })
    }

    return NextResponse.json({ projects: [] })
  } catch (error) {
    console.error('My projects API error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 })
  }
}
