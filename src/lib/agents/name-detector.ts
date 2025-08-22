import { createClient } from '@/lib/supabase/server'

export interface NameQuery {
  isNameQuery: boolean
  extractedNames: string[]
  queryType: 'contact_info' | 'general_info' | 'profile_lookup' | null
  confidence: number
}

/**
 * Lightweight name detection using regex patterns and keywords
 * This bypasses AI processing for obvious name-based queries
 */
export function detectNameQuery(message: string): NameQuery {
  const lowerMessage = message.toLowerCase()
  
  // Words that are clearly NOT names (exclude from name detection)
  const nonNameWords = new Set([
    'performers', 'people', 'talent', 'actors', 'stunt', 'fighter', 'fighters', 
    'driver', 'drivers', 'swimmer', 'swimmers', 'climber', 'climbers',
    'atlanta', 'los', 'angeles', 'new', 'york', 'chicago', 'miami', 'dallas',
    'male', 'female', 'man', 'woman', 'men', 'women', 'guy', 'guys', 'girl', 'girls',
    'available', 'looking', 'need', 'want', 'find', 'search', 'show', 'list',
    'tall', 'short', 'young', 'old', 'experienced', 'professional'
  ])

  // Patterns that indicate name-based queries (looking up specific people in database)
  const nameQueryPatterns = [
    // Direct name questions
    /what\s+is\s+([a-z\s]+?)['']?s?\s+(phone|email|contact|number|info)/i,
    /tell\s+me\s+about\s+([a-z\s]+)/i,
    /show\s+me\s+([a-z\s]+?)['']?s?\s+(profile|info|details)/i,
    /find\s+([a-z\s]+?)['']?s?\s+(profile|contact|info)/i,
    /who\s+is\s+([a-z\s]+)/i,
    /get\s+([a-z\s]+?)['']?s?\s+(phone|email|contact|details)/i,
    /contact\s+(info|details)?\s+for\s+([a-z\s]+)/i,
    /([a-z\s]+?)['']?s?\s+(phone|email|contact)\s+(number|info|details)/i,
    // More specific database lookup patterns
    /do\s+you\s+have\s+([a-z\s]+)\s+in\s+(your\s+)?(database|system)/i,
    /is\s+([a-z\s]+)\s+in\s+(your\s+)?(database|system)/i,
    /look\s+up\s+([a-z\s]+)/i,
    /search\s+for\s+([a-z\s]+)/i,
    /([a-z\s]+)\s+profile/i,
  ]
  
  // Separate pattern for detecting standalone names (more restrictive)
  const standaloneNamePattern = /^([a-z]+\s+[a-z]+(?:\s+[a-z]+)*)$/i
  
  // Check if message looks like a standalone name, but exclude non-name words
  let potentialStandaloneName = null
  const standaloneMatch = message.match(standaloneNamePattern)
  if (standaloneMatch) {
    const candidate = standaloneMatch[1].trim()
    const candidateWords = candidate.toLowerCase().split(/\s+/)
    const hasNonNameWord = candidateWords.some(word => nonNameWords.has(word))
    
    if (!hasNonNameWord && candidateWords.length >= 2) {
      potentialStandaloneName = candidate
    }
  }
  
  // Keywords that suggest contact/personal info requests
  const contactKeywords = [
    'phone', 'email', 'contact', 'number', 'reach', 'call', 'message',
    'details', 'info', 'information', 'profile'
  ]
  
  // Extract potential names from the message
  const extractedNames: string[] = []
  let hasContactRequest = false
  
  // Check for contact info keywords
  hasContactRequest = contactKeywords.some(keyword => lowerMessage.includes(keyword))
  
  // Try to extract names using patterns
  for (const pattern of nameQueryPatterns) {
    const match = message.match(pattern)
    if (match) {
      // Extract the captured name group (usually group 1 or 2)
      let nameMatch = match[1] || match[2]
      if (nameMatch) {
        nameMatch = nameMatch.trim()
        // Basic validation: name should be 2-50 chars and look like a name
        // Also exclude common non-name words
        const nameWords = nameMatch.toLowerCase().split(/\s+/)
        const hasNonNameWord = nameWords.some(word => nonNameWords.has(word))
        
        if (nameMatch.length >= 2 && nameMatch.length <= 50 && 
            /^[a-z\s\-'\.]+$/i.test(nameMatch) && 
            !hasNonNameWord) {
          extractedNames.push(nameMatch)
        }
      }
    }
  }
  
  // Add standalone name if found
  if (potentialStandaloneName) {
    extractedNames.push(potentialStandaloneName)
  }
  
  // Alternative: Look for capitalized words that might be names
  if (extractedNames.length === 0 && hasContactRequest) {
    // Find potential names (capitalized words, not common words)
    const words = message.split(/\s+/)
    const commonWords = new Set([
      'what', 'is', 'the', 'phone', 'number', 'email', 'contact', 'info', 'for',
      'tell', 'me', 'about', 'show', 'find', 'get', 'who', 'details', 'profile',
      'can', 'you', 'please', 'i', 'need', 'want', 'looking', 'search',
      ...Array.from(nonNameWords) // Include our non-name words
    ])
    
    let potentialName = ''
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '')
      if (cleanWord.length > 1 && 
          /^[A-Z][a-z]+$/.test(cleanWord) && 
          !commonWords.has(cleanWord.toLowerCase())) {
        potentialName += (potentialName ? ' ' : '') + cleanWord
      } else if (potentialName) {
        // End of potential name sequence
        if (potentialName.split(' ').length >= 1 && potentialName.length >= 2) {
          extractedNames.push(potentialName.trim())
        }
        potentialName = ''
      }
    }
    
    // Add final name if exists
    if (potentialName && potentialName.split(' ').length >= 1) {
      extractedNames.push(potentialName.trim())
    }
  }
  
  // Determine query type and confidence
  let queryType: NameQuery['queryType'] = null
  let confidence = 0
  
  if (extractedNames.length > 0) {
    if (lowerMessage.includes('phone') || lowerMessage.includes('contact') || lowerMessage.includes('email')) {
      queryType = 'contact_info'
      confidence = 0.9
    } else if (lowerMessage.includes('profile') || lowerMessage.includes('details') || lowerMessage.includes('info')) {
      queryType = 'general_info'
      confidence = 0.8
    } else {
      queryType = 'profile_lookup'
      confidence = 0.7
    }
  }
  
  const isNameQuery = extractedNames.length > 0 && confidence > 0.6
  
  console.log('👤 Name Detection:', {
    isNameQuery,
    extractedNames,
    queryType,
    confidence,
    originalMessage: message,
    interpretation: isNameQuery ? `Looking up person "${extractedNames.join(', ')}" in database` : 'Not a name query'
  })
  
  return {
    isNameQuery,
    extractedNames,
    queryType,
    confidence
  }
}

