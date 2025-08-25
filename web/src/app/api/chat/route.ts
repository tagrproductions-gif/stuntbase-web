import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchProfilesBySimilarity } from '@/lib/embeddings/embedding-service'
import { findLocationByAlias, ALL_LOCATIONS } from '@/lib/constants/locations'
import { parseUserQuery } from '@/lib/agents/query-parser'
import { queryWithStructuredFilters } from '@/lib/agents/structured-query'
import { generateCastingResponse } from '@/lib/agents/casting-assistant'
import { detectUserIntent } from '@/lib/agents/intent-detection'
import { generateConversationalResponse } from '@/lib/agents/conversational-agent'
import { detectNameQuery, searchProfilesByName, generateNameBasedResponse } from '@/lib/agents/name-detector'
import { analyzeEligibleResumes } from '@/lib/agents/resume-analyzer' // 🚀 RE-ENABLED: Safe with stored text only

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
  // Memory monitoring (informational only)
  const memoryUsage = process.memoryUsage()
  const memoryMB = Math.round(memoryUsage.rss / 1024 / 1024)
  console.log(`🧠 Memory before chat: ${memoryMB}MB`)
  
  // Memory limit removed per user request

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
  let projectDatabaseId: string | null = null
  
  try {
    const requestData = await request.json()
    message = requestData.message
    conversationHistory = requestData.conversationHistory || []
    projectDatabaseId = requestData.projectDatabaseId || null
    
    console.log('🚀 ENHANCED AI PIPELINE STARTED')
    console.log('📝 User Message:', message)
    console.log('📚 Conversation Context:', conversationHistory.length, 'previous messages')
    console.log('🗄️ Project Database ID:', projectDatabaseId)

    // If searching within a project database, validate user ownership
    if (projectDatabaseId) {
      // Check if user owns this project database
      const { data: project, error: projectError } = await supabase
        .from('project_databases')
        .select('creator_user_id')
        .eq('id', projectDatabaseId)
        .eq('creator_user_id', user.id)
        .single()

      if (projectError || !project) {
        return NextResponse.json({ 
          error: 'Access denied: You do not own this project database',
          aiResponse: 'I cannot search that project database because you do not have access to it. Please select "Entire Database" or one of your own project databases.'
        }, { status: 403 })
      }
    }
    
    // STAGE -1: Name Detection - Fast preprocessing for name-based queries
    const nameQuery = detectNameQuery(message)
    console.log('👤 Name Query Check:', nameQuery)
    
    if (nameQuery.isNameQuery && nameQuery.confidence > 0.6) {
      // FAST NAME LOOKUP: Bypass expensive AI processing
      console.log('⚡ FAST NAME LOOKUP MODE: Processing specific person database search...')
      console.log('🔍 Searching database for:', nameQuery.extractedNames)
      
      const profileMatches = await searchProfilesByName(nameQuery.extractedNames, projectDatabaseId)
      const nameResponse = generateNameBasedResponse(message, nameQuery, profileMatches)
      
      console.log('✅ NAME LOOKUP COMPLETE:', {
        foundProfiles: profileMatches.length,
        responseLength: nameResponse.response.length
      })

      return NextResponse.json({
        response: nameResponse.response,
        profiles: profileMatches, // Show all found profiles, not just filtered ones
        conversationHistory: [
          ...conversationHistory.slice(-4),
          { role: 'user', content: message },
          { role: 'assistant', content: nameResponse.response }
        ],
        nameQuery: nameQuery,
        pipeline: 'name-lookup-mode'
      })
    }
    
    // STAGE 0: Intent Detection - Determine if this is search or conversation
    const intentAnalysis = await detectUserIntent(message, conversationHistory)
    console.log('🎯 Intent Analysis:', intentAnalysis)
    
    if (intentAnalysis.intent === 'search' && intentAnalysis.confidence > 0.6) {
      // SEARCH MODE: Check if this is a name query first
      console.log('🔍 SEARCH MODE: Processing as talent search...')
      
      // Sub-check: Is this a name-specific search?
      const nameQuery = detectNameQuery(message)
      if (nameQuery.isNameQuery && nameQuery.confidence > 0.5) {
        // This is a name query that was detected as search - use name lookup
        console.log('👤 DETECTED NAME WITHIN SEARCH: Routing to name lookup...')
        
        const profileMatches = await searchProfilesByName(nameQuery.extractedNames, projectDatabaseId)
        const nameResponse = generateNameBasedResponse(message, nameQuery, profileMatches)
        
        return NextResponse.json({
          response: nameResponse.response,
          profiles: profileMatches,
          conversationHistory: [
            ...conversationHistory.slice(-4),
            { role: 'user', content: message },
            { role: 'assistant', content: nameResponse.response }
          ],
          nameQuery: nameQuery,
          pipeline: 'search-to-name-lookup'
        })
      }
      
      // STAGE 1: Parse user query into structured filters
      console.log('🤖 AGENT 1: Parsing query...')
      const parsedQuery = await parseUserQuery(message)
      console.log('✅ AGENT 1 Result:', parsedQuery)
      
      // STAGE 2: Query database with structured filters
      console.log('🗄️ DATABASE: Querying with structured filters...')
      const queryResult = await queryWithStructuredFilters(parsedQuery, projectDatabaseId)
      console.log('✅ DATABASE Result:', {
        method: queryResult.method,
        totalFound: queryResult.totalMatched,
        filtersApplied: queryResult.filtersApplied
      })
      
      // STAGE 3: Resume analysis for TOP 2 profiles using stored text (MEMORY SAFE)
      console.log('📄 AGENT 3: Analyzing resumes for top 2 profiles using stored text...')
      const resumeAnalyses = await analyzeEligibleResumes(queryResult.profiles.slice(0, 2), message)
      
      // STAGE 4: Generate enhanced casting assistant response
      console.log('🎭 AGENT 2: Generating enhanced casting response...')
      const castingResponse = await generateCastingResponse(message, parsedQuery, queryResult, conversationHistory, resumeAnalyses)
      console.log('✅ AGENT 2 Result:', {
        responseLength: castingResponse.response.length,
        profileCount: castingResponse.profileIds.length
      })
      
      // 🚀 MEMORY OPTIMIZED: Get matching profiles with memory-conscious processing
      const aiSelectedProfiles = castingResponse.profileIds.map(id => 
        queryResult.profiles.find(p => p.id === id)
      ).filter(Boolean) // Remove any undefined entries
      
      const remainingProfiles = queryResult.profiles.filter(p => 
        !castingResponse.profileIds.includes(p.id)
      )
      // Show AI-selected profiles first (in AI's order), then remaining matches
      const matchedProfiles = [...aiSelectedProfiles, ...remainingProfiles]
      
      // 🗑️ MEMORY CLEANUP: Clear large intermediate arrays immediately
      try {
        queryResult.profiles.length = 0 // Clear the large original array
        castingResponse.profileIds.length = 0 // Clear AI response IDs
      } catch (cleanupError) {
        console.warn('⚠️ Profile array cleanup warning:', cleanupError)
      }
      
      console.log('🎉 SEARCH PIPELINE COMPLETE:', {
        totalProcessed: queryResult.totalMatched,
        aiRecommendations: aiSelectedProfiles.length,
        totalProfilesShown: matchedProfiles.length,
        confidence: parsedQuery.confidence
      })

      return NextResponse.json({
        response: castingResponse.response,
        profiles: matchedProfiles,
        resumeInsights: resumeAnalyses, // NEW: Resume analysis results
        conversationHistory: [
          ...conversationHistory.slice(-4),
          { role: 'user', content: message },
          { role: 'assistant', content: castingResponse.response }
        ],
        searchStats: {
          ...castingResponse.searchStats,
          resumeAnalysis: {
            totalEligible: resumeAnalyses.length,
            analyzedCount: resumeAnalyses.filter(r => r.analyzed).length,
            tierBreakdown: resumeAnalyses.reduce((acc, r) => {
              acc[r.tier] = (acc[r.tier] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          }
        },
        parsedQuery: parsedQuery,
        intentAnalysis: intentAnalysis,
        pipeline: 'search-with-resume-analysis'
      })
      
    } else {
      // CONVERSATION MODE: Natural chat interaction
      console.log('💬 CONVERSATION MODE: Engaging in natural dialogue...')
      
      const conversationalResponse = await generateConversationalResponse(message, conversationHistory, intentAnalysis)
      console.log('✅ CONVERSATION Response generated')
      
      return NextResponse.json({
        response: conversationalResponse.response,
        profiles: [], // No profiles for pure conversation
        conversationHistory: [
          ...conversationHistory.slice(-4),
          { role: 'user', content: message },
          { role: 'assistant', content: conversationalResponse.response }
        ],
        intentAnalysis: intentAnalysis,
        shouldTransitionToSearch: conversationalResponse.shouldTransitionToSearch,
        pipeline: 'conversation-mode'
      })
    }
    
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
  } finally {
    // 🚨 EMERGENCY: Force cleanup after every chat request
    try {
      if (typeof global !== 'undefined' && global.gc) {
        global.gc()
        const afterMemory = Math.round(process.memoryUsage().rss / 1024 / 1024)
        console.log(`🗑️ Memory after chat cleanup: ${afterMemory}MB`)
      }
      
      // 🆕 MEMORY FIX: Periodic require.cache cleanup to prevent module accumulation
      const requestCount = ((global as any).chatRequestCount || 0) + 1
      ;(global as any).chatRequestCount = requestCount
      
      // Every 25 chat requests, clear non-essential modules from cache
      if (requestCount % 25 === 0) {
        console.log(`🧹 Periodic cache cleanup (request #${requestCount})...`)
        let clearedCount = 0
        
        Object.keys(require.cache).forEach(key => {
          // Clear heavy modules that can be reloaded when needed
          if (key.includes('pdf-parse') || 
              key.includes('openai') || 
              key.includes('anthropic') ||
              (key.includes('node_modules') && 
               (key.includes('canvas') || key.includes('sharp') || key.includes('jimp')))) {
            delete require.cache[key]
            clearedCount++
          }
        })
        
        console.log(`🧹 Cleared ${clearedCount} cached modules to free memory`)
        
        // Force additional garbage collection after cache cleanup
        if (global.gc) {
          global.gc()
          console.log(`🗑️ Additional GC after cache cleanup`)
        }
      }
      
    } catch (cleanupError) {
      console.warn('Memory cleanup failed:', cleanupError)
    }
  }
}
