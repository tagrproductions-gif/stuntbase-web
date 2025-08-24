import { z } from 'zod'
import { ALL_ETHNIC_APPEARANCE_VALUES } from '@/lib/constants/ethnic-appearance'

export const profileSchema = z.object({
  // Personal Information
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  bio: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Contact Information  
  email: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  phone: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Legacy location fields (keep for backward compatibility)
  location: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  secondary_location: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // New structured location fields
  primary_location_structured: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  secondary_location_structured: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  travel_radius: z.union([z.enum(['local', '50', '100', '200', 'state', 'regional', 'national', 'international']), z.string(), z.null()]).optional().transform(val => val === null ? 'local' : val || 'local'),
  
  // Physical Attributes
  height_feet: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  height_inches: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  weight_lbs: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  hair_color: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  eye_color: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  ethnicity: z.union([z.enum(ALL_ETHNIC_APPEARANCE_VALUES as [string, ...string[]]), z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  gender: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Professional Information
  union_status: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  loan_out_status: z.union([z.string(), z.null()]).optional().transform(val => val === null ? 'Unknown' : val || 'Unknown'),
  
  // Availability
  availability_status: z.union([z.enum(['available', 'busy', 'unavailable']), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return '';
    return val;
  }),
  
  // Universal Wardrobe Fields
  shirt_neck: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  shirt_sleeve: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  pants_waist: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  pants_inseam: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  shoe_size: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  t_shirt_size: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  hat_size: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  glove_size: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Male-specific Wardrobe Fields
  jacket_size: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  jacket_length: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Female-specific Wardrobe Fields
  dress_size: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  pants_size: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  underbust: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  hips: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  chest: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  waist: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  
  // Social Media & Links (removed instagram)
  website: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  imdb_url: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  reel_url: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Resume fields
  resume_url: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  resume_filename: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  resume_file_size: z.union([z.number(), z.string(), z.null()]).optional().transform(val => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  resume_uploaded_at: z.union([z.string(), z.null()]).optional().transform(val => val === null ? '' : val || ''),
  
  // Profile Settings
  is_public: z.boolean().default(true),
})

export const skillSchema = z.object({
  skill_id: z.string().uuid('Invalid skill ID'),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    required_error: 'Proficiency level is required'
  })
})

export const certificationSchema = z.object({
  certification_id: z.string().uuid('Invalid certification ID'),
  date_obtained: z.string().optional().or(z.literal('')),
  expiry_date: z.string().optional().or(z.literal('')),
  certification_number: z.string().max(100, 'Certification number too long').optional().or(z.literal(''))
})

export const photoSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a valid image file' })
})

export const profileFormSchema = z.object({
  profile: profileSchema,
  skills: z.array(skillSchema).max(20, 'Maximum 20 skills allowed'),
  certifications: z.array(certificationSchema).max(10, 'Maximum 10 certifications allowed'),
  photos: z.array(photoSchema).min(1, 'At least 1 photo is required').max(5, 'Maximum 5 photos allowed')
})

export type ProfileFormData = z.infer<typeof profileFormSchema>
export type ProfileData = z.infer<typeof profileSchema>
export type SkillData = z.infer<typeof skillSchema>
export type CertificationData = z.infer<typeof certificationSchema>
export type PhotoData = z.infer<typeof photoSchema>
