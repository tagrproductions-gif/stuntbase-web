import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchProfilesBySimilarity } from '@/lib/embeddings/embedding-service'
import { findLocationByAlias, ALL_LOCATIONS } from '@/lib/constants/locations'
import { parseUserQuery } from '@/lib/agents/query-parser'
import { queryWithStructuredFilters } from '@/lib/agents/structured-query'
import { generateCastingResponse } from '@/lib/agents/casting-assistant'

// Helper function to retry API calls with exponential backoff
async function retryApiCall<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // If it's an overload error (529) or rate limit (429), retry
      if ((error.status === 529 || error.status === 429) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s, 8s
        console.log(`API call failed (attempt ${attempt}), retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // For other errors or max retries reached, throw the error
      throw error
    }
  }
  
  throw lastError!
}

export async function POST(request: NextRequest) {
  // Check authentication first
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign up or log in to use the chat feature.' },
      { status: 401 }
    )
  }

  let conversationHistory: any[] = []
  let message = ''
  
  try {
    const requestData = await request.json()
    message = requestData.message
    conversationHistory = requestData.conversationHistory || []
    
    console.log('🚀 TWO-AGENT PIPELINE STARTED')
    console.log('📝 User Query:', message)
    
    // STAGE 1: Parse user query into structured filters
    console.log('🤖 AGENT 1: Parsing query...')
    const parsedQuery = await parseUserQuery(message)
    console.log('✅ AGENT 1 Result:', parsedQuery)
    
    // STAGE 2: Query database with structured filters
    console.log('🗄️ DATABASE: Querying with structured filters...')
    const queryResult = await queryWithStructuredFilters(parsedQuery)
    console.log('✅ DATABASE Result:', {
      method: queryResult.method,
      totalFound: queryResult.totalMatched,
      filtersApplied: queryResult.filtersApplied
    })
    
    // STAGE 3: Generate casting assistant response
    console.log('🎭 AGENT 2: Generating casting response...')
    const castingResponse = await generateCastingResponse(message, parsedQuery, queryResult)
    console.log('✅ AGENT 2 Result:', {
      responseLength: castingResponse.response.length,
      profileCount: castingResponse.profileIds.length
    })
    
    // Get ALL matching profiles for frontend, with AI-selected ones first in AI's preferred order
    const aiSelectedProfiles = castingResponse.profileIds.map(id => 
      queryResult.profiles.find(p => p.id === id)
    ).filter(Boolean) // Remove any undefined entries
    
    const remainingProfiles = queryResult.profiles.filter(p => 
      !castingResponse.profileIds.includes(p.id)
    )
    // Show AI-selected profiles first (in AI's order), then remaining matches
    const matchedProfiles = [...aiSelectedProfiles, ...remainingProfiles]
    
    console.log('🎉 PIPELINE COMPLETE:', {
      totalProcessed: queryResult.totalMatched,
      aiRecommendations: castingResponse.profileIds.length,
      totalProfilesShown: matchedProfiles.length,
      confidence: parsedQuery.confidence
    })

    return NextResponse.json({
      response: castingResponse.response,
      profiles: matchedProfiles,
      conversationHistory: [
        ...conversationHistory.slice(-4),
        { role: 'user', content: message },
        { role: 'assistant', content: castingResponse.response }
      ],
      // Debug/analytics data
      searchStats: castingResponse.searchStats,
      parsedQuery: parsedQuery,
      pipeline: 'two-agent'
    })
    
  } catch (error) {
    console.error('🚨 Two-Agent Pipeline Error:', error)
    
    // Fallback to simple response
    return NextResponse.json({
      response: "I encountered an issue processing your request. Please try rephrasing your search or contact support if the problem persists.",
      profiles: [],
      conversationHistory: [
        ...conversationHistory.slice(-4),
        { role: 'user', content: message },
        { role: 'assistant', content: "I encountered an issue processing your request. Please try again." }
      ],
      error: error instanceof Error ? error.message : 'Unknown error',
      pipeline: 'two-agent-failed'
    }, { status: 500 })
  }
}
