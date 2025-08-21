import OpenAI from 'openai'
import { ParsedQuery } from './query-parser'
import { QueryResult } from './structured-query'
import { findLocationByValue } from '@/lib/constants/locations'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface CastingResponse {
  response: string
  profileIds: string[]
  searchStats: {
    method: string
    totalFound: number
    filtersApplied: string[]
    confidence: number
  }
}

export async function generateCastingResponse(
  originalMessage: string,
  parsedQuery: ParsedQuery,
  queryResult: QueryResult
): Promise<CastingResponse> {
  
  // Build context about the search
  const searchContext = buildSearchContext(parsedQuery, queryResult)
  
  // Build performer profiles for Claude
  const performerProfiles = buildPerformerProfiles(queryResult.profiles)
  
  const prompt = `You are an expert casting assistant specializing in finding the BEST POSSIBLE MATCHES even when exact matches don't exist.

SEARCH: "${originalMessage}"
FOUND: ${queryResult.totalMatched} performers

AVAILABLE PERFORMERS:
${performerProfiles}

CRITICAL INSTRUCTION: You will almost NEVER find exact matches. Your job is to find CLOSE MATCHES with as many attributes as possible. Be creative and flexible:

MATCHING PHILOSOPHY:
- Height: ±2 inches is excellent, ±3-4 inches is still very good
- Location: Nearby cities/regions are great options
- Skills: Related skills or strong fundamentals count (e.g., martial arts experience for sword work)
- Physical attributes: Look for close approximations rather than exact matches
- Focus on POTENTIAL and ADAPTABILITY

TONE & STYLE:
- Be positive and confident about "close matches"
- Emphasize WHY each person could work (training potential, similar experience, etc.)
- Keep responses SHORT (2-3 sentences max)
- Present as "excellent options" or "strong candidates"

CRITICAL RULES:
- ONLY use the EXACT FULL NAMES from the performer list above - NEVER make up or modify names
- In your response, mention only the TOP 3-4 performers maximum in the chat
- Always include ALL profile IDs for the UI: [PROFILES: id1,id2,id3,id4,etc]
- If no suitable matches exist, be honest and say so clearly
- Focus on adaptability and training potential

FORMAT: "I found [EXACT FULL NAME] who would be an excellent choice because [specific close-match reasons]. [Optional: Add 2-3 more with exact names if available]"`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.choices[0]?.message?.content || ''
    console.log('🎭 Agent 2 Response:', responseText)

    // Extract profile IDs from response
    const profileMatch = responseText.match(/\[PROFILES: (.*?)\]/)
    const profileIds = profileMatch ? 
      profileMatch[1].split(',').map(id => id.trim()).filter(id => id.length > 0) : 
      []

    // Clean response text (remove profile IDs)
    const cleanResponse = responseText.replace(/\[PROFILES: .*?\]/, '').trim()

    return {
      response: cleanResponse,
      profileIds,
      searchStats: {
        method: queryResult.method,
        totalFound: queryResult.totalMatched,
        filtersApplied: queryResult.filtersApplied,
        confidence: parsedQuery.confidence
      }
    }

  } catch (error) {
    console.error('Casting assistant error:', error)
    
    // Fallback response
    const fallbackResponse = queryResult.profiles.length > 0 
      ? `I found ${queryResult.profiles.length} performer(s) that could work for your project!`
      : `No exact matches found. Try expanding your search criteria for more options.`

    return {
      response: fallbackResponse,
      profileIds: queryResult.profiles.slice(0, 3).map(p => p.id), // Return first 3 as fallback
      searchStats: {
        method: queryResult.method,
        totalFound: queryResult.totalMatched,
        filtersApplied: queryResult.filtersApplied,
        confidence: parsedQuery.confidence
      }
    }
  }
}

