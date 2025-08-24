import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/projects/[id]/submit - Submit current user's profile to project
export async function POST(
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

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile lookup error:', {
        error: profileError,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json(
        { error: 'You must have a profile to submit to projects' },
        { status: 400 }
      )
    }

    // Check if project exists and is active
    const { data: project, error: projectError } = await supabase
      .from('project_databases')
      .select('id, is_active, project_name')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Project lookup error:', {
        error: projectError,
        projectId,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.is_active) {
      return NextResponse.json({ error: 'Project is not accepting submissions' }, { status: 400 })
    }

    // Check if already submitted
    const { data: existingSubmission } = await supabase
      .from('project_submissions')
      .select('id')
      .eq('project_id', projectId)
      .eq('profile_id', profile.id)
      .maybeSingle()

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted to this project' },
        { status: 400 }
      )
    }

    // Create the submission
    console.log('🎯 Creating submission:', {
      project_id: projectId,
      profile_id: profile.id,
      status: 'submitted'
    })
    
    const { data: submission, error: submitError } = await supabase
      .from('project_submissions')
      .insert({
        project_id: projectId,
        profile_id: profile.id,
        status: 'submitted'
      })
      .select()
      .single()
    
    console.log('✅ Submission result:', {
      success: !!submission,
      submissionId: submission?.id,
      error: submitError?.message,
      errorCode: submitError?.code,
      errorDetails: submitError?.details
    })

    if (submitError) {
      console.error('Error creating submission:', {
        error: submitError,
        projectId,
        profileId: profile.id,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
      
      // Provide more specific error messages based on the error type
      if (submitError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'You have already submitted to this project' }, { status: 400 })
      } else if (submitError.code === '23503') { // Foreign key constraint violation
        return NextResponse.json({ error: 'Invalid project or profile reference' }, { status: 400 })
      } else {
        return NextResponse.json({ 
          error: 'Failed to submit to project', 
          details: process.env.NODE_ENV === 'development' ? submitError.message : undefined
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      submission,
      message: `Successfully submitted to ${project.project_name}` 
    }, { status: 201 })
  } catch (error) {
    console.error('Submit to project API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
