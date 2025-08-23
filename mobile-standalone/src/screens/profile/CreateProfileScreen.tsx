import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import FormInput from '../../components/ui/FormInput'
import FormPicker from '../../components/ui/FormPicker'
import SkillsSelector, { SimpleSkill } from '../../components/profile/SkillsSelector'
import CertificationsSelector, { SimpleCertification } from '../../components/profile/CertificationsSelector'
import PhotoUpload, { PhotoData } from '../../components/profile/PhotoUpload'
import ResumeUpload, { ResumeData } from '../../components/profile/ResumeUpload'
import { TIER1_MARKETS, TIER2_MARKETS, INTERNATIONAL_MARKETS, TRAVEL_RADIUS_OPTIONS } from '../../constants/locations'
import { ETHNIC_APPEARANCE_OPTIONS } from '../../constants/ethnic-appearance'

interface CreateProfileScreenProps {
  navigation: any
}

interface ProfileFormData {
  // Personal Information
  full_name: string
  email: string
  phone: string
  bio: string
  
  // Location
  primary_location_structured: string
  secondary_location_structured: string
  travel_radius: string
  
  // Physical Attributes
  height_feet: string
  height_inches: string
  weight_lbs: string
  hair_color: string
  gender: string
  ethnicity: string
  
  // Professional Information
  union_status: string
  loan_out_status: string
  availability_status: string
  
  // Wardrobe - Universal
  shirt_neck: string
  shirt_sleeve: string
  pants_waist: string
  pants_inseam: string
  shoe_size: string
  t_shirt_size: string
  hat_size: string
  glove_size: string
  
  // Wardrobe - Male specific
  jacket_size: string
  jacket_length: string
  
  // Wardrobe - Female specific
  dress_size: string
  pants_size: string
  underbust: string
  hips: string
  chest: string
  waist: string
  
  // Links
  website: string
  reel_url: string
  imdb_url: string
  
  // Settings
  is_public: boolean
}

