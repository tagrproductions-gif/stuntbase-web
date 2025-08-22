'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // First verify the current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (verifyError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, message: 'Password updated successfully' }

  } catch (error) {
    console.error('Password change error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to change password'
    }
  }
}

export async function deleteProfileAction(profileId: string) {
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  // Get the profile to make sure it belongs to the current user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', user.id) // Security check
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found or access denied')
  }

  try {
    // Delete profile photos from storage and database
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('file_path')
      .eq('profile_id', profileId)

    if (photos && photos.length > 0) {
      // Extract storage paths from full URLs
      // URLs look like: https://...supabase.co/storage/v1/object/public/profile-photos/{storage-path}
      const filePaths = photos.map(photo => {
        const url = photo.file_path
        // Extract everything after '/profile-photos/' in the URL
        const match = url.match(/\/profile-photos\/(.+)$/)
        if (match) {
          return match[1] // This gives us the actual storage path like "userId/profileId/filename"
        }
        // Fallback: extract filename and guess the path
        const fileName = url.split('/').pop()
        return `${user.id}/${profileId}/${fileName}`
      })

      // Delete files from storage
      const { error: storageError } = await supabase.storage
        .from('profile-photos')
        .remove(filePaths)

      if (storageError) {
        console.error('Error deleting photos from storage:', storageError)
        // Continue with deletion even if storage cleanup fails
      }
    }

    // Delete resume from storage if exists
    if (profile.resume_url) {
      // Extract storage path from full URL
      // URLs look like: https://...supabase.co/storage/v1/object/public/resumes/{storage-path}
      const match = profile.resume_url.match(/\/resumes\/(.+)$/)
      if (match) {
        const storagePath = match[1] // This gives us the actual storage path like "userId/resume_timestamp.pdf"
        const { error: resumeStorageError } = await supabase.storage
          .from('resumes')
          .remove([storagePath])

        if (resumeStorageError) {
          console.error('Error deleting resume from storage:', resumeStorageError)
          // Continue with deletion even if storage cleanup fails
        }
      }
    }

    // Delete related data - CASCADE constraints automatically handle this now
    // No need for explicit deletion of profile_photos, profile_skills, profile_certifications
    // The foreign key constraints with CASCADE will automatically delete these

    // Finally, delete the profile itself
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id) // Double security check

    if (deleteError) {
      throw new Error(`Failed to delete profile: ${deleteError.message}`)
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/profile')

    return { success: true }

  } catch (error) {
    console.error('Profile deletion error:', error)
    throw new Error(`Failed to delete profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
