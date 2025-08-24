'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/navigation/navbar'
import { Settings, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createCoordinatorAction, createCoordinatorWithRedirect } from './actions'
import { CoordinatorPhotoUpload } from '@/components/profile/coordinator-photo-upload'

interface PhotoData {
  file: File
  preview: string
}

export default function CreateCoordinatorPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<PhotoData | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    // Validate required fields
    const coordinatorName = formData.get('coordinator_name') as string
    const missingFields: string[] = []

    if (!coordinatorName?.trim()) {
      missingFields.push('Your Name')
    }

    if (!photo) {
      missingFields.push('Profile Photo')
    }

    if (missingFields.length > 0) {
      const errorMessage = missingFields.length === 1 
        ? `${missingFields[0]} is required`
        : `The following fields are required: ${missingFields.join(', ')}`
      setError(errorMessage)
      setIsSubmitting(false)
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Add photo to form data
    formData.append('profile_photo', photo.file)

    try {
      const result = await createCoordinatorAction(formData)
      
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        // Clean up photo preview URL
        if (photo?.preview) {
          URL.revokeObjectURL(photo.preview)
        }
        // Force a hard redirect to ensure proper navigation
        window.location.href = '/dashboard'
        return // Don't set isSubmitting to false as we're redirecting
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/profile/role-selection" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to role selection
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl">Become a Stunt Coordinator</CardTitle>
            <CardDescription className="text-base">
              Enter your name to start creating project databases and finding performers for your productions.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="coordinator_name" className="text-sm font-medium">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="coordinator_name"
                  name="coordinator_name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                  className="text-base"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  This name will be displayed when you create project databases.
                </p>
              </div>

              <CoordinatorPhotoUpload
                photo={photo}
                onPhotoChange={setPhoto}
              />

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">Please complete the following:</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full text-base py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Coordinator Profile'}
                </Button>
                
                <div className="text-center">
                  <Link 
                    href="/profile/role-selection" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Changed your mind? Go back to role selection
                  </Link>
                </div>
              </div>
            </form>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium mb-2">What you can do as a Stunt Coordinator:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create project databases for your productions</li>
                <li>• Review and manage performer submissions</li>
                <li>• Search and discover talented stunt performers</li>
                <li>• Your profile will not appear in performer searches</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
