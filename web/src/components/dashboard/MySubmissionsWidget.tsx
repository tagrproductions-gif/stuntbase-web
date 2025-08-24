'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Send, 
  Calendar,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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

interface MySubmissionsWidgetProps {
  className?: string
}

export function MySubmissionsWidget({ className }: MySubmissionsWidgetProps) {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/projects/my-submissions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions')
      }

      setSubmissions(data.submissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  const getStatusIcon = (status: string) => {
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusBadge = (status: string) => {
    return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-900">Submitted</Badge>
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            My Submissions
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

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            My Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          My Submissions
        </CardTitle>
        <CardDescription>
          Projects you've submitted your profile to
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-6">
            <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-sm font-medium text-muted-foreground mb-2">No Submissions Yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Submit your profile to project databases to see them here
            </p>
            <Link href="/projects">
              <Button size="sm" variant="outline">
                Browse Projects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {submissions.slice(0, 5).map((submission) => (
              <div
                key={submission.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(submission.status)}
                      <h4 className="font-medium text-sm truncate">
                        {submission.project_databases.project_name}
                      </h4>
                    </div>
                    
                    {submission.project_databases.coordinator_name && (
                      <p className="text-xs text-muted-foreground mb-1">
                        by {submission.project_databases.coordinator_name}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted {formatDate(submission.submitted_at)}</span>
                    </div>


                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(submission.status)}
                    <Link href={`/projects/${submission.project_databases.id}`}>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {submissions.length > 5 && (
              <div className="pt-2 border-t">
                <Link href="/projects/my-submissions">
                  <Button variant="outline" size="sm" className="w-full">
                    View All {submissions.length} Submissions
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
