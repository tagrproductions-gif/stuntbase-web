'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleSkills, SimpleSkill } from './simple-skills'
import { SimpleCertifications, SimpleCertification } from './simple-certifications'
import { PhotoUpload } from './photo-upload'
import { EnhancedPhotoUpload } from './enhanced-photo-upload'
import { ResumeUpload } from './resume-upload'
import { profileSchema, ProfileData, SkillData, CertificationData } from '@/lib/validations/profile'
import { normalizeLocation, normalizeName, convertSimpleSkillsToDatabase, convertSimpleCertificationsToDatabase } from '@/lib/text-utils'
import { TIER1_MARKETS, TIER2_MARKETS, INTERNATIONAL_MARKETS, TRAVEL_RADIUS_OPTIONS } from '@/lib/constants/locations'
import { ETHNIC_APPEARANCE_OPTIONS } from '@/lib/constants/ethnic-appearance'
import { AlertCircle, Save, User, Phone, Globe, DollarSign, Shield } from 'lucide-react'

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

interface ProfileFormProps {
  initialData?: Partial<ProfileData>
  initialSkills?: SkillData[]
  initialCertifications?: CertificationData[]
  initialPhotos?: ExistingPhoto[]
  initialResume?: {
    url: string
    filename: string
    size: number
    uploadedAt: string
  }
  onSubmit: (data: {
    profile: ProfileData
    skills: SkillData[]
    certifications: CertificationData[]
    photos: PhotoData[]
    resume?: File | null
    existingPhotos?: ExistingPhoto[]
    deletedPhotoIds?: number[]
  }) => Promise<void>
  loading?: boolean
  submitLabel?: string
  isEdit?: boolean
}

