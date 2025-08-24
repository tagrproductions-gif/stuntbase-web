import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectDetailClient } from './project-detail-client'

interface ProjectPageProps {
  params: { id: string }
}

// Generate metadata for rich link previews
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: project } = await supabase
    .from('project_databases')
    .select('project_name, description, filming_location, coordinator_name')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!project) {
    return {
      title: 'Project Not Found - StuntPitch',
      description: 'The requested project could not be found.'
    }
  }

  const title = `Submit to ${project.project_name} - StuntPitch`
  const description = project.description 
    ? `${project.description.slice(0, 150)}...` 
    : `Join the ${project.project_name} stunt database. Submit your profile to get discovered by casting directors.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'StuntPitch',
      type: 'website',
      images: [
        {
          url: '/logo.png', // Make sure you have a logo in your public folder
          width: 1200,
          height: 630,
          alt: 'StuntPitch Logo'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png']
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createClient()
  
  // Get project details
  const { data: project, error } = await supabase
    .from('project_databases')
    .select(`
      id,
      project_name,
      description,
      filming_location,
      coordinator_name,
      created_at,
      creator_user_id
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get submission count for this project
  const { count: submissionCount } = await supabase
    .from('project_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', params.id)

  // Get current user (if any)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user has a profile (needed for submission)
  let userProfile = null
  let hasSubmitted = false
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .single()
    
    userProfile = profile

    // Check if user has already submitted to this project
    if (profile) {
      const { data: submission } = await supabase
        .from('project_submissions')
        .select('id')
        .eq('project_id', params.id)
        .eq('profile_id', profile.id)
        .single()
      
      hasSubmitted = !!submission
    }
  }

  return (
    <ProjectDetailClient 
      project={project}
      user={user}
      userProfile={userProfile}
      hasSubmitted={hasSubmitted}
      submissionCount={submissionCount || 0}
    />
  )
}
