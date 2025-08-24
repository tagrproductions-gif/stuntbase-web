import { createClient } from '@/lib/supabase/server'
import { ParsedQuery } from './query-parser'

export interface QueryResult {
  profiles: any[]
  method: 'structured' | 'fallback' | 'vector'
  totalMatched: number
  filtersApplied: string[]
}

export async function queryWithStructuredFilters(parsedQuery: ParsedQuery, projectDatabaseId?: string | null): Promise<QueryResult> {
  const supabase = createClient()
  const filtersApplied: string[] = []

  console.log('🗄️ Starting structured query with filters:', parsedQuery)

  // Start with base query
  let query = supabase
    .from('profiles')
    .select(`
      *, 
      profile_photos (file_path, file_name, is_primary, sort_order),
      profile_skills (skill_id, proficiency_level, years_experience),
      profile_certifications (certification_id, date_obtained, expiration_date, certification_number)${projectDatabaseId ? ',project_submissions!inner(*)' : ''}
    `)
    .eq('is_public', true)

  // If searching within a specific project database, filter by submissions
  if (projectDatabaseId) {
    query = query.eq('project_submissions.project_id', projectDatabaseId)
    filtersApplied.push('project_database')
  }

  // Apply gender filter
  if (parsedQuery.gender) {
    query = query.eq('gender', parsedQuery.gender)
    filtersApplied.push(`gender: ${parsedQuery.gender}`)
  }

  // Apply location filter (prioritize structured locations, with fallback for broad searches)
  if (parsedQuery.location) {
    if (parsedQuery.broad_search) {
      // For broad searches, also search unstructured location fields for better coverage
      query = query.or(`primary_location_structured.eq.${parsedQuery.location},secondary_location_structured.eq.${parsedQuery.location},location.ilike.%${parsedQuery.location.split('-')[0]}%`)
      filtersApplied.push(`location: ${parsedQuery.location} (broad search)`)
    } else {
      query = query.or(`primary_location_structured.eq.${parsedQuery.location},secondary_location_structured.eq.${parsedQuery.location}`)
      filtersApplied.push(`location: ${parsedQuery.location}`)
    }
  }

  // Apply ethnicity filter (supports multiple ethnicities)
  if (parsedQuery.ethnicities && parsedQuery.ethnicities.length > 0) {
    query = query.in('ethnicity', parsedQuery.ethnicities)
    filtersApplied.push(`ethnicities: ${parsedQuery.ethnicities.join(', ')}`)
  }

  // Apply height filter with flexible matching (±3 inches for better matches)
  if (parsedQuery.height_min && parsedQuery.height_max) {
    // Add flexibility for better "close matches" - expand range by 3 inches on each side
    const flexibleMin = Math.max(48, parsedQuery.height_min - 3) // Don't go below 4'0"
    const flexibleMax = Math.min(96, parsedQuery.height_max + 3) // Don't go above 8'0"
    
    // Convert to total inches for easier comparison
    const minTotalInches = flexibleMin
    const maxTotalInches = flexibleMax
    
    // Create a custom height filter that handles feet+inches combinations
    // This is more complex but allows for flexible height matching
    query = query.gte('height_feet', Math.floor(minTotalInches / 12))
              .lte('height_feet', Math.ceil(maxTotalInches / 12))
    
    const originalMinFeet = Math.floor(parsedQuery.height_min / 12)
    const originalMaxFeet = Math.floor(parsedQuery.height_max / 12)
    const originalMinInches = parsedQuery.height_min % 12
    const originalMaxInches = parsedQuery.height_max % 12
    
    filtersApplied.push(`height: ${originalMinFeet}'${originalMinInches}" - ${originalMaxFeet}'${originalMaxInches}" (±3" flex)`)
  }

  // Apply weight filter with flexible matching (±10 lbs for better matches)
  if (parsedQuery.weight_min && parsedQuery.weight_max) {
    const flexibleWeightMin = Math.max(80, parsedQuery.weight_min - 10) // Don't go below 80 lbs
    const flexibleWeightMax = Math.min(400, parsedQuery.weight_max + 10) // Don't go above 400 lbs
    
    query = query.gte('weight_lbs', flexibleWeightMin).lte('weight_lbs', flexibleWeightMax)
    filtersApplied.push(`weight: ${parsedQuery.weight_min}-${parsedQuery.weight_max} lbs (±10 flex)`)
  }

  // Apply availability filter
  if (parsedQuery.availability) {
    query = query.eq('availability_status', parsedQuery.availability)
    filtersApplied.push(`availability: ${parsedQuery.availability}`)
  }

  // Apply union status filter
  if (parsedQuery.union_status) {
    if (parsedQuery.union_status === 'SAG-AFTRA') {
      query = query.ilike('union_status', '%SAG%')
    } else if (parsedQuery.union_status === 'Non-union') {
      query = query.or('union_status.ilike.%non-union%,union_status.is.null')
    }
    filtersApplied.push(`union: ${parsedQuery.union_status}`)
  }

  // Apply travel radius filter
  if (parsedQuery.travel_radius && parsedQuery.travel_radius !== 'local') {
    // People with larger travel radius should match smaller requests
    const radiusOrder = ['local', '50', '100', '200', 'state', 'regional', 'national', 'international']
    const requestedIndex = radiusOrder.indexOf(parsedQuery.travel_radius)
    const acceptableRadii = radiusOrder.slice(requestedIndex)
    
    query = query.in('travel_radius', acceptableRadii)
    filtersApplied.push(`travel: ${parsedQuery.travel_radius}+`)
  }

  // Limit results to prevent overwhelming the second agent (higher limit for broad searches)
  const resultLimit = parsedQuery.broad_search ? 100 : 50
  query = query.limit(resultLimit)

  try {
    const { data: profiles, error } = await query

    if (error) {
      console.error('Structured query error:', error)
      throw error
    }

    console.log(`🗄️ Structured query returned ${profiles?.length || 0} profiles`)
    console.log('🗄️ Filters applied:', filtersApplied)

    // Post-filter by skills with flexible matching (related skills count too)
    let filteredProfiles = profiles || []
    
    if (parsedQuery.skills.length > 0) {
      // Create skill mapping for related/similar skills
      const relatedSkills: Record<string, string[]> = {
        'fight': ['martial arts', 'combat', 'boxing', 'karate', 'mma', 'wrestling', 'jiu-jitsu', 'kickboxing', 'taekwondo', 'muay thai', 'self-defense', 'action', 'sword', 'knife'],
        'gun': ['firearms', 'weapon', 'tactical', 'military', 'police', 'swat', 'combat training', 'weapons handling', 'shooting'],
        'drive': ['motorcycle', 'car', 'vehicle', 'racing', 'drift', 'precision driving', 'chase scenes', 'automotive'],
        'swim': ['water', 'diving', 'scuba', 'underwater', 'pool', 'ocean', 'lifeguard', 'synchronized swimming', 'aquatic'],
        'climb': ['rope', 'wall', 'mountain', 'rock climbing', 'rappelling', 'parkour', 'free running', 'scaling'],
        'horse': ['riding', 'equestrian', 'horseback', 'mounted', 'cavalry', 'western'],
        'acrobat': ['gymnastics', 'tumbling', 'flips', 'aerial', 'circus', 'contortion', 'flexibility'],
        'dance': ['choreography', 'ballet', 'hip hop', 'contemporary', 'ballroom', 'pole dancing', 'movement']
      }
      
      filteredProfiles = filteredProfiles.filter((profile: any) => {
        const profileSkills = profile.profile_skills?.map((ps: any) => ps.skill_id.toLowerCase()) || []
        
        // Check if profile has any of the requested skills OR related skills
        const hasSkill = parsedQuery.skills.some(requestedSkill => {
          // Direct match
          const directMatch = profileSkills.some((profileSkill: any) => 
            profileSkill.includes(requestedSkill.toLowerCase()) || 
            requestedSkill.toLowerCase().includes(profileSkill)
          )
          
          // Related skill match
          const relatedMatch = relatedSkills[requestedSkill]?.some(relatedSkill =>
            profileSkills.some((profileSkill: any) => 
              profileSkill.includes(relatedSkill.toLowerCase()) ||
              relatedSkill.toLowerCase().includes(profileSkill)
            )
          )
          
          return directMatch || relatedMatch
        })
        
        return hasSkill
      })
      
      filtersApplied.push(`skills: ${parsedQuery.skills.join(', ')} (with related skills)`)
      console.log(`🗄️ After flexible skills filter: ${filteredProfiles.length} profiles`)
    }

    // Sort profiles by completeness with randomization for equal scores
    filteredProfiles.sort((a, b) => {
      const scoreA = calculateProfileCompleteness(a)
      const scoreB = calculateProfileCompleteness(b)
      
      // If scores are equal, randomize the order for fair exposure
      if (scoreA === scoreB) {
        return Math.random() - 0.5
      }
      
      // Otherwise, sort by completeness (higher scores first)
      return scoreB - scoreA
    })

    return {
      profiles: filteredProfiles,
      method: 'structured',
      totalMatched: filteredProfiles.length,
      filtersApplied
    }

  } catch (error) {
    console.error('Structured query failed:', error)
    
    // Fallback to simple query
    const { data: fallbackProfiles, error: fallbackError } = await supabase
      .from('profiles')
      .select(`
        *, 
        profile_photos (file_path, file_name, is_primary, sort_order),
        profile_skills (skill_id, proficiency_level, years_experience),
        profile_certifications (certification_id, date_obtained, expiration_date, certification_number)
      `)
      .eq('is_public', true)
      .limit(20)

    if (fallbackError) {
      throw fallbackError
    }

    return {
      profiles: fallbackProfiles || [],
      method: 'fallback',
      totalMatched: fallbackProfiles?.length || 0,
      filtersApplied: ['fallback - no filters applied']
    }
  }
}

// Helper function to calculate profile completeness score
function calculateProfileCompleteness(profile: any): number {
  let score = 0
  
  // Basic info
  if (profile.full_name) score += 1
  if (profile.bio) score += 2
  if (profile.email) score += 1
  if (profile.phone) score += 1
  
  // Physical attributes
  if (profile.height_feet && profile.height_inches) score += 1
  if (profile.weight_lbs) score += 1
  if (profile.hair_color) score += 1
  if (profile.ethnicity) score += 1
  
  // Professional info
  if (profile.union_status) score += 1
  if (profile.availability_status) score += 1
  
  // Location
  if (profile.primary_location_structured || profile.location) score += 2
  
  // Skills and certifications
  if (profile.profile_skills?.length > 0) score += 3
  if (profile.profile_certifications?.length > 0) score += 2
  
  // Photos
  if (profile.profile_photos?.length > 0) score += 3
  
  // Links
  if (profile.reel_url) score += 2
  if (profile.website) score += 1
  if (profile.resume_url) score += 2
  
  return score
}
