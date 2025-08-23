import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { ProfileData, SkillData, CertificationData } from '@/lib/validations/profile'
import { Profile, Skill, Certification } from '@/types/database'

export async function createProfile(profileData: ProfileData, userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      full_name: profileData.full_name,
      email: profileData.email,
      // Convert empty strings to null for optional fields
      bio: profileData.bio || null,
      location: profileData.location || null,
      phone: profileData.phone || null,
      hair_color: profileData.hair_color || null,
      eye_color: profileData.eye_color || null,
      ethnicity: profileData.ethnicity || null,
      gender: profileData.gender || null,
      union_status: profileData.union_status || null,
      emergency_contact_name: (profileData as any).emergency_contact_name || null,
      emergency_contact_phone: (profileData as any).emergency_contact_phone || null,
      website: profileData.website || null,
      imdb_url: profileData.imdb_url || null,
      reel_url: profileData.reel_url || null,
      instagram: (profileData as any).instagram || null,
      twitter: (profileData as any).twitter || null,
      facebook: (profileData as any).facebook || null,
      availability_status: profileData.availability_status || null,
      // Convert NaN to null for number fields
      height_feet: isNaN(profileData.height_feet as number) ? null : profileData.height_feet,
      height_inches: isNaN(profileData.height_inches as number) ? null : profileData.height_inches,
      weight_lbs: isNaN(profileData.weight_lbs as number) ? null : profileData.weight_lbs,
      experience_years: isNaN((profileData as any).experience_years as number) ? null : (profileData as any).experience_years,
      travel_radius: profileData.travel_radius,
      day_rate_min: isNaN((profileData as any).day_rate_min as number) ? null : (profileData as any).day_rate_min,
      day_rate_max: isNaN((profileData as any).day_rate_max as number) ? null : (profileData as any).day_rate_max,
      rates_week: isNaN((profileData as any).rates_week as number) ? null : (profileData as any).rates_week,
      rates_month: isNaN((profileData as any).rates_month as number) ? null : (profileData as any).rates_month,
      is_public: profileData.is_public,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateProfile(profileId: string, profileData: Partial<ProfileData>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select()
    .single()

  return { data, error }
}

export async function getProfile(profileId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_skills (
        id,
        proficiency_level,
        skill_id
      ),
      profile_certifications (
        id,
        date_obtained,
        expiry_date,
        certification_number,
        certification_id
      ),
      profile_photos (
        id,
        file_path,
        file_name,
        is_primary,
        sort_order
      )
    `)
    .eq('id', profileId)
    .single()

  return { data, error }
}

export async function getProfileByUserId(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function getAllSkills() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category, name')

  return { data, error }
}

export async function getAllCertifications() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('issuing_organization, name')

  return { data, error }
}

export async function addProfileSkills(profileId: string, skills: SkillData[]) {
  const supabase = createClient()
  
  const skillData = skills.map(skill => ({
    profile_id: profileId,
    skill_id: skill.skill_id,
    proficiency_level: skill.proficiency_level
  }))
  
  const { data, error } = await supabase
    .from('profile_skills')
    .insert(skillData)
    .select()

  return { data, error }
}

export async function updateProfileSkills(profileId: string, skills: SkillData[]) {
  const supabase = createClient()
  
  // First, delete existing skills
  await supabase
    .from('profile_skills')
    .delete()
    .eq('profile_id', profileId)
  
  // Then add new skills
  return addProfileSkills(profileId, skills)
}

export async function addProfileCertifications(profileId: string, certifications: CertificationData[]) {
  const supabase = createClient()
  
  const certData = certifications.map(cert => ({
    profile_id: profileId,
    certification_id: cert.certification_id,
    date_obtained: cert.date_obtained || null,
    expiry_date: cert.expiry_date || null,
    certification_number: cert.certification_number || null
  }))
  
  const { data, error } = await supabase
    .from('profile_certifications')
    .insert(certData)
    .select()

  return { data, error }
}

export async function updateProfileCertifications(profileId: string, certifications: CertificationData[]) {
  const supabase = createClient()
  
  // First, delete existing certifications
  await supabase
    .from('profile_certifications')
    .delete()
    .eq('profile_id', profileId)
  
  // Then add new certifications
  return addProfileCertifications(profileId, certifications)
}

export async function uploadProfilePhoto(file: File, profileId: string): Promise<{ url: string | null; error: any }> {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${profileId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file)

  if (error) {
    return { url: null, error }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}

export async function addProfilePhoto(profileId: string, photoUrl: string, isPrimary: boolean = false) {
  const supabase = createClient()
  
  // Get current max sort order
  const { data: photos } = await supabase
    .from('profile_photos')
    .select('sort_order')
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: false })
    .limit(1)
  
  const nextOrder = photos && photos.length > 0 ? photos[0].sort_order + 1 : 1
  
  // Extract file name from URL for file_name column
  const fileName = photoUrl.split('/').pop() || 'unknown'
  
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

  return { data, error }
}

export async function deleteProfilePhoto(photoId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId)

  return { error }
}
