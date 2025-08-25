'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navigation/navbar'
import { Database, Calendar, User, CheckCircle, Plus, MapPin } from 'lucide-react'
import Link from 'next/link'

interface ProjectDatabase {
  id: string
  project_name: string
  description: string | null
  filming_location: string | null
  created_at: string
  creator_user_id: string
  hasSubmitted?: boolean
  profiles: {
    full_name: string
    id: string
  }
}

export default function ProjectsClient() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<ProjectDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCoordinator, setIsCoordinator] = useState(false)

  // Check if user is a coordinator via API
  const checkCoordinatorStatus = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/user/coordinator-status')
      const data = await response.json()
      
      if (response.ok) {
        setIsCoordinator(data.isCoordinator)
      } else {
        console.error('Error checking coordinator status:', data.error)
        setIsCoordinator(false)
      }
    } catch (error) {
      console.error('Error checking coordinator status:', error)
      setIsCoordinator(false)
    }
  }

  // Fetch projects with submission status
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects')
      }

      // Projects now include hasSubmitted status from the API
      setProjects(data.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects()
      checkCoordinatorStatus()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])



  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Project Databases</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to view and submit to project databases
            </p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-8 w-8" />
              Project Databases
            </h1>
            <p className="text-muted-foreground mt-2">
              Submit your profile to project-specific casting databases created by stunt coordinators
            </p>
          </div>
          
          {isCoordinator && (
            <Link href="/projects/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Databases Yet</h3>
              <p className="text-muted-foreground mb-4">
                {isCoordinator 
                  ? "There are currently no active project databases. Be the first to create one!"
                  : "There are currently no active project databases. Check back later for new opportunities!"
                }
              </p>
              {isCoordinator && (
                <Link href="/projects/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">
                          {project.project_name}
                        </CardTitle>
                        {project.hasSubmitted && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 dark:border-green-800 dark:hover:bg-green-900 text-xs flex-shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <CardDescription className="flex items-center gap-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{project.profiles.full_name}</span>
                        </CardDescription>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span className="whitespace-nowrap">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {project.filming_location ? (
                        <div className="flex items-center justify-between">
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{project.filming_location}</span>
                          </CardDescription>
                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            Click to view details →
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground text-right">
                          Click to view details →
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
