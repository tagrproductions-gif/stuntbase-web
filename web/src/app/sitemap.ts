import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stuntpitch.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic pages - fetch public profiles
  const supabase = createClient()
  
  try {
    // Get public profiles
    const { data: publicProfiles } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(1000) // Limit to prevent sitemap from being too large

    const profilePages = publicProfiles?.map((profile) => ({
      url: `${baseUrl}/profile/${profile.id}`,
      lastModified: new Date(profile.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

    // Get active projects
    const { data: projects } = await supabase
      .from('project_databases')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(500)

    const projectPages = projects?.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: new Date(project.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

    return [...staticPages, ...profilePages, ...projectPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages only if database query fails
    return staticPages
  }
}
