import OpenAI from 'openai'
import { ALL_LOCATIONS } from '@/lib/constants/locations'
import { ETHNIC_APPEARANCE_OPTIONS } from '@/lib/constants/ethnic-appearance'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface ParsedQuery {
  gender: 'Man' | 'Woman' | 'Non-binary' | 'Other' | null
  location: string | null
  ethnicity: 'WHITE' | 'BLACK' | 'ASIAN' | 'HISPANIC' | 'MIDDLE_EASTERN' | null
  height_min: number | null
  height_max: number | null
  weight_min: number | null
  weight_max: number | null
  skills: string[]
  age_range: string | null
  union_status: string | null
  availability: string | null
  travel_radius: string | null
  confidence: number
}

export async function parseUserQuery(userMessage: string): Promise<ParsedQuery> {
  // Build location mappings for the prompt
  const locationMappings = ALL_LOCATIONS.map(loc => 
    `- ${loc.value}: "${loc.label}" (aliases: ${loc.aliases.join(', ')})`
  ).join('\n')

  // Build ethnic appearance mappings for the prompt
  const ethnicMappings = ETHNIC_APPEARANCE_OPTIONS.map(opt => 
    `- "${opt.value}" (for: ${opt.label.toLowerCase()})`
  ).join('\n')

  const prompt = `You are a casting assistant AI. Parse this search query into EXACT database filters.

CRITICAL: You can ONLY output the exact values listed below. Do not create variations or alternatives.

EXACT GENDER VALUES (choose one or null):
- "Man" (for: male, man, men, guy, guys, dude, boy, boys, gentleman)
- "Woman" (for: female, woman, women, girl, girls, lady, ladies, chick, gal)  
- "Non-binary" (for: non-binary, nonbinary, nb, they/them)
- "Other" (for: other, transgender, trans, genderfluid)

EXACT LOCATION CODES (choose one or null):
${locationMappings}

EXACT ETHNIC APPEARANCE VALUES (choose one or null):
${ethnicMappings}

EXACT SKILL CATEGORIES (choose from list or empty array):
- "fight" (for: martial arts, combat, boxing, karate, mma, wrestling, fighting, jiu-jitsu, kickboxing, taekwondo, muay thai, self-defense, action)
- "drive" (for: driving, motorcycle, car, vehicle, racing, drift, precision driving, chase scenes, automotive)
- "swim" (for: water, diving, scuba, underwater, pool, ocean, lifeguard, synchronized swimming, aquatic)
- "climb" (for: climbing, rope, wall, mountain, rock climbing, rappelling, parkour, free running, scaling)
- "horse" (for: horse, riding, equestrian, horseback, mounted, cavalry, western)
- "gun" (for: gun, firearm, weapon, tactical, military, police, swat, combat training, weapons handling, firearms)
- "acrobat" (for: acrobatics, gymnastics, tumbling, flips, aerial, circus, contortion, flexibility)
- "wire" (for: wire work, flying, harness, aerial stunts, rigging, suspended)
- "fire" (for: fire, pyro, pyrotechnics, flame, burn stunts, fire safety, explosions)
- "bike" (for: bicycle, bmx, mountain bike, cycling, bike stunts, motorcycle)
- "dance" (for: dance, choreography, ballet, hip hop, contemporary, ballroom, pole dancing, movement)
- "ski" (for: skiing, snowboard, winter sports, ice skating, hockey, snow)

EXACT AVAILABILITY VALUES (choose one or null):
- "available" (for: available, free, open, ready)
- "busy" (for: busy, working, booked, occupied)
- "unavailable" (for: unavailable, not available, out, off)

EXACT UNION STATUS VALUES (choose one or null):
- "SAG-AFTRA" (for: sag, aftra, sag-aftra, union, unionized)
- "Non-union" (for: non-union, nonunion, non union, not union)
- "Unknown" (for: unknown, not sure, maybe)

EXACT TRAVEL RADIUS VALUES (choose one or null):
- "local" (for: local, nearby, close)
- "50" (for: 50 miles, within 50, 50mi)
- "100" (for: 100 miles, within 100, 100mi)  
- "200" (for: 200 miles, within 200, 200mi)
- "state" (for: statewide, same state, in state)
- "regional" (for: regional, multi-state, region)
- "national" (for: national, anywhere, nationwide, travel)
- "international" (for: international, worldwide, global, abroad)

USER QUERY: "${userMessage}"

PARSING RULES:
1. Height: Convert to inches (5'8" = 68). For single height, use ±2 inch range.
2. Skills: Map ANY related terms to the exact categories above
3. Location: Map ANY city/region to exact location codes above
4. Gender: Map ANY gender terms to exact values above
5. Only use values from the lists above - NEVER create new values

Return ONLY valid JSON (no explanation, no other text):
{
  "gender": "Man|Woman|Non-binary|Other|null",
  "location": "exact-location-code-from-list-above|null",
  "ethnicity": "WHITE|BLACK|ASIAN|HISPANIC|MIDDLE_EASTERN|null",
  "height_min": number_in_inches|null,
  "height_max": number_in_inches|null,
  "weight_min": number_in_pounds|null,
  "weight_max": number_in_pounds|null,
  "skills": ["exact-skill-categories-from-list-above"],
  "age_range": "18-25|26-35|36-45|46+|null",
  "union_status": "SAG-AFTRA|Non-union|Unknown|null",
  "availability": "available|busy|unavailable|null",
  "travel_radius": "local|50|100|200|state|regional|national|international|null",
  "confidence": 0.0-1.0
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.choices[0]?.message?.content || ''
    console.log('🤖 Agent 1 Raw Response:', responseText)

    // Parse JSON directly (OpenAI's JSON mode ensures valid JSON)
    let parsed: ParsedQuery = JSON.parse(responseText)
    console.log('🤖 Agent 1 Raw Parsed Query:', parsed)

    // Validate and clean the parsed query
    parsed = validateParsedQuery(parsed)

    return parsed
  } catch (error) {
    console.error('Query parsing error:', error)
    // Return safe fallback
    return {
      gender: null,
      location: null,
      ethnicity: null,
      height_min: null,
      height_max: null,
      weight_min: null,
      weight_max: null,
      skills: [],
      age_range: null,
      union_status: null,
      availability: null,
      travel_radius: null,
      confidence: 0.0
    }
  }
}

// Helper function to validate parsed query
export function validateParsedQuery(parsed: ParsedQuery): ParsedQuery {
  console.log('🔍 Validating parsed query:', parsed)

  // Ensure gender is valid
  const validGenders = ['Man', 'Woman', 'Non-binary', 'Other']
  if (parsed.gender && !validGenders.includes(parsed.gender)) {
    console.log(`❌ Invalid gender "${parsed.gender}", setting to null`)
    parsed.gender = null
  }

  // Validate location exists
  if (parsed.location && !ALL_LOCATIONS.find(loc => loc.value === parsed.location)) {
    console.log(`❌ Invalid location "${parsed.location}", setting to null`)
    parsed.location = null
  }

  // Validate ethnicity
  const validEthnicities = ETHNIC_APPEARANCE_OPTIONS.map(opt => opt.value)
  if (parsed.ethnicity && !validEthnicities.includes(parsed.ethnicity)) {
    console.log(`❌ Invalid ethnicity "${parsed.ethnicity}", setting to null`)
    parsed.ethnicity = null
  }

  // Validate availability
  const validAvailability = ['available', 'busy', 'unavailable']
  if (parsed.availability && !validAvailability.includes(parsed.availability)) {
    console.log(`❌ Invalid availability "${parsed.availability}", setting to null`)
    parsed.availability = null
  }

  // Validate union status
  const validUnionStatus = ['SAG-AFTRA', 'Non-union', 'Unknown']
  if (parsed.union_status && !validUnionStatus.includes(parsed.union_status)) {
    console.log(`❌ Invalid union status "${parsed.union_status}", setting to null`)
    parsed.union_status = null
  }

  // Validate travel radius
  const validTravelRadius = ['local', '50', '100', '200', 'state', 'regional', 'national', 'international']
  if (parsed.travel_radius && !validTravelRadius.includes(parsed.travel_radius)) {
    console.log(`❌ Invalid travel radius "${parsed.travel_radius}", setting to null`)
    parsed.travel_radius = null
  }

  // Validate height range
  if (parsed.height_min && (parsed.height_min < 48 || parsed.height_min > 96)) {
    console.log(`❌ Invalid height_min "${parsed.height_min}", setting to null`)
    parsed.height_min = null
  }
  if (parsed.height_max && (parsed.height_max < 48 || parsed.height_max > 96)) {
    console.log(`❌ Invalid height_max "${parsed.height_max}", setting to null`)
    parsed.height_max = null
  }

  // Validate weight range  
  if (parsed.weight_min && (parsed.weight_min < 80 || parsed.weight_min > 400)) {
    console.log(`❌ Invalid weight_min "${parsed.weight_min}", setting to null`)
    parsed.weight_min = null
  }
  if (parsed.weight_max && (parsed.weight_max < 80 || parsed.weight_max > 400)) {
    console.log(`❌ Invalid weight_max "${parsed.weight_max}", setting to null`)
    parsed.weight_max = null
  }

  // Validate skills
  const validSkills = ['fight', 'drive', 'swim', 'climb', 'horse', 'gun', 'acrobat', 'wire', 'fire', 'bike', 'dance', 'ski']
  const originalSkills = [...parsed.skills]
  parsed.skills = parsed.skills.filter(skill => validSkills.includes(skill))
  
  if (originalSkills.length !== parsed.skills.length) {
    const invalidSkills = originalSkills.filter(skill => !validSkills.includes(skill))
    console.log(`❌ Invalid skills "${invalidSkills.join(', ')}", removed from list`)
  }

  // Ensure confidence is between 0 and 1
  if (parsed.confidence < 0) parsed.confidence = 0
  if (parsed.confidence > 1) parsed.confidence = 1

  console.log('✅ Validated parsed query:', parsed)
  return parsed
}