function buildSearchContext(parsedQuery: ParsedQuery, queryResult: QueryResult): string {
  const context = []
  
  context.push(`Search Method: ${queryResult.method}`)
  context.push(`Performers Found: ${queryResult.totalMatched}`)
  context.push(`Parse Confidence: ${(parsedQuery.confidence * 100).toFixed(0)}%`)
  
  if (queryResult.filtersApplied.length > 0) {
    context.push(`Filters Applied: ${queryResult.filtersApplied.join(', ')}`)
  }
  
  // Add interpreted criteria
  const criteria = []
  if (parsedQuery.gender) criteria.push(`Gender: ${parsedQuery.gender}`)
  if (parsedQuery.location) {
    const locationData = findLocationByValue(parsedQuery.location)
    criteria.push(`Location: ${locationData?.label || parsedQuery.location}`)
  }
  if (parsedQuery.height_min && parsedQuery.height_max) {
    const minHeight = `${Math.floor(parsedQuery.height_min / 12)}'${parsedQuery.height_min % 12}"`
    const maxHeight = `${Math.floor(parsedQuery.height_max / 12)}'${parsedQuery.height_max % 12}"`
    criteria.push(`Height Range: ${minHeight} - ${maxHeight}`)
  }
  if (parsedQuery.skills.length > 0) {
    criteria.push(`Skills: ${parsedQuery.skills.join(', ')}`)
  }
  if (parsedQuery.union_status) criteria.push(`Union: ${parsedQuery.union_status}`)
  if (parsedQuery.availability) criteria.push(`Availability: ${parsedQuery.availability}`)
  
  if (criteria.length > 0) {
    context.push(`Interpreted Criteria: ${criteria.join(' | ')}`)
  }
  
  return context.join('\n')
}

function buildPerformerProfiles(profiles: any[]): string {
  if (profiles.length === 0) {
    return "No performers found matching the specified criteria."
  }

  return profiles.map(profile => {
    // Get primary location display
    const primaryLocation = profile.primary_location_structured 
      ? findLocationByValue(profile.primary_location_structured)?.label || profile.primary_location_structured
      : profile.location || 'Location not specified'

    // Get secondary location display  
    const secondaryLocation = profile.secondary_location_structured
      ? findLocationByValue(profile.secondary_location_structured)?.label || profile.secondary_location_structured
      : profile.secondary_location

    // Build height display
    const height = (profile.height_feet && profile.height_inches) 
      ? `${profile.height_feet}'${profile.height_inches}"`
      : (profile.height_feet ? `${profile.height_feet}'0"` : 'Height not specified')

    // Build weight display
    const weight = profile.weight_lbs ? `${profile.weight_lbs} lbs` : 'Weight not specified'

    // Build skills list
    const skills = profile.profile_skills?.map((skill: any) =>
      `${skill.skill_id}${skill.proficiency_level ? ` (${skill.proficiency_level})` : ''}${skill.years_experience ? ` - ${skill.years_experience} years` : ''}`
    ).join(', ') || 'No skills listed'

    // Build certifications list
    const certifications = profile.profile_certifications?.map((cert: any) =>
      `${cert.certification_id}${cert.date_obtained ? ` (${cert.date_obtained})` : ''}`
    ).join(', ') || 'No certifications listed'

    // Build a comprehensive profile
    const profileSections = [
      `ID: ${profile.id}`,
      `Name: ${profile.full_name}`,
      `Gender: ${profile.gender || 'Not specified'}`,
      `Primary Location: ${primaryLocation}`,
    ]

    if (secondaryLocation) {
      profileSections.push(`Secondary Location: ${secondaryLocation}`)
    }

    profileSections.push(
      `Height: ${height}`,
      `Weight: ${weight}`,
      `Ethnicity: ${profile.ethnicity || 'Not specified'}`,
      `Hair: ${profile.hair_color || 'Not specified'}`,
      `Union Status: ${profile.union_status || 'Not specified'}`,
      `Availability: ${profile.availability_status || 'Not specified'}`,
      `Travel: ${profile.travel_radius || 'local'}`,
      `Skills: ${skills}`,
      `Certifications: ${certifications}`
    )

    if (profile.bio) {
      profileSections.push(`Bio: ${profile.bio}`)
    }

    if (profile.reel_url) {
      profileSections.push(`Demo Reel: Available`)
    }

    if (profile.resume_url) {
      profileSections.push(`Resume: Available`)
    }

    return profileSections.join('\n') + '\n---'
  }).join('\n\n')
}
