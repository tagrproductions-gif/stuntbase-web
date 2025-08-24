import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/[id] - Get specific project database details
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

    // Get project details
    const { data: project, error } = await supabase
      .from('project_databases')
      .select(`
        id,
        project_name,
        description,
        created_at,
        creator_user_id,
        is_active
      `)
      .eq('id', projectId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.is_active) {
      return NextResponse.json({ error: 'Project is not active' }, { status: 404 })
    }

    // Get creator profile info separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, id')
      .eq('user_id', project.creator_user_id)
      .single()

    const projectWithCreator = {
      ...project,
      profiles: profile || { full_name: 'Unknown Creator', id: null }
    }

    return NextResponse.json({ project: projectWithCreator })
  } catch (error) {
    console.error('Get project API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/projects/[id] - Update project database (only by creator)
export async function PATCH(
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
    const { data: project, error: fetchError } = await supabase
      .from('project_databases')
      .select('creator_user_id')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.creator_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the project creator can update this project' }, { status: 403 })
    }

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

    // Update the project
    const { data: updatedProject, error: updateError } = await supabase
      .from('project_databases')
      .update({
        project_name: project_name.trim(),
        description: description?.trim() || null,
        filming_location: filming_location?.trim() || null
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project:', updateError)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Project updated successfully',
      project: updatedProject 
    })
  } catch (error) {
    console.error('Update project API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project database (only by creator)
export async function DELETE(
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
    const { data: project, error: fetchError } = await supabase
      .from('project_databases')
      .select('creator_user_id')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.creator_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the project creator can delete this project' }, { status: 403 })
    }

    // Delete the project (this will cascade delete submissions due to foreign key)
    const { error: deleteError } = await supabase
      .from('project_databases')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
