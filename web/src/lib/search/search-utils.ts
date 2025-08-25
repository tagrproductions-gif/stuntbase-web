import { createClient } from '@/lib/supabase/server'

export interface SearchFilters {
  location?: string
  minHeight?: number
  maxHeight?: number
  minWeight?: number
  maxWeight?: number
  minExperience?: number
  maxExperience?: number
  skills?: string[]
  unionStatus?: string
  availabilityStatus?: string
  gender?: string
  ethnicity?: string
  minDayRate?: number
  maxDayRate?: number
  travelRadius?: number
}

export interface SearchQuery {
  query?: string
  filters?: SearchFilters
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'experience' | 'rate' | 'location' | 'updated' | 'random'
  sortOrder?: 'asc' | 'desc'
  projectDatabaseId?: string | null
}

export interface SearchResult {
  profiles: any[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Extract potential search terms from natural language
export function parseNaturalLanguageQuery(query: string): {
  skills: string[]
  attributes: SearchFilters
  processedQuery: string
} {
  const skills: string[] = []
  const attributes: SearchFilters = {}
  let processedQuery = query.toLowerCase()

  // Common skill keywords
  const skillPatterns = [
    { pattern: /martial arts?|fighting|combat|kung fu|karate|boxing|mma/gi, skill: 'martial arts' },
    { pattern: /motorcycle|motorbike|bike riding/gi, skill: 'motorcycle' },
    { pattern: /horse riding|horseback|equestrian/gi, skill: 'horse riding' },
    { pattern: /driving|car stunts?|vehicle/gi, skill: 'driving' },
    { pattern: /wire work|flying|aerial/gi, skill: 'wire work' },
    { pattern: /parkour|free running|freerunning/gi, skill: 'parkour' },
    { pattern: /gymnastics|acrobatics|tumbling/gi, skill: 'gymnastics' },
    { pattern: /swimming|water work|diving/gi, skill: 'swimming' },
    { pattern: /climbing|rock climbing/gi, skill: 'climbing' },
    { pattern: /sword fighting|weapon combat|blade work/gi, skill: 'sword fighting' },
    { pattern: /fire work|fire stunts?|pyrotechnics/gi, skill: 'fire work' },
    { pattern: /fall work|high falls?/gi, skill: 'fall work' },
  ]

  skillPatterns.forEach(({ pattern, skill }) => {
    if (pattern.test(query)) {
      skills.push(skill)
    }
  })

  // Location patterns
  const locationMatch = query.match(/(?:in|from|near|around)\s+([a-zA-Z\s,]+?)(?:\s|$|,)/i)
  if (locationMatch) {
    attributes.location = locationMatch[1].trim()
  }

  // Gender patterns
  if (/\b(female|woman|women)\b/i.test(query)) {
    attributes.gender = 'female'
  } else if (/\b(male|man|men)\b/i.test(query)) {
    attributes.gender = 'male'
  }

  // Experience patterns
  const experienceMatch = query.match(/(\d+)\s*(?:\+\s*)?years?\s*(?:of\s*)?experience/i)
  if (experienceMatch) {
    attributes.minExperience = parseInt(experienceMatch[1])
  }

  // Height patterns (feet/inches)
  const heightMatch = query.match(/(?:over|above|taller than)\s*(\d+)(?:'|ft|feet)?\s*(\d+)?(?:"|in|inches)?/i)
  if (heightMatch) {
    const feet = parseInt(heightMatch[1])
    const inches = heightMatch[2] ? parseInt(heightMatch[2]) : 0
    attributes.minHeight = feet * 12 + inches
  }

  // Union status
  if (/\b(sag|union|sag-aftra)\b/i.test(query)) {
    attributes.unionStatus = 'SAG-AFTRA'
  } else if (/\b(non-union|nonunion)\b/i.test(query)) {
    attributes.unionStatus = 'Non-union'
  }

  // Availability
  if (/\bavailable\b/i.test(query)) {
    attributes.availabilityStatus = 'available'
  }

  return { skills, attributes, processedQuery }
}

export async function searchProfiles(searchQuery: SearchQuery, supabaseClient?: any): Promise<SearchResult> {
  const supabase = supabaseClient || createClient()
  const {
    query = '',
    filters = {},
    page = 1,
    limit = 12,
    sortBy = 'relevance',
    sortOrder = 'desc',
    projectDatabaseId = null
  } = searchQuery

  try {
    // 🚀 MEMORY OPTIMIZED: Use lean query for carousel vs full query for search
    const isCarouselRequest = sortBy === 'random' && limit <= 8 && !query && Object.keys(filters).length === 0
    
    let queryBuilder = supabase
      .from('profiles')
      .select(isCarouselRequest ? `
        id, full_name, bio, gender, ethnicity, height_feet, height_inches,
        location, primary_location_structured, reel_url,
        profile_photos!inner (file_path, is_primary)
      ` : `
        id, full_name, bio, gender, ethnicity, height_feet, height_inches, weight_lbs,
        location, primary_location_structured, secondary_location_structured, 
        union_status, availability_status, travel_radius, reel_url, website, 
        resume_url, phone, email, created_at, updated_at, is_public,
        profile_skills (
          id,
          skill_id,
          proficiency_level,
          years_experience
        ),
        profile_photos (
          id,
          file_path,
          file_name,
          is_primary,
          sort_order
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      
    console.log(isCarouselRequest ? '🎠 CAROUSEL MODE: Using lean query' : '🔍 SEARCH MODE: Using full query')

    // If searching within a specific project database, filter by submissions
    if (projectDatabaseId) {
      console.log('🎯 Filtering by project database:', projectDatabaseId)
      
      // First, get all profile IDs that have submitted to this project
      const { data: submissions, error: submissionError } = await supabase
        .from('project_submissions')
        .select('profile_id')
        .eq('project_id', projectDatabaseId)
      
      if (submissionError) {
        console.error('❌ Error fetching submissions:', submissionError)
        throw new Error(`Failed to fetch project submissions: ${submissionError.message}`)
      }
      
      if (!submissions || submissions.length === 0) {
        console.log('📭 No submissions found for this project')
        // Return empty results if no submissions exist
        return {
          profiles: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }
      
      // Filter profiles to only those that have submitted
      const submittedProfileIds = submissions.map((s: any) => s.profile_id)
      console.log('🎯 Filtering profiles by IDs:', submittedProfileIds)
      queryBuilder = queryBuilder.in('id', submittedProfileIds)
      
      // TODO: Add server-side validation that user owns this project database
      // This should be done in the API route level, not here
    } else {
      console.log('🌍 Searching global profiles (no project filter)')
    }

    // Apply text search if query provided
    if (query) {
      queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,bio.ilike.%${query}%,location.ilike.%${query}%`)
    }

    // Apply all filters
    if (filters.gender) {
      queryBuilder = queryBuilder.eq('gender', filters.gender)
    }

    if (filters.ethnicity) {
      queryBuilder = queryBuilder.eq('ethnicity', filters.ethnicity)
    }

    if (filters.location) {
      // Check both legacy location and new structured location
      queryBuilder = queryBuilder.or(`location.ilike.%${filters.location}%,primary_location_structured.eq.${filters.location}`)
    }

    if (filters.unionStatus) {
      queryBuilder = queryBuilder.eq('union_status', filters.unionStatus)
    }

    if (filters.availabilityStatus) {
      queryBuilder = queryBuilder.eq('availability_status', filters.availabilityStatus)
    }

    if (filters.minWeight) {
      queryBuilder = queryBuilder.gte('weight_lbs', filters.minWeight)
    }

    if (filters.maxWeight) {
      queryBuilder = queryBuilder.lte('weight_lbs', filters.maxWeight)
    }

    // Height filtering - proper total inches calculation
    if (filters.minHeight) {
      const minFeet = Math.floor(filters.minHeight / 12)
      const minInches = filters.minHeight % 12
      
      // For minimum height: (feet > minFeet) OR (feet = minFeet AND inches >= minInches)
      if (minInches === 0) {
        // Exact feet boundary, simpler query
        queryBuilder = queryBuilder.gte('height_feet', minFeet)
      } else {
        // Need to check feet and inches combination
        queryBuilder = queryBuilder.or(`height_feet.gt.${minFeet},and(height_feet.eq.${minFeet},height_inches.gte.${minInches})`)
      }
    }

    if (filters.maxHeight) {
      const maxFeet = Math.floor(filters.maxHeight / 12)
      const maxInches = filters.maxHeight % 12
      
      // For maximum height: (feet < maxFeet) OR (feet = maxFeet AND inches <= maxInches)
      if (maxInches === 0) {
        // Exact feet boundary
        queryBuilder = queryBuilder.lte('height_feet', maxFeet)
      } else {
        // Need to check feet and inches combination
        queryBuilder = queryBuilder.or(`height_feet.lt.${maxFeet},and(height_feet.eq.${maxFeet},height_inches.lte.${maxInches})`)
      }
    }

    // Add debug logging
    const heightDebug = {
      minHeight: filters.minHeight ? {
        totalInches: filters.minHeight,
        feet: Math.floor(filters.minHeight / 12),
        inches: filters.minHeight % 12,
        display: `${Math.floor(filters.minHeight / 12)}'${filters.minHeight % 12}"`
      } : null,
      maxHeight: filters.maxHeight ? {
        totalInches: filters.maxHeight,
        feet: Math.floor(filters.maxHeight / 12),
        inches: filters.maxHeight % 12,
        display: `${Math.floor(filters.maxHeight / 12)}'${filters.maxHeight % 12}"`
      } : null
    }

    console.log('🔍 Search filters applied:', {
      gender: filters.gender,
      ethnicity: filters.ethnicity,
      location: filters.location,
      unionStatus: filters.unionStatus,
      availabilityStatus: filters.availabilityStatus,
      minWeight: filters.minWeight,
      maxWeight: filters.maxWeight,
      heightDebug
    })

    // Apply sorting
    if (sortBy === 'random') {
      // For random sorting, we'll select without ordering and shuffle in JavaScript
      // Since Supabase doesn't support raw SQL functions in order()
    } else {
      // Default sorting by updated date
      queryBuilder = queryBuilder.order('updated_at', { ascending: sortOrder === 'asc' })
    }

    // Pagination
    const offset = (page - 1) * limit
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    console.log('Search query built successfully')
    const { data, error, count } = await queryBuilder

    if (error) {
      console.error('Supabase query error:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    console.log(`Search returned ${data?.length || 0} profiles out of ${count || 0} total`)

    // 🚀 MEMORY OPTIMIZED: Process photos based on request type
    data?.forEach((profile: any) => {
      if (profile.profile_photos) {
        if (isCarouselRequest) {
          // 🎠 CAROUSEL: Only keep primary photo to reduce memory usage
          const originalCount = profile.profile_photos.length
          const primaryPhoto = profile.profile_photos.find((p: any) => p.is_primary)
          profile.profile_photos = primaryPhoto ? [primaryPhoto] : [profile.profile_photos[0]]
          console.log(`🎠 Carousel: Limited ${profile.full_name} to 1 photo (was ${originalCount})`)
        } else {
          // 🔍 SEARCH: Sort all photos for consistent display
          profile.profile_photos.sort((a: any, b: any) => {
            // Primary photos first
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            // Then by sort_order
            return (a.sort_order || 0) - (b.sort_order || 0);
          });
        }
      }
      
      // 🗑️ MEMORY CLEANUP: Remove large text fields for carousel requests to save memory
      if (isCarouselRequest) {
        delete profile.bio  // Can be large
        delete profile.resume_text  // Can be very large
        delete profile.profile_skills  // Not needed for carousel
        delete profile.profile_certifications  // Not needed for carousel
      }
    });

    // Apply random shuffle if requested
    let profiles = data || [];
    if (sortBy === 'random' && profiles.length > 0) {
      profiles = [...profiles].sort(() => Math.random() - 0.5);
    }

    return {
      profiles,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  } catch (error) {
    console.error('Search function error:', error)
    throw error
  }
}

export async function logSearch(query: string, filters: SearchFilters, resultsCount: number) {
  const supabase = createClient()
  
  try {
    await supabase
      .from('search_logs')
      .insert({
        query,
        filters: filters || null,
        results_count: resultsCount
      })
  } catch (error) {
    console.error('Error logging search:', error)
    // Don't throw - search logging is not critical
  }
}
