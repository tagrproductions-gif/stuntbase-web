import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get distinct filter values from actual data
    const queries = await Promise.all([
      // Gender options
      supabase
        .from('profiles')
        .select('gender')
        .eq('is_public', true)
        .not('gender', 'is', null),

      // Ethnicity options
      supabase
        .from('profiles') 
        .select('ethnicity')
        .eq('is_public', true)
        .not('ethnicity', 'is', null),

      // Location options (check both structured and legacy)
      supabase
        .from('profiles')
        .select('primary_location_structured, location')
        .eq('is_public', true),

      // Height range (get min/max for slider)
      supabase
        .from('profiles')
        .select('height_feet, height_inches')
        .eq('is_public', true)
        .not('height_feet', 'is', null),

      // Weight range (get min/max for slider)
      supabase
        .from('profiles')
        .select('weight_lbs')
        .eq('is_public', true)
        .not('weight_lbs', 'is', null),

      // Union status options
      supabase
        .from('profiles')
        .select('union_status')
        .eq('is_public', true)
        .not('union_status', 'is', null),

      // Availability options
      supabase
        .from('profiles')
        .select('availability_status')
        .eq('is_public', true)
        .not('availability_status', 'is', null)
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

    // Process gender options
    const genderOptions = [...new Set(
      genderData.data?.map(p => p.gender).filter(Boolean) || []
    )].map(gender => ({
      label: gender,
      value: gender
    }))

    // Process ethnicity options  
    const ethnicityOptions = [...new Set(
      ethnicityData.data?.map(p => p.ethnicity).filter(Boolean) || []
    )].map(ethnicity => ({
      label: ethnicity,
      value: ethnicity
    }))

    // Process location options
    const locationValues = locationData.data?.map(p => 
      p.primary_location_structured || p.location
    ).filter(Boolean) || []
    
    const locationOptions = [...new Set(locationValues)].map(location => ({
      label: location,
      value: location
    }))

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
    const unionOptions = [...new Set(
      unionData.data?.map(p => p.union_status).filter(Boolean) || []
    )].map(status => ({
      label: status,
      value: status
    }))

    // Process availability options
    const availabilityOptions = [...new Set(
      availabilityData.data?.map(p => p.availability_status).filter(Boolean) || []
    )].map(status => ({
      label: status === 'available' ? 'Available' : 
             status === 'busy' ? 'Busy' : 
             status === 'unavailable' ? 'Unavailable' : status,
      value: status
    }))

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

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}
