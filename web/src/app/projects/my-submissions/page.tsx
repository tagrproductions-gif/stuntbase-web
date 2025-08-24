'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navigation/navbar'
import { 
  Send, 
  Calendar,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface ProjectSubmission {
  id: string
  submitted_at: string
  status: string
  notes: string | null
  project_databases: {
    id: string
    project_name: string
    description: string | null
    coordinator_name: string | null
    created_at: string
  }
}

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth()
  const [allSubmissions, setAllSubmissions] = useState<ProjectSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubmissions()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  // Filter submissions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubmissions(allSubmissions)
    } else {
      const filtered = allSubmissions.filter(submission =>
        submission.project_databases.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.project_databases.coordinator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.project_databases.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSubmissions(filtered)
    }
    setCurrentPage(1) // Reset to first page when searching
  }, [searchQuery, allSubmissions])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/projects/my-submissions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions')
      }

      setAllSubmissions(data.submissions)
      setFilteredSubmissions(data.submissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getStatusBadge = (status: string) => {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-900">Submitted</Badge>
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to view your submissions.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Send className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Submissions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Track your project database submissions and their status
          </p>
        </div>

        {/* Search Bar */}
        {allSubmissions.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects or coordinators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          searchQuery ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-6">
                  No submissions match your search for "{searchQuery}". 
                  Try different keywords or clear your search.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Send className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted your profile to any project databases yet. 
                  Browse available projects to get started!
                </p>
                <Link href="/projects">
                  <Button>
                    Browse Project Databases
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            {/* Submissions Grid */}
            <div className="space-y-4 mb-6">
              {currentSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(submission.status)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {submission.project_databases.project_name}
                          </h3>
                          {submission.project_databases.coordinator_name && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>by {submission.project_databases.coordinator_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {submission.project_databases.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {submission.project_databases.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted on {formatDate(submission.submitted_at)}</span>
                      </div>


                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end gap-3">
                      {getStatusBadge(submission.status)}
                      <Link href={`/projects/${submission.project_databases.id}`}>
                        <Button variant="outline" size="sm">
                          View Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
