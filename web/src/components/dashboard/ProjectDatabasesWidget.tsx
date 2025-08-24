'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Plus, 
  Users, 
  Calendar,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface ProjectDatabase {
  id: string
  project_name: string
  description: string | null
  created_at: string
  creator_user_id: string
  submission_count: number
  profiles: {
    full_name: string
    id: string | null
  }
}

interface ProjectDatabasesWidgetProps {
  className?: string
}

export function ProjectDatabasesWidget({ className }: ProjectDatabasesWidgetProps) {
  const [projects, setProjects] = useState<ProjectDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's projects
  useEffect(() => {
    fetchProjects()
  }, [])



  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects/my-projects')
      const data = await response.json()
      
      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        })
        throw new Error(data.error || `Server error (${response.status}): ${response.statusText}`)
      }
      
      setProjects(data.projects || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects'
      setError(errorMessage)
      
      // In development, show more detailed error info
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error info:', err)
      }
    } finally {
      setLoading(false)
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }



  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Project Databases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Project Databases
              {projects.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {projects.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Manage your project-specific casting databases
            </CardDescription>
          </div>
          <Link href="/projects/create" className="w-full sm:w-auto">
            <Button size="sm" className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Create Project</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Project Databases Yet
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Create your first project database to start collecting stunt performer submissions.
            </p>
            <Link href="/projects/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Scrollable container for project cards */}
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
              >
                {/* Project Header - Mobile Optimized */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">
                        {project.project_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{project.submission_count}</span>
                        <span className="hidden xs:inline">submissions</span>
                        <span className="xs:hidden">sub.</span>
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="hidden sm:inline">Created</span>
                        {formatDate(project.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              ))}
            </div>

            {/* View My Projects Link */}
            {projects.length > 3 && (
              <div className="pt-3 border-t">
                <Link href="/projects/my-projects">
                  <Button variant="ghost" className="w-full">
                    View All My Projects ({projects.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
