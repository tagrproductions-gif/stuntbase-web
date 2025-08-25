import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 🚀 MEMORY FIX: Add module-level cache to prevent Set recreations
interface FilterCache {
  data: any
  timestamp: number
}

let filterCache: FilterCache | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes TTL
const CACHE_EXTEND_TTL = 30 * 60 * 1000 // 30 minutes extended TTL for stable data

export async function GET() {
  // 🚀 MEMORY OPTIMIZATION: Check cache first to avoid expensive Set operations
  const now = Date.now()
  if (filterCache && (now - filterCache.timestamp) < CACHE_TTL) {
    console.log('🎯 Filter API: Serving from cache (saves memory from Set recreations)')
    return NextResponse.json(filterCache.data)
  }
  try {
    const supabase = createClient()

    // Get distinct filter values from actual data
    // 🚀 MEMORY FIX: Added limits to prevent loading all profiles
    const queries = await Promise.all([
      // Gender options
      supabase
        .from('profiles')
        .select('gender')
        .eq('is_public', true)
        .not('gender', 'is', null)
        .limit(100), // 🚨 EMERGENCY: Reduced limit due to memory crisis

      // Ethnicity options
      supabase
        .from('profiles') 
        .select('ethnicity')
        .eq('is_public', true)
        .not('ethnicity', 'is', null)
        .limit(100), // 🚨 EMERGENCY: Reduced limit due to memory crisis

      // Location options (check both structured and legacy)
      supabase
        .from('profiles')
        .select('primary_location_structured, location')
        .eq('is_public', true)
        .limit(100), // 🚨 EMERGENCY: Reduced limit due to memory crisis

      // Height range (get min/max for slider)
      supabase
        .from('profiles')
        .select('height_feet, height_inches')
        .eq('is_public', true)
        .not('height_feet', 'is', null)
        .limit(100), // 🚨 EMERGENCY: Reduced limit due to memory crisis

      // Weight range (get min/max for slider)
      supabase
        .from('profiles')
        .select('weight_lbs')
        .eq('is_public', true)
        .not('weight_lbs', 'is', null)
        .limit(100), // 🚨 EMERGENCY: Reduced limit due to memory crisis

      // Union status options
      supabase
        .from('profiles')
        .select('union_status')
        .eq('is_public', true)
        .not('union_status', 'is', null)
        .limit(100), // 🚨 EMERGENCY: Reduced limit due to memory crisis

      // Availability options
      supabase
        .from('profiles')
        .select('availability_status')
        .eq('is_public', true)
        .not('availability_status', 'is', null)
        .limit(1000) // Limit to prevent memory overload
    ])

    const [
      genderData,
      ethnicityData, 
      locationData,
      heightData,
      weightData,
      unionData,
      availabilityData
    ] = queries

    // 🚀 MEMORY FIX: Use Array.from() and reduce operations to minimize Set memory usage
    
    // Process gender options
    const genderSet = new Set()
    genderData.data?.forEach(p => {
      if (p.gender) genderSet.add(p.gender)
    })
    const genderOptions = Array.from(genderSet).map(gender => ({
      label: gender,
      value: gender
    }))
    genderSet.clear() // Immediately clear to free memory

    // Process ethnicity options  
    const ethnicitySet = new Set()
    ethnicityData.data?.forEach(p => {
      if (p.ethnicity) ethnicitySet.add(p.ethnicity)
    })
    const ethnicityOptions = Array.from(ethnicitySet).map(ethnicity => ({
      label: ethnicity,
      value: ethnicity
    }))
    ethnicitySet.clear() // Immediately clear to free memory

    // Process location options
    const locationSet = new Set()
    locationData.data?.forEach(p => {
      const location = p.primary_location_structured || p.location
      if (location) locationSet.add(location)
    })
    const locationOptions = Array.from(locationSet).map(location => ({
      label: location,
      value: location
    }))
    locationSet.clear() // Immediately clear to free memory

    // Process height range for slider
    const heights = heightData.data?.map(p => 
      (p.height_feet || 0) * 12 + (p.height_inches || 0)
    ).filter(h => h > 0) || []
    
    const heightRange = {
      min: Math.min(...heights, 48), // Default min 4 feet
      max: Math.max(...heights, 84)  // Default max 7 feet
    }

    // Process weight range for slider
    const weights = weightData.data?.map(p => p.weight_lbs).filter(Boolean) || []
    const weightRange = {
      min: Math.min(...weights, 80),   // Default min 80 lbs
      max: Math.max(...weights, 350)  // Default max 350 lbs
    }

    // Process union status options
    const unionSet = new Set()
    unionData.data?.forEach(p => {
      if (p.union_status) unionSet.add(p.union_status)
    })
    const unionOptions = Array.from(unionSet).map(status => ({
      label: status,
      value: status
    }))
    unionSet.clear() // Immediately clear to free memory

    // Process availability options
    const availabilitySet = new Set()
    availabilityData.data?.forEach(p => {
      if (p.availability_status) availabilitySet.add(p.availability_status)
    })
    const availabilityOptions = Array.from(availabilitySet).map(status => ({
      label: status === 'available' ? 'Available' : 
             status === 'busy' ? 'Busy' : 
             status === 'unavailable' ? 'Unavailable' : status,
      value: status
    }))
    availabilitySet.clear() // Immediately clear to free memory

    const result = {
      genderOptions,
      ethnicityOptions,
      locationOptions,
      heightRange,
      weightRange,
      unionOptions,
      availabilityOptions,
      totalProfiles: genderData.data?.length || 0
    }

    console.log('🎯 Filter API Response:', {
      genderCount: genderOptions.length,
      ethnicityCount: ethnicityOptions.length,
      locationCount: locationOptions.length,
      heightRange,
      weightRange,
      unionCount: unionOptions.length,
      availabilityCount: availabilityOptions.length,
      totalProfiles: result.totalProfiles
    })

    // 🚀 MEMORY OPTIMIZATION: Cache the result to prevent future Set recreations
    filterCache = {
      data: result,
      timestamp: now
    }
    
    console.log('🎯 Filter API: Data processed and cached (prevents future Set recreations)')
    
    // 🗑️ MEMORY CLEANUP: Clear query result arrays after processing
    try {
      genderData.data = null
      ethnicityData.data = null
      locationData.data = null
      heightData.data = null
      weightData.data = null
      unionData.data = null
      availabilityData.data = null
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
        console.log('🗑️ Filter API: Forced garbage collection after processing')
      }
    } catch (cleanupError) {
      console.warn('⚠️ Filter data cleanup warning:', cleanupError)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}
