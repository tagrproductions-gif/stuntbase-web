import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
// 🚨 MEMORY FIX: Conditional import to prevent loading pdf-parse when disabled
// import pdfParse from 'pdf-parse' // MOVED TO CONDITIONAL IMPORT

// 🚀 MEMORY FIX: Create OpenAI client per request, not globally
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

export interface ResumeAnalysis {
  profileId: string
  fullName: string
  tier: 'free' | 'pro' | 'premium'
  relevantExperience: string[]
  notableCredits: string[]
  yearsExperience: number
  relevanceScore: number
  skillsFromResume: string[]
  analyzed: boolean
  reason?: string // Why resume wasn't analyzed
}

export interface ResumeConfig {
  // Current setting - analyze all top 4 for testing
  enableForAllUsers: boolean
  
  // Future setting - tier-based analysis
  enabledTiers: ('free' | 'pro' | 'premium')[]
  
  // Performance limits
  maxResumesToAnalyze: number
  timeoutMs: number
}

// 🚀 MEMORY SAFE: Resume analysis for TOP 2 profiles only using stored text
const RESUME_CONFIG: ResumeConfig = {
  enableForAllUsers: true,
  enabledTiers: ['pro', 'premium'], 
  maxResumesToAnalyze: 2, // ONLY TOP 2 profiles for memory safety
  timeoutMs: 10000
}

/**
 * Main function: Analyze resumes based on current tier configuration
 */
export async function analyzeEligibleResumes(
  topProfiles: any[],
  searchContext: string
): Promise<ResumeAnalysis[]> {
  // Check if disabled
  if (!RESUME_CONFIG.enableForAllUsers || RESUME_CONFIG.maxResumesToAnalyze === 0) {
    console.log('📄 Resume Analyzer: DISABLED for memory safety')
    return []
  }

  console.log('📄 Resume Analyzer: Starting analysis for', topProfiles.length, 'profiles')
  console.log('📄 Config:', RESUME_CONFIG)

  // 🚀 MEMORY SAFE: Only analyze TOP profiles with resumes
  const profilesWithResumes = topProfiles
    .filter(profile => profile.resume_url) // Only profiles with resumes
    .slice(0, RESUME_CONFIG.maxResumesToAnalyze) // Limit to top 2

  console.log(`📄 Found ${profilesWithResumes.length} profiles with resumes out of ${topProfiles.length} total`)

  if (profilesWithResumes.length === 0) {
    console.log('📄 No resumes to analyze, skipping AI analysis')
    return []
  }

  // 🚀 MEMORY SAFE: Fetch stored resume text for these profiles only
  const profilesWithResumeText = await enrichProfilesWithResumeText(profilesWithResumes)

  // 🚀 PARALLEL PROCESSING: Analyze all resumes simultaneously
  const resumePromises = profilesWithResumeText.map(profile => 
    analyzeProfileResume(profile, searchContext)
  )
  
  console.log(`📄 Starting parallel analysis of ${resumePromises.length} resumes...`)
  const analyses = await Promise.all(resumePromises)

  const analyzedCount = analyses.filter(a => a.analyzed).length
  console.log(`📄 Resume Analyzer: Completed ${analyzedCount}/${analyses.length} analyses in parallel`)

  return analyses
}

/**
 * 🚀 MEMORY SAFE: Fetch resume_text for specific profiles only
 */
async function enrichProfilesWithResumeText(profiles: any[]): Promise<any[]> {
  const supabase = createClient()
  
  console.log(`📄 Fetching stored resume text for ${profiles.length} specific profiles...`)
  
  const profileIds = profiles.map(p => p.id)
  
  const { data: resumeData, error } = await supabase
    .from('profiles')
    .select('id, resume_text')
    .in('id', profileIds)
  
  if (error) {
    console.error('📄 Failed to fetch resume text:', error)
    return profiles // Return without resume text
  }
  
  // Merge resume text into profiles
  const enrichedProfiles = profiles.map(profile => {
    const resumeInfo = resumeData?.find(r => r.id === profile.id)
    return {
      ...profile,
      resume_text: resumeInfo?.resume_text || null
    }
  })
  
  console.log(`📄 Successfully enriched ${enrichedProfiles.length} profiles with resume text`)
  return enrichedProfiles
}

/**
 * Analyze a single profile's resume with tier checking
 */
