'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/navigation/navbar'
import { Database, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateProjectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    filming_location: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required'
    } else if (formData.project_name.length > 100) {
      newErrors.project_name = 'Project name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (formData.filming_location && formData.filming_location.length > 100) {
      newErrors.filming_location = 'Filming location must be less than 100 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      // Redirect to projects page with success
      router.push('/projects?created=true')
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (authLoading) {
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
            <h1 className="text-3xl font-bold mb-4">Create Project Database</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to create your project database
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
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-8 w-8" />
            Create Project Database
          </h1>
          <p className="text-muted-foreground mt-2">
            Set up a dedicated database for your project to collect and manage stunt performer submissions
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide information about your project to attract the right performers
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <Label htmlFor="project_name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  placeholder="e.g., Stranger Things Season 5, John Wick 5, etc."
                  className={errors.project_name ? 'border-destructive' : ''}
                  maxLength={100}
                />
                {errors.project_name && (
                  <p className="text-sm text-destructive mt-1">{errors.project_name}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.project_name.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide details about the project, types of stunts needed, filming dates, etc."
                  className={errors.description ? 'border-destructive' : ''}
                  rows={4}
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Primary Filming Location */}
              <div>
                <Label htmlFor="filming_location">Primary Filming Location (Optional)</Label>
                <Input
                  id="filming_location"
                  value={formData.filming_location}
                  onChange={(e) => handleInputChange('filming_location', e.target.value)}
                  placeholder="NY, New York"
                  className={errors.filming_location ? 'border-destructive' : ''}
                  maxLength={100}
                />
                {errors.filming_location && (
                  <p className="text-sm text-destructive mt-1">{errors.filming_location}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.filming_location.length}/100 characters
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 rounded-md bg-muted/50 border border-muted">
                <h3 className="font-semibold text-sm mb-2">What happens after you create this project?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your project will appear in the Projects directory</li>
                  <li>• Stunt performers can submit their profiles to your project</li>
                  <li>• You'll be able to search within your project's submitted profiles</li>
                  <li>• You can manage submissions and filter through candidates</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Link href="/projects">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
