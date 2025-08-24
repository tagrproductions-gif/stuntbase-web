import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects - List all active project databases
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active project databases
    const { data: projects, error } = await supabase
      .from('project_databases')
      .select(`
        id,
        project_name,
        description,
        filming_location,
        created_at,
        creator_user_id,
        coordinator_name
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Get user's profile to check submission status
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Get creator info and submission status
    if (projects) {
      const projectsWithCreatorsAndSubmissions = await Promise.all(
        projects.map(async (project) => {
          // Use the cached coordinator_name if available, otherwise try to get profile
          let creatorName = project.coordinator_name
          let creatorId = null
          
          if (!creatorName) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, id')
              .eq('user_id', project.creator_user_id)
              .single()
            
            creatorName = profile?.full_name || 'Unknown Creator'
            creatorId = profile?.id || null
          }

          // Check if current user has submitted to this project
          let hasSubmitted = false
          if (userProfile) {
            const { data: submission } = await supabase
              .from('project_submissions')
              .select('id')
              .eq('project_id', project.id)
              .eq('profile_id', userProfile.id)
              .single()
            
            hasSubmitted = !!submission
          }
          
          return {
            ...project,
            profiles: { full_name: creatorName, id: creatorId },
            hasSubmitted
          }
        })
      )
      return NextResponse.json({ projects: projectsWithCreatorsAndSubmissions })
    }

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects - Create a new project database
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a coordinator (ONLY coordinators can create projects)
    const { data: coordinator } = await supabase
      .from('stunt_coordinators')
      .select('id, coordinator_name')
      .eq('user_id', user.id)
      .single()

    if (!coordinator) {
      return NextResponse.json(
        { error: 'Only stunt coordinators can create project databases' },
        { status: 403 }
      )
    }

    // Use coordinator name for the project
    const creatorName = coordinator.coordinator_name

    // Parse request body
    const body = await request.json()
    const { project_name, description, filming_location } = body

    // Validate required fields
    if (!project_name || project_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    if (project_name.length > 100) {
      return NextResponse.json(
        { error: 'Project name must be less than 100 characters' },
        { status: 400 }
      )
    }

    if (filming_location && filming_location.length > 100) {
      return NextResponse.json(
        { error: 'Filming location must be less than 100 characters' },
        { status: 400 }
      )
    }

    // Create the project database
    const { data: project, error } = await supabase
      .from('project_databases')
      .insert({
        creator_user_id: user.id,
        project_name: project_name.trim(),
        description: description?.trim() || null,
        filming_location: filming_location?.trim() || null,
        coordinator_name: creatorName
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
