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
  queryResult: QueryResult,
  conversationHistory: any[] = [],
  resumeAnalyses: any[] = []
): Promise<CastingResponse> {
  
  // Build context about the search
  const searchContext = buildSearchContext(parsedQuery, queryResult)
  
  // Build performer profiles for Claude (already randomized for equal scores in structured-query.ts)
  const performerProfiles = buildPerformerProfiles(queryResult.profiles, resumeAnalyses)
  
  // Build conversation context for more natural responses
  const recentContext = conversationHistory
    .slice(-3)
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  const contextAwarePrompt = conversationHistory.length > 0 
    ? `\nCONVERSATION CONTEXT:\n${recentContext}\n\nCURRENT REQUEST: "${originalMessage}"`
    : `\nFIRST REQUEST: "${originalMessage}"`
  
  const prompt = `You are Alex, a professional casting assistant who builds relationships while finding the perfect stunt performers. You're knowledgeable, friendly, and excellent at matching talent to projects.

${contextAwarePrompt}

SEARCH RESULTS: ${queryResult.totalMatched} performers found

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
- Reference the conversation context naturally if it exists
- Be warm and professional, like you're building an ongoing relationship
- Emphasize WHY each person could work (training potential, similar experience, etc.)
- Use clean emoji-based formatting for easy reading (NO markdown symbols)
- Present as "excellent options" or "strong candidates"
- If this is a follow-up search, acknowledge their previous requests

CRITICAL RULES:
- ONLY use the EXACT FULL NAMES from the performer list above - NEVER make up or modify names
- Present TOP 3-4 performers maximum using clean emoji-based format
- When multiple performers match equally well, vary which ones you highlight (don't always pick the first ones listed)
- **MANDATORY**: ALWAYS end your response with ALL profile IDs in this EXACT format: [PROFILES: id1,id2,id3,id4,etc]
- If no suitable matches exist, be honest and suggest broadening criteria
- Reference their project needs and show you remember their requirements
- Focus on adaptability and training potential

RESPONSE FORMAT EXAMPLE:
I found some excellent options for your project! Here are my top recommendations:

🎬 Sarah Chen
📍 Los Angeles, CA • 5'7", 130 lbs, Asian ethnicity
⭐ Key Skills: Martial Arts, Wire Work, Gymnastics
🎥 Experience: Worked on "John Wick 4" as stunt double, 8 years experience
✨ Why Perfect: Her martial arts background and wire work experience make her ideal for action sequences

🎬 Marcus Torres
📍 Atlanta, GA • 5'9", 165 lbs, Hispanic ethnicity
⭐ Key Skills: Precision Driving, Firearms, Motorcycle
🎥 Experience: Fast & Furious franchise stunt driver, 12 years experience
✨ Why Perfect: Extensive driving experience and firearms training match your requirements

🎬 Brandon Martinez
📍 New York, NY • 6'0", 180 lbs, SAG-AFTRA member
⭐ Key Skills: Gymnastics, Combat, Parkour
✨ Why Perfect: His gymnastics foundation provides excellent body control and adaptability

[PROFILES: prof123,prof456,prof789]

CLEAN FORMATTING RULES:
- Start with a brief intro line
- Use 🎬 Name (no markdown symbols) for each performer heading
- Use emoji prefixes: 📍 Location • 🎬 Physical, ⭐ Skills, 🎥 Experience, ✨ Why Perfect
- Keep explanations concise (1-2 lines per section)
- Include resume insights when available (e.g., specific credits)
- Limit to TOP 3-4 performers to avoid overwhelming
- Always end with [PROFILES: ...] format
- NO markdown symbols (**, ##, -, etc.) - use clean text with emojis only

**CRITICAL**: Your response MUST end with [PROFILES: ...] containing the actual profile IDs from the list above. This is required for the UI to display profile cards.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600, // Increased for structured markdown formatting
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.choices[0]?.message?.content || ''
    console.log('🎭 Agent 2 Response:', responseText)

    // Extract profile IDs from response
    const profileMatch = responseText.match(/\[PROFILES: (.*?)\]/)
    let profileIds = profileMatch ? 
      profileMatch[1].split(',').map(id => id.trim()).filter(id => id.length > 0) : 
      []

    // FALLBACK: If no profile IDs found but we have profiles, extract from first few results
    if (profileIds.length === 0 && queryResult.profiles.length > 0) {
      console.log('⚠️ Agent 2 did not include profile IDs, using fallback')
      profileIds = queryResult.profiles.slice(0, 3).map(p => p.id)
    }

    // Clean response text (remove profile IDs)
    const cleanResponse = responseText.replace(/\[PROFILES: .*?\]/, '').trim()

    console.log('🎭 Agent 2 Final Profile IDs:', profileIds)

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
  if (parsedQuery.ethnicities && parsedQuery.ethnicities.length > 0) {
    criteria.push(`Ethnicities: ${parsedQuery.ethnicities.join(', ')}`)
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

function buildPerformerProfiles(profiles: any[], resumeAnalyses: any[] = []): string {
  if (profiles.length === 0) {
    return "No performers found matching the specified criteria."
  }

  return profiles.map(profile => {
    // Find resume analysis for this profile
    const resumeData = resumeAnalyses.find(r => r.profileId === profile.id)
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

    // 📄 ADD RESUME INSIGHTS (tier-aware)
    if (resumeData?.analyzed) {
      profileSections.push(`🎬 RESUME HIGHLIGHTS (${resumeData.tier.toUpperCase()} TIER):`)
      if (resumeData.relevantExperience.length > 0) {
        profileSections.push(`  Relevant Experience: ${resumeData.relevantExperience.join(', ')}`)
      }
      if (resumeData.notableCredits.length > 0) {
        profileSections.push(`  Notable Credits: ${resumeData.notableCredits.join(', ')}`)
      }
      if (resumeData.yearsExperience > 0) {
        profileSections.push(`  Total Experience: ${resumeData.yearsExperience} years`)
      }
      if (resumeData.skillsFromResume.length > 0) {
        profileSections.push(`  Skills from Resume: ${resumeData.skillsFromResume.join(', ')}`)
      }
      profileSections.push(`  Relevance Score: ${(resumeData.relevanceScore * 100).toFixed(0)}%`)
    } else if (resumeData?.reason) {
      profileSections.push(`📋 Resume Analysis: ${resumeData.reason}`)
    }

    return profileSections.join('\n') + '\n---'
  }).join('\n\n')
}
