import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 🚀 MEMORY OPTIMIZED: Ultra-minimal carousel endpoint
 * Returns only essential data for homepage carousel to prevent memory leaks
 * No bio, skills, certifications, or other heavy data
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    console.log('🎠 CAROUSEL API: Fetching minimal profile data for homepage')
    
    // 🚀 MEMORY CRITICAL: Select only essential fields for carousel
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        height_feet, 
        height_inches,
        primary_location_structured,
        location,
        profile_photos!inner (file_path, is_primary)
      `)
      .eq('is_public', true)
      .limit(12) // Get more to randomize from, but still limited
    
    if (error) {
      console.error('Carousel fetch error:', error)
      return NextResponse.json({ profiles: [] })
    }
    
    // 🎠 MEMORY OPTIMIZATION: Process only primary photos and essential data
    const minimalProfiles = profiles?.map(profile => {
      // Find primary photo or first photo
      const primaryPhoto = profile.profile_photos?.find((p: any) => p.is_primary) || 
                          profile.profile_photos?.[0]
      
      return {
        id: profile.id,
        full_name: profile.full_name,
        location: profile.primary_location_structured || profile.location || 'Location not specified',
        height_feet: profile.height_feet,
        height_inches: profile.height_inches,
        // Only include ONE photo to minimize memory
        profile_photos: primaryPhoto ? [{ 
          file_path: primaryPhoto.file_path, 
          is_primary: true 
        }] : [],
        // Add minimal required fields that homepage expects
        bio: '', // Empty to save memory
        experience_years: 0, // Not displayed in carousel
        weight_lbs: 0 // Not displayed in carousel
      }
    }) || []
    
    // 🎲 RANDOMIZE: Shuffle on server side
    const shuffled = minimalProfiles.sort(() => Math.random() - 0.5)
    const finalProfiles = shuffled.slice(0, 6) // Only return 6 for carousel
    
    console.log(`🎠 CAROUSEL API: Returning ${finalProfiles.length} minimal profiles`)
    console.log(`🎠 Memory optimization: Only primary photos, no bio/skills/certifications`)
    
    return NextResponse.json({ 
      profiles: finalProfiles,
      message: 'Minimal carousel data loaded successfully'
    })
    
  } catch (error) {
    console.error('Carousel API error:', error)
    return NextResponse.json({ 
      profiles: [],
      error: 'Failed to load carousel data'
    })
  }
}