export function ProfileForm({
  initialData,
  initialSkills = [],
  initialCertifications = [],
  initialPhotos = [],
  initialResume,
  onSubmit,
  loading = false,
  submitLabel = 'Create Profile',
  isEdit = false
}: ProfileFormProps) {
  const [skills, setSkills] = useState<SimpleSkill[]>(
    initialSkills.map(skill => ({
      name: skill.skill_id, // Convert from database format
      proficiency_level: skill.proficiency_level
    }))
  )
  const [certifications, setCertifications] = useState<SimpleCertification[]>(
    initialCertifications.map(cert => ({
      name: cert.certification_id // Convert from database format
    }))
  )
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [resume, setResume] = useState<File | null>(null)
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(initialPhotos)
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Transform null values to empty strings for form display
  const transformedInitialData = initialData ? Object.fromEntries(
    Object.entries(initialData).map(([key, value]) => [
      key, 
      value === null ? '' : value
    ])
  ) : {}

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      availability_status: 'available',
      is_public: true,
      ...transformedInitialData
    }
  })

  const handleDeleteExistingPhoto = (photoId: number) => {
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId))
    setDeletedPhotoIds(prev => [...prev, photoId])
  }

  const onFormSubmit = async (data: ProfileData) => {
    console.log('ProfileForm - Form submission triggered')
    console.log('📄 ProfileForm - Resume state:', resume)
    console.log('📄 ProfileForm - Resume file details:', resume ? {
      name: resume.name,
      size: resume.size,
      type: resume.type
    } : 'No resume file')
    setSubmitError(null)
    
    // Enhanced validation for new profile creation (not for edits)
    if (!isEdit) {
      const missingFields: string[] = []

      // Check required fields
      if (!data.full_name?.trim()) {
        missingFields.push('Full Name')
      }

      if (photos.length === 0 && existingPhotos.length === 0) {
        missingFields.push('At least 1 Photo')
      }

      if (missingFields.length > 0) {
        const errorMessage = missingFields.length === 1 
          ? `${missingFields[0]} is required to create your profile`
          : `The following fields are required to create your profile: ${missingFields.join(', ')}`
        setSubmitError(errorMessage)
        
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }
    
    try {
      // Normalize text fields
      const normalizedData = {
        ...data,
        full_name: data.full_name ? normalizeName(data.full_name) : data.full_name,
        location: data.location ? normalizeLocation(data.location) : data.location,
        secondary_location: data.secondary_location ? normalizeLocation(data.secondary_location) : data.secondary_location,
      }

      // Convert simple format to database format
      const databaseSkills = convertSimpleSkillsToDatabase(skills)
      const databaseCertifications = convertSimpleCertificationsToDatabase(certifications)

      await onSubmit({
        profile: normalizedData,
        skills: databaseSkills.map(skill => ({
          skill_id: skill.skill_id,
          proficiency_level: skill.proficiency_level as 'beginner' | 'intermediate' | 'advanced' | 'expert'
        })),
        certifications: databaseCertifications.map(cert => ({
          certification_id: cert.certification_id,
          date_obtained: cert.date_obtained || undefined,
          certification_number: cert.certification_number || undefined,
          expiry_date: cert.expiry_date || undefined
        })),
        photos,
        resume,
        existingPhotos,
        deletedPhotoIds
      })
    } catch (error) {
      console.error('ProfileForm - Submit error:', error)
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Unable to create profile:</p>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Your full name"
                className="min-h-[44px] touch-manipulation"
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your.email@example.com"
                className="min-h-[44px] touch-manipulation"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(555) 123-4567"
                className="min-h-[44px] touch-manipulation"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_location_structured">Primary Location *</Label>
              <Select {...register('primary_location_structured')} className="min-h-[44px] touch-manipulation">
                <option value="">Select your primary location</option>
                <optgroup label="🎬 Major Markets">
                  {TIER1_MARKETS.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏘️ Secondary Markets">
                  {TIER2_MARKETS.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌎 International">
                  {INTERNATIONAL_MARKETS.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
              </Select>
              {errors.primary_location_structured && (
                <p className="text-sm text-red-600">{errors.primary_location_structured.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_location_structured">Secondary Location</Label>
              <Select {...register('secondary_location_structured')}>
                <option value="">No secondary location</option>
                <optgroup label="🎬 Major Markets">
                  {TIER1_MARKETS.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏘️ Secondary Markets">
                  {TIER2_MARKETS.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌎 International">
                  {INTERNATIONAL_MARKETS.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </optgroup>
              </Select>
              {errors.secondary_location_structured && (
                <p className="text-sm text-red-600">{errors.secondary_location_structured.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_radius">Willing to Travel</Label>
              <Select {...register('travel_radius')}>
                {TRAVEL_RADIUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.travel_radius && (
                <p className="text-sm text-red-600">{errors.travel_radius.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Identify as</Label>
              <Select {...register('gender')}>
                <option value="">Select gender</option>
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnic Appearance</Label>
              <Select {...register('ethnicity')}>
                <option value="">Select ethnic appearance</option>
                {ETHNIC_APPEARANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.ethnicity && (
                <p className="text-sm text-red-600">{errors.ethnicity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself, your experience, and what makes you unique as a stunt performer..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Physical Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Height</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    {...register('height_feet')}
                    placeholder="5"
                  />
                  <Label className="text-xs text-gray-500">Feet</Label>
                  {errors.height_feet && (
                    <p className="text-sm text-red-600">{errors.height_feet.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    {...register('height_inches')}
                    placeholder="10"
                  />
                  <Label className="text-xs text-gray-500">Inches</Label>
                  {errors.height_inches && (
                    <p className="text-sm text-red-600">{errors.height_inches.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_lbs">Weight (lbs)</Label>
              <Input
                id="weight_lbs"
                type="number"
                {...register('weight_lbs')}
                placeholder="150"
              />
              {errors.weight_lbs && (
                <p className="text-sm text-red-600">{errors.weight_lbs.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hair_color">Hair Color</Label>
              <Input
                id="hair_color"
                {...register('hair_color')}
                placeholder="Light Brown, Blonde, etc."
              />
              {errors.hair_color && (
                <p className="text-sm text-red-600">{errors.hair_color.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="union_status">Union Status</Label>
              <Input
                id="union_status"
                {...register('union_status')}
                placeholder="SAG-AFTRA, Non-union, etc."
              />
              {errors.union_status && (
                <p className="text-sm text-red-600">{errors.union_status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan_out_status">Loan Out?</Label>
              <Select {...register('loan_out_status')}>
                <option value="Unknown">Unknown</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
              {errors.loan_out_status && (
                <p className="text-sm text-red-600">{errors.loan_out_status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability_status">Availability Status</Label>
              <Select {...register('availability_status')}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </Select>
              {errors.availability_status && (
                <p className="text-sm text-red-600">{errors.availability_status.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Social Media & Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Links & Social Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register('website')}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reel_url">Demo Reel URL</Label>
              <Input
                id="reel_url"
                type="url"
                {...register('reel_url')}
                placeholder="https://vimeo.com/yourreel"
              />
              {errors.reel_url && (
                <p className="text-sm text-red-600">{errors.reel_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imdb_url">IMDB URL</Label>
              <Input
                id="imdb_url"
                type="url"
                {...register('imdb_url')}
                placeholder="https://imdb.com/name/..."
              />
              {errors.imdb_url && (
                <p className="text-sm text-red-600">{errors.imdb_url.message}</p>
              )}
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Wardrobe Information */}
      <Card>
        <CardHeader>
          <CardTitle>Wardrobe Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Universal Wardrobe Fields */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3">Universal Measurements</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shirt_neck">Shirt (Neck)</Label>
                <Input
                  id="shirt_neck"
                  type="number"
                  step="0.5"
                  {...register('shirt_neck')}
                  placeholder="16.5"
                />
                {errors.shirt_neck && (
                  <p className="text-sm text-red-600">{errors.shirt_neck.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shirt_sleeve">Shirt (Sleeve)</Label>
                <Input
                  id="shirt_sleeve"
                  type="number"
                  {...register('shirt_sleeve')}
                  placeholder="35"
                />
                {errors.shirt_sleeve && (
                  <p className="text-sm text-red-600">{errors.shirt_sleeve.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pants_waist">Pants (Waist)</Label>
                <Input
                  id="pants_waist"
                  type="number"
                  {...register('pants_waist')}
                  placeholder="32"
                />
                {errors.pants_waist && (
                  <p className="text-sm text-red-600">{errors.pants_waist.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pants_inseam">Pants (Inseam)</Label>
                <Input
                  id="pants_inseam"
                  type="number"
                  {...register('pants_inseam')}
                  placeholder="34"
                />
                {errors.pants_inseam && (
                  <p className="text-sm text-red-600">{errors.pants_inseam.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shoe_size">Shoe</Label>
                <Input
                  id="shoe_size"
                  type="number"
                  step="0.5"
                  {...register('shoe_size')}
                  placeholder="10.5"
                />
                {errors.shoe_size && (
                  <p className="text-sm text-red-600">{errors.shoe_size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="t_shirt_size">T-Shirt</Label>
                <Select {...register('t_shirt_size')}>
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </Select>
                {errors.t_shirt_size && (
                  <p className="text-sm text-red-600">{errors.t_shirt_size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hat_size">Hat</Label>
                <Input
                  id="hat_size"
                  {...register('hat_size')}
                  placeholder="7 1/4"
                />
                {errors.hat_size && (
                  <p className="text-sm text-red-600">{errors.hat_size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="glove_size">Glove</Label>
                <Select {...register('glove_size')}>
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </Select>
                {errors.glove_size && (
                  <p className="text-sm text-red-600">{errors.glove_size.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Gender-Specific Fields */}
          {watch('gender') === 'Man' && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">Male-Specific Measurements</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jacket_size">Jacket Size</Label>
                  <Input
                    id="jacket_size"
                    type="number"
                    {...register('jacket_size')}
                    placeholder="42"
                  />
                  {errors.jacket_size && (
                    <p className="text-sm text-red-600">{errors.jacket_size.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jacket_length">Jacket Length</Label>
                  <Select {...register('jacket_length')}>
                    <option value="">Select length</option>
                    <option value="S">S</option>
                    <option value="R">R</option>
                    <option value="L">L</option>
                  </Select>
                  {errors.jacket_length && (
                    <p className="text-sm text-red-600">{errors.jacket_length.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {watch('gender') === 'Woman' && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">Female-Specific Measurements</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dress_size">Dress Size</Label>
                  <Input
                    id="dress_size"
                    type="number"
                    {...register('dress_size')}
                    placeholder="8"
                  />
                  {errors.dress_size && (
                    <p className="text-sm text-red-600">{errors.dress_size.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pants_size">Pants Size</Label>
                  <Input
                    id="pants_size"
                    type="number"
                    {...register('pants_size')}
                    placeholder="6"
                  />
                  {errors.pants_size && (
                    <p className="text-sm text-red-600">{errors.pants_size.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="underbust">Underbust</Label>
                  <Input
                    id="underbust"
                    type="number"
                    {...register('underbust')}
                    placeholder="32"
                  />
                  {errors.underbust && (
                    <p className="text-sm text-red-600">{errors.underbust.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hips">Hips</Label>
                  <Input
                    id="hips"
                    type="number"
                    {...register('hips')}
                    placeholder="36"
                  />
                  {errors.hips && (
                    <p className="text-sm text-red-600">{errors.hips.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chest">Chest</Label>
                  <Input
                    id="chest"
                    type="number"
                    {...register('chest')}
                    placeholder="34"
                  />
                  {errors.chest && (
                    <p className="text-sm text-red-600">{errors.chest.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waist">Waist</Label>
                  <Input
                    id="waist"
                    type="number"
                    {...register('waist')}
                    placeholder="28"
                  />
                  {errors.waist && (
                    <p className="text-sm text-red-600">{errors.waist.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <SimpleSkills
        skills={skills}
        onSkillsChange={setSkills}
      />

      {/* Certifications */}
      <SimpleCertifications
        certifications={certifications}
        onCertificationsChange={setCertifications}
      />

      {/* Photos */}
      {isEdit ? (
        <EnhancedPhotoUpload
          photos={photos}
          existingPhotos={existingPhotos}
          onPhotosChange={setPhotos}
          onExistingPhotosChange={setExistingPhotos}
          onDeleteExistingPhoto={handleDeleteExistingPhoto}
        />
      ) : (
        <PhotoUpload
          photos={photos}
          onPhotosChange={setPhotos}
        />
      )}

      {/* Resume Upload */}
      <ResumeUpload
        currentResume={initialResume}
        onResumeChange={setResume}
        onRemoveExisting={() => {
          // This will be handled by setting resume_url to null in the form data
        }}
      />

      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              {...register('is_public')}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <Label htmlFor="is_public">
              Make my profile public and searchable by casting directors
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={loading} 
          size="lg"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
