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
      // Extract file names from full URLs
      const filePaths = photos.map(photo => {
        const url = photo.file_path
        const fileName = url.split('/').pop()
        return `${profileId}/${fileName}`
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
      const fileName = profile.resume_url.split('/').pop()
      if (fileName) {
        const { error: resumeStorageError } = await supabase.storage
          .from('resumes')
          .remove([`${user.id}/${fileName}`])

        if (resumeStorageError) {
          console.error('Error deleting resume from storage:', resumeStorageError)
          // Continue with deletion even if storage cleanup fails
        }
      }
    }

    // Delete related data (foreign key constraints should handle this, but being explicit)
    await supabase.from('profile_photos').delete().eq('profile_id', profileId)
    await supabase.from('profile_skills').delete().eq('profile_id', profileId)
    await supabase.from('profile_certifications').delete().eq('profile_id', profileId)

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
