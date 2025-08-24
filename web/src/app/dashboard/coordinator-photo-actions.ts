'use server'

import { createClient } from '@/lib/supabase/server'

// Helper function to delete old photo from storage
async function deleteCoordinatorPhotoFromStorage(supabase: any, photoUrl: string): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlParts = photoUrl.split('/profile-photos/')
    if (urlParts.length < 2) return false
    
    const filePath = urlParts[1]
    
    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([filePath])

    if (error) {
      console.error('Error deleting old photo from storage:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error deleting old photo:', error)
    return false
  }
}

// Helper function to upload new coordinator photo
async function uploadCoordinatorPhoto(supabase: any, userId: string, photoFile: File): Promise<string | null> {
  try {
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `coordinators/${fileName}`

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Photo upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Photo upload error:', error)
    return null
  }
}

export async function updateCoordinatorPhotoAction(formData: FormData) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to update your photo' }
  }

  // Get the new photo file
  const profilePhoto = formData.get('profile_photo') as File
  if (!profilePhoto || profilePhoto.size === 0) {
    return { error: 'Profile photo is required' }
  }

  try {
    // Get current coordinator record
    const { data: coordinator, error: coordinatorError } = await supabase
      .from('stunt_coordinators')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (coordinatorError || !coordinator) {
      return { error: 'Coordinator profile not found' }
    }

    // Upload new photo
    const newPhotoUrl = await uploadCoordinatorPhoto(supabase, user.id, profilePhoto)
    if (!newPhotoUrl) {
      return { error: 'Failed to upload new photo. Please try again.' }
    }

    // Delete old photo from storage if it exists
    if (coordinator.profile_photo_url) {
      await deleteCoordinatorPhotoFromStorage(supabase, coordinator.profile_photo_url)
    }

    // Update coordinator record with new photo URL
    const { error: updateError } = await supabase
      .from('stunt_coordinators')
      .update({
        profile_photo_url: newPhotoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating coordinator photo:', updateError)
      return { error: 'Failed to update photo. Please try again.' }
    }

    return { success: true, photoUrl: newPhotoUrl }
  } catch (error) {
    console.error('Coordinator photo update error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