export default function CreateProfileScreen({ navigation }: CreateProfileScreenProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  
  // Form data state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: user?.email || '',
    phone: '',
    bio: '',
    primary_location_structured: '',
    secondary_location_structured: '',
    travel_radius: 'local',
    height_feet: '',
    height_inches: '',
    weight_lbs: '',
    hair_color: '',
    gender: '',
    ethnicity: '',
    union_status: '',
    loan_out_status: 'Unknown',
    availability_status: 'available',
    shirt_neck: '',
    shirt_sleeve: '',
    pants_waist: '',
    pants_inseam: '',
    shoe_size: '',
    t_shirt_size: '',
    hat_size: '',
    glove_size: '',
    jacket_size: '',
    jacket_length: '',
    dress_size: '',
    pants_size: '',
    underbust: '',
    hips: '',
    chest: '',
    waist: '',
    website: '',
    reel_url: '',
    imdb_url: '',
    is_public: true,
  })
  
  const [skills, setSkills] = useState<SimpleSkill[]>([])
  const [certifications, setCertifications] = useState<SimpleCertification[]>([])
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.primary_location_structured) {
      newErrors.primary_location_structured = 'Primary location is required'
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Height validation
    if (formData.height_feet && (parseInt(formData.height_feet) < 3 || parseInt(formData.height_feet) > 8)) {
      newErrors.height_feet = 'Height must be between 3-8 feet'
    }
    
    if (formData.height_inches && (parseInt(formData.height_inches) < 0 || parseInt(formData.height_inches) > 11)) {
      newErrors.height_inches = 'Inches must be between 0-11'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form before submitting.')
      return
    }

    setLoading(true)
    
    try {
      // Here you would typically submit to your backend
      // For now, we'll just show a success message
      Alert.alert(
        'Profile Created!',
        'Your profile has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs')
          }
        ]
      )
    } catch (error) {
      console.error('Profile creation error:', error)
      Alert.alert('Error', 'Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    'Personal Info',
    'Physical Attributes', 
    'Professional Info',
    'Wardrobe',
    'Skills & Certifications',
    'Photos & Resume',
    'Links & Settings'
  ]

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Personal Info
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Personal Information</Text>
            
            <FormInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text) => updateFormData('full_name', text)}
              placeholder="Your full name"
              error={errors.full_name}
              required
            />
            
            <FormInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            
            <FormInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
              error={errors.phone}
            />
            
            <FormPicker
              label="Primary Location"
              value={formData.primary_location_structured}
              onValueChange={(value) => updateFormData('primary_location_structured', value)}
              options={[
                ...TIER1_MARKETS.map(loc => ({ label: `🎬 ${loc.label}`, value: loc.value })),
                ...TIER2_MARKETS.map(loc => ({ label: `🏘️ ${loc.label}`, value: loc.value })),
                ...INTERNATIONAL_MARKETS.map(loc => ({ label: `🌎 ${loc.label}`, value: loc.value }))
              ]}
              placeholder="Select your primary location"
              error={errors.primary_location_structured}
              required
            />
            
            <FormPicker
              label="Secondary Location"
              value={formData.secondary_location_structured}
              onValueChange={(value) => updateFormData('secondary_location_structured', value)}
              options={[
                ...TIER1_MARKETS.map(loc => ({ label: `🎬 ${loc.label}`, value: loc.value })),
                ...TIER2_MARKETS.map(loc => ({ label: `🏘️ ${loc.label}`, value: loc.value })),
                ...INTERNATIONAL_MARKETS.map(loc => ({ label: `🌎 ${loc.label}`, value: loc.value }))
              ]}
              placeholder="No secondary location"
            />
            
            <FormPicker
              label="Willing to Travel"
              value={formData.travel_radius}
              onValueChange={(value) => updateFormData('travel_radius', value)}
              options={TRAVEL_RADIUS_OPTIONS}
            />
            
            <FormInput
              label="Bio"
              value={formData.bio}
              onChangeText={(text) => updateFormData('bio', text)}
              placeholder="Tell us about yourself, your experience, and what makes you unique..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </View>
        )
        
      case 1: // Physical Attributes
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📏 Physical Attributes</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Height (Feet)"
                  value={formData.height_feet}
                  onChangeText={(text) => updateFormData('height_feet', text)}
                  placeholder="5"
                  keyboardType="numeric"
                  error={errors.height_feet}
                />
              </View>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Height (Inches)"
                  value={formData.height_inches}
                  onChangeText={(text) => updateFormData('height_inches', text)}
                  placeholder="10"
                  keyboardType="numeric"
                  error={errors.height_inches}
                />
              </View>
            </View>
            
            <FormInput
              label="Weight (lbs)"
              value={formData.weight_lbs}
              onChangeText={(text) => updateFormData('weight_lbs', text)}
              placeholder="150"
              keyboardType="numeric"
            />
            
            <FormInput
              label="Hair Color"
              value={formData.hair_color}
              onChangeText={(text) => updateFormData('hair_color', text)}
              placeholder="Light Brown, Blonde, etc."
            />
            
            <FormPicker
              label="Gender"
              value={formData.gender}
              onValueChange={(value) => updateFormData('gender', value)}
              options={[
                { label: 'Man', value: 'Man' },
                { label: 'Woman', value: 'Woman' },
                { label: 'Non-binary', value: 'Non-binary' },
                { label: 'Other', value: 'Other' }
              ]}
              placeholder="Select gender"
            />
            
            <FormPicker
              label="Ethnic Appearance"
              value={formData.ethnicity}
              onValueChange={(value) => updateFormData('ethnicity', value)}
              options={ETHNIC_APPEARANCE_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))}
              placeholder="Select ethnic appearance"
            />
          </View>
        )
        
      case 2: // Professional Info
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Professional Information</Text>
            
            <FormInput
              label="Union Status"
              value={formData.union_status}
              onChangeText={(text) => updateFormData('union_status', text)}
              placeholder="SAG-AFTRA, Non-union, etc."
            />
            
            <FormPicker
              label="Loan Out Status"
              value={formData.loan_out_status}
              onValueChange={(value) => updateFormData('loan_out_status', value)}
              options={[
                { label: 'Unknown', value: 'Unknown' },
                { label: 'Yes', value: 'Yes' },
                { label: 'No', value: 'No' }
              ]}
            />
            
            <FormPicker
              label="Availability Status"
              value={formData.availability_status}
              onValueChange={(value) => updateFormData('availability_status', value)}
              options={[
                { label: 'Available', value: 'available' },
                { label: 'Busy', value: 'busy' },
                { label: 'Unavailable', value: 'unavailable' }
              ]}
            />
          </View>
        )
        
      case 3: // Wardrobe
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👔 Wardrobe Information</Text>
            <Text style={styles.sectionSubtitle}>Universal Measurements</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Shirt (Neck)"
                  value={formData.shirt_neck}
                  onChangeText={(text) => updateFormData('shirt_neck', text)}
                  placeholder="16.5"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Shirt (Sleeve)"
                  value={formData.shirt_sleeve}
                  onChangeText={(text) => updateFormData('shirt_sleeve', text)}
                  placeholder="35"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Pants (Waist)"
                  value={formData.pants_waist}
                  onChangeText={(text) => updateFormData('pants_waist', text)}
                  placeholder="32"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Pants (Inseam)"
                  value={formData.pants_inseam}
                  onChangeText={(text) => updateFormData('pants_inseam', text)}
                  placeholder="34"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Shoe Size"
                  value={formData.shoe_size}
                  onChangeText={(text) => updateFormData('shoe_size', text)}
                  placeholder="10.5"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <FormPicker
                  label="T-Shirt Size"
                  value={formData.t_shirt_size}
                  onValueChange={(value) => updateFormData('t_shirt_size', value)}
                  options={[
                    { label: 'XS', value: 'XS' },
                    { label: 'S', value: 'S' },
                    { label: 'M', value: 'M' },
                    { label: 'L', value: 'L' },
                    { label: 'XL', value: 'XL' },
                    { label: 'XXL', value: 'XXL' }
                  ]}
                  placeholder="Select size"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Hat Size"
                  value={formData.hat_size}
                  onChangeText={(text) => updateFormData('hat_size', text)}
                  placeholder="7 1/4"
                />
              </View>
              <View style={styles.halfWidth}>
                <FormPicker
                  label="Glove Size"
                  value={formData.glove_size}
                  onValueChange={(value) => updateFormData('glove_size', value)}
                  options={[
                    { label: 'XS', value: 'XS' },
                    { label: 'S', value: 'S' },
                    { label: 'M', value: 'M' },
                    { label: 'L', value: 'L' },
                    { label: 'XL', value: 'XL' }
                  ]}
                  placeholder="Select size"
                />
              </View>
            </View>
            
            {/* Gender-specific measurements */}
            {formData.gender === 'Man' && (
              <>
                <Text style={styles.sectionSubtitle}>Male-Specific Measurements</Text>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Jacket Size"
                      value={formData.jacket_size}
                      onChangeText={(text) => updateFormData('jacket_size', text)}
                      placeholder="42"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <FormPicker
                      label="Jacket Length"
                      value={formData.jacket_length}
                      onValueChange={(value) => updateFormData('jacket_length', value)}
                      options={[
                        { label: 'S', value: 'S' },
                        { label: 'R', value: 'R' },
                        { label: 'L', value: 'L' }
                      ]}
                      placeholder="Select length"
                    />
                  </View>
                </View>
              </>
            )}
            
            {formData.gender === 'Woman' && (
              <>
                <Text style={styles.sectionSubtitle}>Female-Specific Measurements</Text>
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Dress Size"
                      value={formData.dress_size}
                      onChangeText={(text) => updateFormData('dress_size', text)}
                      placeholder="8"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Pants Size"
                      value={formData.pants_size}
                      onChangeText={(text) => updateFormData('pants_size', text)}
                      placeholder="6"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Underbust"
                      value={formData.underbust}
                      onChangeText={(text) => updateFormData('underbust', text)}
                      placeholder="32"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Hips"
                      value={formData.hips}
                      onChangeText={(text) => updateFormData('hips', text)}
                      placeholder="36"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Chest"
                      value={formData.chest}
                      onChangeText={(text) => updateFormData('chest', text)}
                      placeholder="34"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <FormInput
                      label="Waist"
                      value={formData.waist}
                      onChangeText={(text) => updateFormData('waist', text)}
                      placeholder="28"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        )
        
      case 4: // Skills & Certifications
        return (
          <View style={styles.section}>
            <SkillsSelector
              skills={skills}
              onSkillsChange={setSkills}
            />
            
            <CertificationsSelector
              certifications={certifications}
              onCertificationsChange={setCertifications}
            />
          </View>
        )
        
      case 5: // Photos & Resume
        return (
          <View style={styles.section}>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
            />
            
            <ResumeUpload
              resume={resume}
              onResumeChange={setResume}
            />
          </View>
        )
        
      case 6: // Links & Settings
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Links & Social Media</Text>
            
            <FormInput
              label="Website"
              value={formData.website}
              onChangeText={(text) => updateFormData('website', text)}
              placeholder="https://yourwebsite.com"
              keyboardType="url"
              autoCapitalize="none"
            />
            
            <FormInput
              label="Demo Reel URL"
              value={formData.reel_url}
              onChangeText={(text) => updateFormData('reel_url', text)}
              placeholder="https://vimeo.com/yourreel"
              keyboardType="url"
              autoCapitalize="none"
            />
            
            <FormInput
              label="IMDB URL"
              value={formData.imdb_url}
              onChangeText={(text) => updateFormData('imdb_url', text)}
              placeholder="https://imdb.com/name/..."
              keyboardType="url"
              autoCapitalize="none"
            />
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => updateFormData('is_public', !formData.is_public)}
              >
                <Text style={styles.checkboxIcon}>
                  {formData.is_public ? '✅' : '⬜'}
                </Text>
                <Text style={styles.checkboxLabel}>
                  Make my profile public and searchable by casting directors
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
        
      default:
        return null
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#c15f3c" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>Build your professional stunt performer profile</Text>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentSection + 1) / sections.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentSection + 1} of {sections.length}: {sections[currentSection]}
          </Text>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderSection()}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentSection === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          <Text style={[styles.navButtonText, currentSection === 0 && styles.navButtonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        
        {currentSection < sections.length - 1 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Profile</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#c15f3c',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    marginTop: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  checkboxIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#c15f3c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
