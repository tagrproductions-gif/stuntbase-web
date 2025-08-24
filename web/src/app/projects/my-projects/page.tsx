'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Database, 
  Plus, 
  Trash2, 
  Users, 
  Calendar,
  AlertTriangle,
  Bot,
  Search,
  MoreVertical,
  Copy,
  CheckCircle,
  ArrowLeft,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export default function MyProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<ProjectDatabase[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<ProjectDatabase | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch user's projects
  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  // Filter projects based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredProjects(filtered)
    }
  }, [projects, searchQuery])

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (openMenuId) {
        setOpenMenuId(null)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openMenuId) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)
      }, 100)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [openMenuId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects/my-projects')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status}): ${response.statusText}`)
      }
      
      setProjects(data.projects || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (project: ProjectDatabase) => {
    try {
      setDeleteLoading(project.id)
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete project')
      }
      
      setProjects(prev => prev.filter(p => p.id !== project.id))
      setProjectToDelete(null)
      setError(null)
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const toggleMenu = (projectId: string) => {
    setOpenMenuId(openMenuId === projectId ? null : projectId)
  }

  const closeMenu = () => {
    setOpenMenuId(null)
  }

  const copyProjectLink = async (projectId: string) => {
    try {
      const projectUrl = `${window.location.origin}/projects/${projectId}`
      await navigator.clipboard.writeText(projectUrl)
      setCopiedProjectId(projectId)
      
      setTimeout(() => {
        setCopiedProjectId(null)
      }, 2000)
      
      closeMenu()
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to view your projects.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Database className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    My Projects
                  </h1>
                  {projects.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {projects.length}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Manage all your project databases and submissions
                </p>
              </div>
              
              <Link href="/projects/create">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Project
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            {projects.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms to find the project you\'re looking for.'
                  : 'Create your first project database to start collecting stunt performer submissions.'
                }
              </p>
              {!searchQuery && (
                <Link href="/projects/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {project.project_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{project.submission_count} submissions</span>
                        </div>
                      </div>
                      
                      {/* Action Menu */}
                      <div className="relative flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMenu(project.id)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {openMenuId === project.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                            <div className="py-2">
                              <Link 
                                href={`/?database=${project.id}`}
                                className="flex items-center px-4 py-2.5 text-sm hover:bg-muted/80 transition-colors"
                                onClick={closeMenu}
                              >
                                <Bot className="h-4 w-4 mr-3 text-blue-600" />
                                <span className="font-medium">AI Search</span>
                              </Link>

                              <Link 
                                href={`/search?database=${project.id}`}
                                className="flex items-center px-4 py-2.5 text-sm hover:bg-muted/80 transition-colors"
                                onClick={closeMenu}
                              >
                                <Search className="h-4 w-4 mr-3 text-green-600" />
                                <span className="font-medium">View Database</span>
                              </Link>

                              <button
                                onClick={() => copyProjectLink(project.id)}
                                className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/80 transition-colors text-left"
                              >
                                {copiedProjectId === project.id ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                                    <span className="font-medium text-green-600">Link Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4 mr-3 text-orange-600" />
                                    <span className="font-medium">Copy Link</span>
                                  </>
                                )}
                              </button>

                              <div className="border-t border-border/60 my-2" />

                              <button
                                onClick={() => {
                                  setProjectToDelete(project)
                                  closeMenu()
                                }}
                                disabled={deleteLoading === project.id}
                                className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-left text-destructive disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                <span className="font-medium">Delete Project</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Project Database
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "<strong>{projectToDelete?.project_name}</strong>"?
              </p>
              <p className="text-sm">
                This action will permanently delete:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>The project database</li>
                <li>All {projectToDelete?.submission_count || 0} submissions</li>
                <li>All associated data</li>
              </ul>
              <p className="text-sm font-medium text-destructive">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading === projectToDelete?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              disabled={deleteLoading === projectToDelete?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading === projectToDelete?.id ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
