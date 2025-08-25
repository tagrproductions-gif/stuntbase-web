'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { ProfileForm } from '@/components/profile/profile-form'
import { createProfileAction } from './actions'
import { uploadProfilePhoto, addProfilePhoto } from '@/lib/supabase/profiles'
import { ProfileData, SkillData, CertificationData } from '@/lib/validations/profile'

interface PhotoData {
  file: File
  preview: string
}

interface ProfileCreateFormProps {
  user: User
}

export function ProfileCreateForm({ user }: ProfileCreateFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: {
    profile: ProfileData
    skills: SkillData[]
    certifications: CertificationData[]
    photos: PhotoData[]
    resume?: File | null
  }) => {
    // Prevent double submission
    if (loading) {
      console.log('Create form - Already processing, ignoring duplicate submission')
      return
    }
    
    setLoading(true)

    try {
      // Handle resume upload first if provided
      let resumeUploadResult = null
      if (data.resume) {
        console.log('Create form - Uploading resume first...')
        try {
          const { uploadResume } = await import('@/lib/supabase/resumes')
          const { createClient } = await import('@/lib/supabase/client')
          const { data: { user } } = await createClient().auth.getUser()
          if (user) {
            const uploadResult = await uploadResume(data.resume, user.id)
            if (uploadResult.url) {
              resumeUploadResult = {
                url: uploadResult.url,
                fileName: uploadResult.fileName,
                fileSize: uploadResult.fileSize,
                extractedText: uploadResult.extractedText
              }
              console.log('Create form - Resume uploaded:', resumeUploadResult)
            } else {
              console.error('Create form - Resume upload failed:', uploadResult.error)
              throw new Error(`Resume upload failed: ${uploadResult.error}`)
            }
          }
        } catch (error) {
          console.error('Create form - Resume upload failed:', error)
          throw new Error(`Resume upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Create the profile using server action (handles authentication properly)
      const profile = await createProfileAction(data.profile, data.skills, data.certifications, resumeUploadResult)

      // Upload and add photos if any
      if (data.photos.length > 0) {
        console.log(`Uploading ${data.photos.length} photos for profile ${profile.id}`)
        
        for (let i = 0; i < data.photos.length; i++) {
          const photo = data.photos[i]
          console.log(`Processing photo ${i + 1}/${data.photos.length}`)
          
          try {
            // Upload to Supabase Storage
            const { url, error: uploadError } = await uploadProfilePhoto(photo.file, profile.id)
            
            if (uploadError || !url) {
              console.error('Error uploading photo:', uploadError)
              // Still throw error to alert user that photos didn't save
              throw new Error(`Failed to upload photo: ${uploadError?.message || 'Unknown error'}`)
            }

            console.log('Photo uploaded successfully:', url)

            // Add photo record to database
            const { error: photoError } = await addProfilePhoto(
              profile.id, 
              url, 
              i === 0 // First photo is primary
            )
            
            if (photoError) {
              console.error('Error adding photo record:', photoError)
              throw new Error(`Failed to save photo record: ${photoError.message}`)
            }
            
            console.log(`Photo ${i + 1} saved successfully`)
          } catch (error) {
            console.error('Error processing photo:', error)
            // Re-throw to show user that photo upload failed
            throw new Error(`Photo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
        console.log('All photos uploaded successfully')
      }

      // Redirect to the new profile
      router.push(`/profile/${profile.id}`)
      router.refresh()

    } catch (error) {
      console.error('Profile creation error:', error)
      throw error // Re-throw to show error in form
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileForm
      initialData={{ email: user.email || '' }}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Profile"
    />
  )
}
