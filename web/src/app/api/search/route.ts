import { NextRequest, NextResponse } from 'next/server'
import { searchProfiles, logSearch, SearchQuery } from '@/lib/search/search-utils'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const searchQuery: SearchQuery = body
    
    console.log('🔍 Search API received:', {
      projectDatabaseId: searchQuery.projectDatabaseId,
      hasFilters: !!searchQuery.filters,
      page: searchQuery.page
    })

    // Create supabase client for authentication
    const supabase = createClient()
    let authenticatedSupabase = null

    // If searching within a project database, validate user ownership
    if (searchQuery.projectDatabaseId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check if user owns this project database
      const { data: project, error: projectError } = await supabase
        .from('project_databases')
        .select('creator_user_id')
        .eq('id', searchQuery.projectDatabaseId)
        .eq('creator_user_id', user.id)
        .single()

      if (projectError || !project) {
        return NextResponse.json({ error: 'Access denied: You do not own this project database' }, { status: 403 })
      }
      
      // Use authenticated client for project database searches
      authenticatedSupabase = supabase
    }

    // Perform the search with authenticated client if needed
    const results = await searchProfiles(searchQuery, authenticatedSupabase)

    // Log the search (non-blocking)
    if (searchQuery.query || Object.keys(searchQuery.filters || {}).length > 0) {
      logSearch(
        searchQuery.query || '',
        searchQuery.filters || {},
        results.total
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const searchQuery: SearchQuery = {
      query: searchParams.get('q') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      filters: {}
    }

    // Parse filters from query params
    const location = searchParams.get('location')
    const minHeight = searchParams.get('minHeight')
    const maxHeight = searchParams.get('maxHeight')
    const minWeight = searchParams.get('minWeight')
    const maxWeight = searchParams.get('maxWeight')
    const minExperience = searchParams.get('minExperience')
    const maxExperience = searchParams.get('maxExperience')
    const skills = searchParams.get('skills')
    const unionStatus = searchParams.get('unionStatus')
    const availabilityStatus = searchParams.get('availabilityStatus')
    const gender = searchParams.get('gender')
    const ethnicity = searchParams.get('ethnicity')
    const minDayRate = searchParams.get('minDayRate')
    const maxDayRate = searchParams.get('maxDayRate')
    const travelRadius = searchParams.get('travelRadius')

    if (location) searchQuery.filters!.location = location
    if (minHeight) searchQuery.filters!.minHeight = parseInt(minHeight)
    if (maxHeight) searchQuery.filters!.maxHeight = parseInt(maxHeight)
    if (minWeight) searchQuery.filters!.minWeight = parseInt(minWeight)
    if (maxWeight) searchQuery.filters!.maxWeight = parseInt(maxWeight)
    if (minExperience) searchQuery.filters!.minExperience = parseInt(minExperience)
    if (maxExperience) searchQuery.filters!.maxExperience = parseInt(maxExperience)
    if (skills) searchQuery.filters!.skills = skills.split(',')
    if (unionStatus) searchQuery.filters!.unionStatus = unionStatus
    if (availabilityStatus) searchQuery.filters!.availabilityStatus = availabilityStatus
    if (gender) searchQuery.filters!.gender = gender
    if (ethnicity) searchQuery.filters!.ethnicity = ethnicity
    if (minDayRate) searchQuery.filters!.minDayRate = parseInt(minDayRate)
    if (maxDayRate) searchQuery.filters!.maxDayRate = parseInt(maxDayRate)
    if (travelRadius) searchQuery.filters!.travelRadius = parseInt(travelRadius)

    const results = await searchProfiles(searchQuery)

    // Log the search
    if (searchQuery.query || Object.keys(searchQuery.filters || {}).length > 0) {
      logSearch(
        searchQuery.query || '',
        searchQuery.filters || {},
        results.total
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
