import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 🎠 ULTRA-LIGHTWEIGHT CAROUSEL: Only photo + clickable link to profile
 * MEMORY LEAK PREVENTION: Absolute minimal data - just ID, name, and ONE photo
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    console.log('🎠 CAROUSEL: Fetching ONLY photos for clickable profile links')
    
    // 🎯 SUPER MINIMAL: Only get profiles that have photos (for carousel display)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name,
        profile_photos!inner (file_path, is_primary)
      `)
      .eq('is_public', true)
      .limit(8) // Even smaller limit to prevent memory issues
    
    if (error) {
      console.error('🎠 CAROUSEL ERROR:', error)
      return NextResponse.json({ 
        profiles: [],
        error: 'No profiles with photos available'
      })
    }
    
    // 🚀 ABSOLUTE MINIMAL: Only ID, name, and ONE photo per profile
    const ultraMinimalProfiles = profiles?.map(profile => {
      // Get ONLY the primary photo (or first photo)
      const photo = profile.profile_photos?.find((p: any) => p.is_primary) || 
                   profile.profile_photos?.[0]
      
      return {
        id: profile.id, // For the clickable link
        full_name: profile.full_name, // For display overlay
        photo_url: photo?.file_path || null // Only ONE photo URL
      }
    }).filter(p => p.photo_url) || [] // Only include profiles with photos
    
    // 🎲 Randomize and limit to prevent memory bloat
    const shuffled = ultraMinimalProfiles.sort(() => Math.random() - 0.5)
    const finalProfiles = shuffled.slice(0, 6) // Maximum 6 photos
    
    console.log(`🎠 CAROUSEL: Returning ${finalProfiles.length} photo-only profiles`)
    
    return NextResponse.json({ 
      profiles: finalProfiles,
      message: 'Photo carousel loaded successfully'
    })
    
  } catch (error) {
    console.error('🎠 CAROUSEL EXCEPTION:', error)
    return NextResponse.json({ 
      profiles: [],
      error: 'Carousel unavailable'
    })
  }
}