/**
 * Fast database search for profiles by name
 * Much more efficient than going through the full AI pipeline
 */
export async function searchProfilesByName(names: string[]): Promise<any[]> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        profile_photos (file_path, file_name, is_primary, sort_order),
        profile_skills (skill_id, proficiency_level, years_experience),
        profile_certifications (certification_id, date_obtained, expiration_date, certification_number)
      `)
      .eq('is_public', true)
    
    // Build name search conditions
    const nameConditions: string[] = []
    
    for (const name of names) {
      // Search in full_name using ILIKE for case-insensitive partial matching
      nameConditions.push(`full_name.ilike.%${name}%`)
      
      // Also try variations (first name, last name)
      const nameParts = name.split(' ')
      if (nameParts.length > 1) {
        // Try each name part individually for more flexible matching
        nameParts.forEach(part => {
          if (part.length > 1) { // Skip single letters
            nameConditions.push(`full_name.ilike.%${part}%`)
          }
        })
      }
    }
    
    // Combine all name conditions with OR
    if (nameConditions.length > 0) {
      query = query.or(nameConditions.join(','))
    }
    
    // Limit results to prevent overwhelming response
    query = query.limit(10)
    
    const { data: profiles, error } = await query
    
    if (error) {
      console.error('Name search error:', error)
      return []
    }
    
    console.log(`👤 Found ${profiles?.length || 0} profiles matching names: ${names.join(', ')}`)
    console.log(`👤 Search conditions used:`, nameConditions)
    console.log(`👤 Profiles found:`, profiles?.map(p => ({ id: p.id, name: p.full_name, isPublic: p.is_public })))
    
    return profiles || []
    
  } catch (error) {
    console.error('Name search failed:', error)
    return []
  }
}

/**
 * Generate a response for name-based queries without heavy AI processing
 */
export function generateNameBasedResponse(
  originalMessage: string,
  nameQuery: NameQuery,
  profiles: any[]
): { response: string; profileIds: string[] } {
  
  if (profiles.length === 0) {
    return {
      response: `I searched our performer database but couldn't find "${nameQuery.extractedNames.join(' or ')}" in our system. This person doesn't appear to have a profile with us. Would you like me to help you search for performers with similar names or different criteria?`,
      profileIds: []
    }
  }
  
  if (profiles.length === 1) {
    const profile = profiles[0]
    
    if (nameQuery.queryType === 'contact_info') {
      // For contact info, be helpful but protect sensitive data
      return {
        response: `I found ${profile.full_name}! For contact information and booking inquiries, please view their full profile where you can find their professional contact details and representation information.`,
        profileIds: [profile.id]
      }
    } else {
      // For general info queries
      const location = profile.primary_location_structured || profile.location || 'Location not specified'
      const skills = profile.profile_skills?.slice(0, 3).map((s: any) => s.skill_id).join(', ') || 'No skills listed'
      
      return {
        response: `Here's ${profile.full_name}! They're based in ${location}${skills !== 'No skills listed' ? ` and specialize in ${skills}` : ''}. Check out their full profile for more details, photos, and contact information.`,
        profileIds: [profile.id]
      }
    }
  } else {
    // Multiple matches
    const matchNames = profiles.slice(0, 3).map(p => p.full_name).join(', ')
    const remaining = profiles.length > 3 ? ` and ${profiles.length - 3} others` : ''
    
    return {
      response: `I found several performers: ${matchNames}${remaining}. Could you be more specific about which one you're looking for?`,
      profileIds: profiles.slice(0, 5).map(p => p.id) // Show up to 5 profiles
    }
  }
}
