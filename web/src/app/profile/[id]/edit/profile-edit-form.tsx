'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { updateProfileAction } from './actions'
import { uploadPhotoAction, addPhotoAction, deletePhotoAction, updatePhotoOrderAction } from './actions'
import { ProfileData, SkillData, CertificationData } from '@/lib/validations/profile'
import { createClient } from '@/lib/supabase/client'

interface PhotoData {
  file: File
  preview: string
}

interface ExistingPhoto {
  id: number
  profile_id: string
  file_path: string
  file_name: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

interface ProfileEditFormProps {
  profile: any // Profile with related data
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Transform profile skills/certifications to form format
  const initialSkills: SkillData[] = profile.profile_skills?.map((ps: any) => ({
    skill_id: ps.skill_id,
    proficiency_level: ps.proficiency_level
  })) || []

  const initialCertifications: CertificationData[] = profile.profile_certifications?.map((pc: any) => ({
    certification_id: pc.certification_id,
    date_obtained: pc.date_obtained || '',
    expiry_date: pc.expiry_date || '',
    certification_number: pc.certification_number || ''
  })) || []

  const handleSubmit = async (data: {
    profile: ProfileData
    skills: SkillData[]
    certifications: CertificationData[]
    photos: PhotoData[]
    resume?: File | null
    existingPhotos?: ExistingPhoto[]
    deletedPhotoIds?: number[]
  }) => {
    console.log('Edit form - Starting update...')
    console.log('Edit form - Profile ID:', profile.id)
    console.log('Edit form - Data to update:', data.profile)
    console.log('Edit form - Skills:', data.skills)
    console.log('Edit form - Certifications:', data.certifications)
    
    setLoading(true)

    try {
      console.log('Edit form - Starting form submission with error handling...')
      
      // Handle deleted photos first
      if (data.deletedPhotoIds && data.deletedPhotoIds.length > 0) {
        console.log('Edit form - Deleting photos:', data.deletedPhotoIds)
        for (const photoId of data.deletedPhotoIds) {
          const { error } = await deletePhotoAction(photoId)
          if (error) {
            console.error('Edit form - Error deleting photo:', photoId, error)
          }
        }
      }

      // Update existing photo order if changed
      if (data.existingPhotos && data.existingPhotos.length > 0) {
        console.log('Edit form - Updating photo order...')
        const photoUpdates = data.existingPhotos.map((photo, index) => ({
          id: photo.id,
          sort_order: index + 1,
          is_primary: index === 0
        }))
        
        const { error: orderError } = await updatePhotoOrderAction(profile.id, photoUpdates)
        if (orderError) {
          console.error('Edit form - Error updating photo order:', orderError)
        }
      }
      
      // Handle resume upload first if provided
      let resumeUploadResult = null
      if (data.resume) {
        console.log('Edit form - Uploading resume first...')
        try {
          const { uploadResume } = await import('@/lib/supabase/resumes')
          const { data: { user } } = await createClient().auth.getUser()
          if (user) {
            const uploadResult = await uploadResume(data.resume, user.id)
            if (uploadResult.url) {
              resumeUploadResult = {
                url: uploadResult.url,
                fileName: uploadResult.fileName,
                fileSize: uploadResult.fileSize
              }
              console.log('Edit form - Resume uploaded:', resumeUploadResult)
            } else {
              console.error('Edit form - Resume upload failed:', uploadResult.error)
            }
          }
        } catch (error) {
          console.error('Edit form - Resume upload failed:', error)
        }
      }

      // Update the profile using server action (without the file object)
      console.log('Edit form - Calling updateProfileAction...')
      const updatedProfile = await updateProfileAction(profile.id, data.profile, data.skills, data.certifications, resumeUploadResult)
      console.log('Edit form - Update successful:', updatedProfile)

      // Upload new photos if any
      console.log('Edit form - Checking photos to upload:', data.photos.length)
      if (data.photos.length > 0) {
        console.log('Edit form - Starting photo upload process...')
        for (let i = 0; i < data.photos.length; i++) {
          const photo = data.photos[i]
          console.log(`Edit form - Processing photo ${i + 1}/${data.photos.length}:`, photo.file.name, photo.file.size)
          
          try {
            console.log('Edit form - Uploading to storage...')
            const formData = new FormData()
            formData.append('file', photo.file)
            formData.append('profileId', profile.id)
            const { url, error: uploadError } = await uploadPhotoAction(formData)
            
            if (uploadError || !url) {
              console.error('Edit form - Error uploading photo:', uploadError)
              continue
            }
            
            console.log('Edit form - Photo uploaded successfully, URL:', url)
            console.log('Edit form - Adding photo record to database...')
            const { error: photoError } = await addPhotoAction(
              profile.id, 
              url, 
              false // New photos are not primary by default
            )
            
            if (photoError) {
              console.error('Edit form - Error adding photo record:', photoError)
            } else {
              console.log('Edit form - Photo record added successfully')
            }
          } catch (error) {
            console.error('Edit form - Error processing photo:', error)
          }
        }
        console.log('Edit form - Photo upload process completed')
      } else {
        console.log('Edit form - No photos to upload')
      }

      // Redirect to the profile view
      console.log('Edit form - Redirecting to profile...')
      router.push(`/profile/${profile.id}`)
      router.refresh()

    } catch (error) {
      console.error('Profile update error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        name: error instanceof Error ? error.name : 'Unknown',
      })
      alert(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileForm
      initialData={profile}
      initialSkills={initialSkills}
      initialCertifications={initialCertifications}
      initialPhotos={profile.profile_photos || []}
      initialResume={profile.resume_url ? {
        url: profile.resume_url,
        filename: profile.resume_filename || 'resume.pdf',
        size: profile.resume_file_size || 0,
        uploadedAt: profile.resume_uploaded_at || ''
      } : undefined}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Update Profile"
      isEdit={true}
    />
  )
}
