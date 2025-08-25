'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const coordinatorSchema = z.object({
  coordinator_name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters')
})

// Helper function to upload photo to Supabase storage
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

export async function createCoordinatorAction(formData: FormData) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to create a coordinator profile' }
  }

  // Parse and validate form data
  const rawData = {
    coordinator_name: formData.get('coordinator_name') as string
  }

  const validationResult = coordinatorSchema.safeParse(rawData)
  if (!validationResult.success) {
    return { 
      error: validationResult.error.errors[0].message 
    }
  }

  const { coordinator_name } = validationResult.data

  // Get profile photo
  const profilePhoto = formData.get('profile_photo') as File
  if (!profilePhoto || profilePhoto.size === 0) {
    return { error: 'Profile photo is required' }
  }

  try {
    // Check if user already has a coordinator record
    const { data: existingCoordinator } = await supabase
      .from('stunt_coordinators')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingCoordinator) {
      return { error: 'You already have a coordinator profile' }
    }

    // Check if user already has a performer profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      return { error: 'You already have a performer profile. You cannot be both a performer and coordinator.' }
    }

    // Upload profile photo
    const photoUrl = await uploadCoordinatorPhoto(supabase, user.id, profilePhoto)
    if (!photoUrl) {
      return { error: 'Failed to upload profile photo. Please try again.' }
    }

    // Create the coordinator record
    const { data: coordinator, error: coordinatorError } = await supabase
      .from('stunt_coordinators')
      .insert({
        user_id: user.id,
        coordinator_name: coordinator_name.trim(),
        photo_url: photoUrl
      })
      .select()
      .single()

    if (coordinatorError) {
      console.error('Error creating coordinator:', coordinatorError)
      return { error: 'Failed to create coordinator profile. Please try again.' }
    }

    return { success: true, coordinator }
  } catch (error) {
    console.error('Coordinator creation error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Alternative action that redirects server-side
export async function createCoordinatorWithRedirect(formData: FormData) {
  const result = await createCoordinatorAction(formData)
  
  if (result.success) {
    redirect('/dashboard')
  }
  
  return result
}
