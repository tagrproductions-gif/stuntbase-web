'use server'

import { createClient } from '@/lib/supabase/server'
import { ProfileData, SkillData, CertificationData } from '@/lib/validations/profile'
import { uploadResumeServer } from '@/lib/supabase/resumes'
import { redirect } from 'next/navigation'

export async function uploadPhotoAction(formData: FormData): Promise<{ url: string | null; error: any }> {
  const file = formData.get('file') as File
  const profileId = formData.get('profileId') as string
  
  console.log('Server - uploadPhotoAction called for profile:', profileId, 'file:', file?.name)
  const supabase = createClient()
  
  if (!file || !profileId) {
    return { url: null, error: 'Missing file or profile ID' }
  }
  
  // Verify user owns this profile
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Server - User authenticated:', !!user, user?.id)
  if (!user) {
    return { url: null, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  console.log('Server - Profile ownership check:', profile?.user_id, 'vs', user.id)
  if (!profile || profile.user_id !== user.id) {
    return { url: null, error: 'Unauthorized' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${profileId}/${Date.now()}.${fileExt}`
  console.log('Server - Uploading file as:', fileName)
  
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file)

  if (error) {
    console.error('Server - Storage upload error:', error)
    return { url: null, error }
  }

  console.log('Server - File uploaded successfully:', data.path)
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName)

  console.log('Server - Public URL generated:', publicUrl)
  return { url: publicUrl, error: null }
}

export async function addPhotoAction(profileId: string, photoUrl: string, caption?: string, isPrimary: boolean = false) {
  console.log('Server - addPhotoAction called for profile:', profileId, 'URL:', photoUrl)
  const supabase = createClient()
  
  // Verify user owns this profile
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Server - User authenticated for photo record:', !!user, user?.id)
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  console.log('Server - Profile ownership check for photo:', profile?.user_id, 'vs', user.id)
  if (!profile || profile.user_id !== user.id) {
    return { data: null, error: 'Unauthorized' }
  }

  // Get current max sort order
  const { data: photos } = await supabase
    .from('profile_photos')
    .select('sort_order')
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: false })
    .limit(1)
  
  const nextOrder = photos && photos.length > 0 ? photos[0].sort_order + 1 : 1
  console.log('Server - Setting sort order:', nextOrder)
  
  // Extract file name from URL for file_name column
  const fileName = photoUrl.split('/').pop() || 'unknown'
  console.log('Server - Extracted file name:', fileName)
  
  const { data, error } = await supabase
    .from('profile_photos')
    .insert({
      profile_id: profileId,
      file_path: photoUrl,
      file_name: fileName,
      is_primary: isPrimary,
      sort_order: nextOrder
    })
    .select()
    .single()

  if (error) {
    console.error('Server - Database insert error:', error)
  } else {
    console.log('Server - Photo record inserted successfully:', data.id)
  }

  return { data, error }
}

export async function deletePhotoAction(photoId: number) {
  console.log('Server - deletePhotoAction called for photo:', photoId)
  const supabase = createClient()
  
  // Verify user owns this photo
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get photo details and verify ownership
  const { data: photo } = await supabase
    .from('profile_photos')
    .select(`
      *,
      profiles!inner(user_id)
    `)
    .eq('id', photoId)
    .single()

  if (!photo || photo.profiles.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Delete from storage
  try {
    const fileName = photo.file_path.split('/').pop()
    if (fileName) {
      await supabase.storage
        .from('profile-photos')
        .remove([`${user.id}/${photo.profile_id}/${fileName}`])
    }
  } catch (e) {
    console.warn('Could not delete file from storage:', e)
  }

  // Delete from database
  const { error } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId)

  return { error }
}

export async function updatePhotoOrderAction(profileId: string, photoUpdates: Array<{id: number, sort_order: number, is_primary: boolean}>) {
  console.log('Server - updatePhotoOrderAction called for profile:', profileId)
  const supabase = createClient()
  
  // Verify user owns this profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (!profile || profile.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Update each photo
  const errors = []
  for (const update of photoUpdates) {
    const { error } = await supabase
      .from('profile_photos')
      .update({
        sort_order: update.sort_order,
        is_primary: update.is_primary
      })
      .eq('id', update.id)

    if (error) {
      console.error('Error updating photo:', update.id, error)
      errors.push(error)
    }
  }

  return { error: errors.length > 0 ? errors[0] : null }
}

export async function updateProfileAction(
  profileId: string, 
  profileData: ProfileData, 
  skills: SkillData[], 
  certifications: CertificationData[],
  resumeUploadResult?: { url: string; fileName: string; fileSize: number } | null
) {
  console.log('Server action - updateProfileAction called')
  console.log('Server action - Profile ID:', profileId)
  console.log('Server action - Profile data:', profileData)
  
  const supabase = createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('Server action - User:', user?.id)
  console.log('Server action - User error:', userError)
  
  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  // Verify user owns this profile
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single()

  if (checkError || !existingProfile || existingProfile.user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  // Resume data is already uploaded and passed in
  const resumeData = resumeUploadResult

  // Update the profile with server-side authentication
  console.log('Server action - Starting profile update...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.full_name,
      email: profileData.email || null,
      // Convert empty strings to null for optional fields
      bio: profileData.bio || null,
      location: profileData.location || null,
      secondary_location: profileData.secondary_location || null,
      // New structured location fields
      primary_location_structured: profileData.primary_location_structured || null,
      secondary_location_structured: profileData.secondary_location_structured || null,
      travel_radius: profileData.travel_radius || 'local',
      phone: profileData.phone || null,
      hair_color: profileData.hair_color || null,
      ethnicity: profileData.ethnicity || null,
      gender: profileData.gender || null,
      union_status: profileData.union_status || null,
      loan_out_status: profileData.loan_out_status || 'Unknown',
      website: profileData.website || null,
      imdb_url: profileData.imdb_url || null,
      reel_url: profileData.reel_url || null,
      availability_status: profileData.availability_status || null,
      // Convert NaN to null for number fields
      height_feet: isNaN(profileData.height_feet as number) ? null : profileData.height_feet,
      height_inches: isNaN(profileData.height_inches as number) ? null : profileData.height_inches,
      weight_lbs: isNaN(profileData.weight_lbs as number) ? null : profileData.weight_lbs,
      // Universal wardrobe fields
      shirt_neck: isNaN(profileData.shirt_neck as number) ? null : profileData.shirt_neck,
      shirt_sleeve: isNaN(profileData.shirt_sleeve as number) ? null : profileData.shirt_sleeve,
      pants_waist: isNaN(profileData.pants_waist as number) ? null : profileData.pants_waist,
      pants_inseam: isNaN(profileData.pants_inseam as number) ? null : profileData.pants_inseam,
      shoe_size: isNaN(profileData.shoe_size as number) ? null : profileData.shoe_size,
      t_shirt_size: profileData.t_shirt_size || null,
      hat_size: profileData.hat_size || null,
      glove_size: profileData.glove_size || null,
      // Male-specific wardrobe fields
      jacket_size: isNaN(profileData.jacket_size as number) ? null : profileData.jacket_size,
      jacket_length: profileData.jacket_length || null,
      // Female-specific wardrobe fields
      dress_size: isNaN(profileData.dress_size as number) ? null : profileData.dress_size,
      pants_size: isNaN(profileData.pants_size as number) ? null : profileData.pants_size,
      underbust: isNaN(profileData.underbust as number) ? null : profileData.underbust,
      hips: isNaN(profileData.hips as number) ? null : profileData.hips,
      chest: isNaN(profileData.chest as number) ? null : profileData.chest,
      waist: isNaN(profileData.waist as number) ? null : profileData.waist,
      // Resume data - only update if new resume uploaded
      ...(resumeData && {
        resume_url: resumeData.url,
        resume_filename: resumeData.fileName,
        resume_file_size: resumeData.fileSize,
        resume_uploaded_at: new Date().toISOString(),
      }),
      is_public: profileData.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select()
    .single()

  console.log('Server action - Profile update result:', profile)
  console.log('Server action - Profile update error:', profileError)
  
  if (profileError) {
    throw new Error(profileError.message)
  }

  // Update skills - delete existing and insert new ones
  await supabase
    .from('profile_skills')
    .delete()
    .eq('profile_id', profileId)

  if (skills.length > 0) {
    const skillData = skills.map(skill => ({
      profile_id: profileId,
      skill_id: skill.skill_id,
      proficiency_level: skill.proficiency_level
    }))
    
    const { error: skillsError } = await supabase
      .from('profile_skills')
      .insert(skillData)

    if (skillsError) {
      console.error('Error updating skills:', skillsError)
    }
  }

  // Update certifications - delete existing and insert new ones
  await supabase
    .from('profile_certifications')
    .delete()
    .eq('profile_id', profileId)

  if (certifications.length > 0) {
    const certData = certifications.map(cert => ({
      profile_id: profileId,
      certification_id: cert.certification_id,
      date_obtained: cert.date_obtained || null,
      expiry_date: cert.expiry_date || null,
      certification_number: cert.certification_number || null
    }))
    
    const { error: certsError } = await supabase
      .from('profile_certifications')
      .insert(certData)

    if (certsError) {
      console.error('Error updating certifications:', certsError)
    }
  }

  return profile
}