async function analyzeProfileResume(
  profile: any,
  searchContext: string
): Promise<ResumeAnalysis> {
  const baseAnalysis: ResumeAnalysis = {
    profileId: profile.id,
    fullName: profile.full_name,
    tier: profile.subscription_tier || 'free',
    relevantExperience: [],
    notableCredits: [],
    yearsExperience: 0,
    relevanceScore: 0,
    skillsFromResume: [],
    analyzed: false
  }

  // 🔧 TIER ELIGIBILITY CHECK
  if (!isEligibleForResumeAnalysis(profile)) {
    return {
      ...baseAnalysis,
      reason: RESUME_CONFIG.enableForAllUsers 
        ? 'No resume uploaded'
        : `Tier '${profile.subscription_tier || 'free'}' not eligible for resume analysis`
    }
  }

  // Check if resume exists
  if (!profile.resume_url) {
    return {
      ...baseAnalysis,
      reason: 'No resume uploaded'
    }
  }

  try {
    console.log(`📄 Starting resume analysis for ${profile.id}`)
    
    // 🚀 MEMORY FIX: Use cached text instead of downloading PDF
    let resumeText = profile.resume_text
    
    // Fallback: If no cached text, extract from PDF (for existing profiles)
    if (!resumeText && profile.resume_url) {
      console.log('📄 No cached text found, extracting from PDF (legacy profile)')
      resumeText = await extractPDFText(profile.resume_url)
    }
    
    if (!resumeText || resumeText.length < 50) {
      return {
        ...baseAnalysis,
        reason: 'Resume text not available or too short'
      }
    }

    // AI Analysis using cached or extracted text
    const aiAnalysis = await analyzeResumeWithAI(resumeText, searchContext)
    
    console.log(`📄 Successfully analyzed resume for ${profile.id}`)
    return {
      ...baseAnalysis,
      ...aiAnalysis,
      analyzed: true
    }

  } catch (error) {
    console.error(`📄 Resume analysis failed for ${profile.id}:`, error)
    return {
      ...baseAnalysis,
      reason: 'Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

/**
 * 🔧 TIER ELIGIBILITY - Easy to change for migration
 */
function isEligibleForResumeAnalysis(profile: any): boolean {
  // Current logic: All users eligible (for testing)
  if (RESUME_CONFIG.enableForAllUsers) {
    return true
  }

  // Future logic: Only Pro+ users eligible
  const userTier = profile.subscription_tier || 'free'
  const isEligibleTier = RESUME_CONFIG.enabledTiers.includes(userTier as any)
  
  // Check if Pro subscription is still active
  if (userTier === 'pro' || userTier === 'premium') {
    const expiresAt = profile.subscription_expires_at
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return false // Subscription expired
    }
  }

  return isEligibleTier
}

/**
 * 🚀 MEMORY SAFE: No PDF downloading - should use stored text instead
 * This function should never be called now that we store text on upload
 */
async function extractPDFText(resumeUrl: string): Promise<string> {
  // 🚀 NEVER DOWNLOAD PDFs - all text should be pre-stored in database
  throw new Error('PDF downloading disabled - resume text should be pre-stored in database')
}

/**
 * Analyze resume text with AI
 */
async function analyzeResumeWithAI(
  resumeText: string,
  searchContext: string
): Promise<Partial<ResumeAnalysis>> {
  const prompt = `Analyze this stunt performer's resume for the search context: "${searchContext}"

RESUME TEXT:
${resumeText.substring(0, 3000)} // Limit to prevent token overflow

INSTRUCTIONS:
- Extract the most relevant work experience (max 3 credits)
- Identify notable productions or well-known directors
- Find specific skills mentioned that relate to the search
- Estimate total years of experience
- Rate relevance to search (0.0-1.0)

Return ONLY valid JSON:
{
  "relevantExperience": ["Most relevant credit 1", "Most relevant credit 2"],
  "notableCredits": ["Big budget film or known director"],
  "yearsExperience": estimated_years_as_number,
  "relevanceScore": 0.0_to_1.0,
  "skillsFromResume": ["skill1", "skill2", "skill3"]
}`

  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.choices[0]?.message?.content || ''
    
    // Strip markdown code blocks if present
    const cleanedResponse = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    
    return JSON.parse(cleanedResponse)

  } catch (error) {
    console.error('📄 AI resume analysis failed:', error)
    throw new Error('AI analysis failed')
  }
}

/**
 * 🔧 CONFIGURATION HELPERS - For easy tier migration
 */
export function updateResumeConfig(newConfig: Partial<ResumeConfig>) {
  Object.assign(RESUME_CONFIG, newConfig)
  console.log('📄 Resume config updated:', RESUME_CONFIG)
}

// Easy migration function - call this when you want to switch to Pro-only
export function enableProOnlyMode() {
  updateResumeConfig({
    enableForAllUsers: false,
    enabledTiers: ['pro', 'premium']
  })
  console.log('📄 Switched to Pro-only resume analysis mode')
}

// Utility to check current config
export function getResumeConfig(): ResumeConfig {
  return { ...RESUME_CONFIG }
}
