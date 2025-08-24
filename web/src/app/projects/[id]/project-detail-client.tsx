'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/navigation/navbar'
import { 
  ArrowLeft,
  Calendar,
  User,
  Send,
  CheckCircle,
  AlertCircle,
  LogIn,
  MapPin,
  Bot,
  Search,
  Copy,
  Trash2,
  Settings,
  Edit,
  Save,
  X,
  Users
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

interface Project {
  id: string
  project_name: string
  description: string | null
  filming_location: string | null
  coordinator_name: string | null
  created_at: string
  creator_user_id: string
}

interface UserProfile {
  id: string
  full_name: string
}

interface ProjectDetailClientProps {
  project: Project
  user: any
  userProfile: UserProfile | null
  hasSubmitted: boolean
  submissionCount: number
}

export function ProjectDetailClient({ 
  project, 
  user, 
  userProfile, 
  hasSubmitted,
  submissionCount
}: ProjectDetailClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSecondDeleteDialog, setShowSecondDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    project_name: project.project_name,
    description: project.description || '',
    filming_location: project.filming_location || ''
  })
  const [editError, setEditError] = useState<string | null>(null)
  const router = useRouter()

  // Check if current user is the project owner
  const isProjectOwner = user && project.creator_user_id === user.id

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = async () => {
    if (!user || !userProfile) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/projects/${project.id}/submit`, {
        method: 'POST'
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitSuccess(true)
      // Refresh the page to update submission status
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Coordinator management functions
  const handleCopyLink = async () => {
    try {
      const projectUrl = `${window.location.origin}/projects/${project.id}`
      await navigator.clipboard.writeText(projectUrl)
      setCopiedLink(true)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedLink(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete project')
      }
      
      // Redirect to dashboard after successful deletion
      router.push('/dashboard')
    } catch (err) {
      console.error('Error deleting project:', err)
      // You might want to show an error message here
    } finally {
      setIsDeleting(false)
      setShowSecondDeleteDialog(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEditProject = async () => {
    setIsSaving(true)
    setEditError(null)
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: editForm.project_name.trim(),
          description: editForm.description.trim() || null,
          filming_location: editForm.filming_location.trim() || null
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update project')
      }
      
      // Refresh the page to show updated data
      router.refresh()
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating project:', err)
      setEditError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      project_name: project.project_name,
      description: project.description || '',
      filming_location: project.filming_location || ''
    })
    setEditError(null)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Navigation */}
        <div className="mb-4 sm:mb-6">
          <Link 
            href="/projects" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile-first layout */}
          <div className="space-y-4">
            {/* Title and Active Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Project Name
                      </label>
                      <Input
                        value={editForm.project_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, project_name: e.target.value }))}
                        className="text-xl sm:text-2xl lg:text-3xl font-bold h-auto py-2"
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Filming Location
                      </label>
                      <Input
                        value={editForm.filming_location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, filming_location: e.target.value }))}
                        placeholder="Enter filming location"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                        {project.project_name}
                      </h1>
                    </div>
                    
                    {/* Project metadata */}
                    <div className="space-y-2">
                      {project.coordinator_name && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span>Created by {project.coordinator_name}</span>
                        </div>
                      )}
                      {project.filming_location && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>Filming in {project.filming_location}</span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Posted on {formatDate(project.created_at)}</span>
                        </div>
                        {isProjectOwner && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{submissionCount} submission{submissionCount !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Active Badge - Always visible and aligned right */}
              {!isEditing && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-900 flex-shrink-0">
                  Active
                </Badge>
              )}
            </div>

            {/* Edit Actions Row */}
            {isEditing && (
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={handleEditProject}
                  disabled={isSaving || !editForm.project_name.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            {/* Quick Action Buttons for Coordinators - Mobile Optimized */}
            {isProjectOwner && !isEditing && (
              <div className="space-y-3">
                {/* Mobile: Stack vertically, Desktop: Horizontal */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {/* AI Search */}
                  <Link href={`/?database=${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bot className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                      <span>AI Search</span>
                    </Button>
                  </Link>

                  {/* View Database */}
                  <Link href={`/search?database=${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                      <span>View Database</span>
                    </Button>
                  </Link>

                  {/* Copy Link */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex-1 justify-start"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2 text-orange-600 flex-shrink-0" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Edit Error Message */}
          {editError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{editError}</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Project Description */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Project Description
                  </label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter project description..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
              ) : (
                <>
                  {project.description ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No additional details provided for this project.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Coordinator Management Section - Only visible to project owner */}
          {isProjectOwner && (
            <Card className="mb-4 sm:mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Project Management
                </CardTitle>
                <CardDescription>
                  Manage your project database and view submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {/* Edit Project */}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-3 sm:p-4"
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-purple-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">Edit Project</div>
                      <div className="text-xs text-muted-foreground">Modify details</div>
                    </div>
                  </Button>

                  {/* Delete Project */}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-3 sm:p-4 text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-3 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">Delete Project</div>
                      <div className="text-xs text-destructive/70">Permanently remove</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Success Message */}
          {submitSuccess && (
            <Card className="mb-4 sm:mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Successfully Submitted!</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your profile has been added to this project database.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Actions - Hidden for project owners */}
          {!isProjectOwner && (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit to Project
              </CardTitle>
              <CardDescription>
                Join this project database to be discovered by the coordinator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!user ? (
                  // Not logged in
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign in to submit your profile to this project
                    </p>
                    <Link href="/auth/login">
                      <Button className="w-full">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In to Submit
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-2">
                      Don't have an account? <Link href="/auth/signup" className="text-primary hover:underline">Sign up</Link>
                    </p>
                  </div>
                ) : !userProfile ? (
                  // Logged in but no profile
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your performer profile to submit to projects
                    </p>
                    <Link href="/profile/role-selection">
                      <Button className="w-full">
                        Create Profile
                      </Button>
                    </Link>
                  </div>
                ) : hasSubmitted || submitSuccess ? (
                  // Already submitted
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Submitted</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your profile has been submitted to this project
                    </p>
                    <Link href="/projects/my-submissions">
                      <Button variant="outline" className="w-full">
                        View My Submissions
                      </Button>
                    </Link>
                  </div>
                ) : (
                  // Can submit
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submit your profile as <strong>{userProfile.full_name}</strong>
                    </p>
                    
                    {submitError && (
                      <div className="flex items-center gap-2 text-destructive text-sm mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <span>{submitError}</span>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Profile
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This will add your profile to the project database
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      {/* First Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Project Database
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{project.project_name}</strong>"?
              This action cannot be undone and will permanently remove all project data and submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false)
                setShowSecondDeleteDialog(true)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Delete Confirmation Dialog */}
      <AlertDialog open={showSecondDeleteDialog} onOpenChange={setShowSecondDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This is your final warning. Deleting this project will:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Permanently delete the project database</li>
                <li>Remove all performer submissions</li>
                <li>Delete all associated data</li>
              </ul>
              <p className="font-medium text-destructive">
                This action is irreversible. Are you absolutely sure?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Project Permanently'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
