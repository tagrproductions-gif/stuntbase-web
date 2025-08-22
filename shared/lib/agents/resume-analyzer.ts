import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

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

// Configuration - easily changeable for tier migration
const RESUME_CONFIG: ResumeConfig = {
  // 🔧 CURRENT: Analyze all users for testing
  enableForAllUsers: true,
  
  // 🔮 FUTURE: Only analyze Pro+ users (change enableForAllUsers to false)
  enabledTiers: ['pro', 'premium'],
  
  maxResumesToAnalyze: 4,
  timeoutMs: 10000 // 10 second timeout per resume
}

/**
 * Main function: Analyze resumes based on current tier configuration
 */
export async function analyzeEligibleResumes(
  topProfiles: any[],
  searchContext: string
): Promise<ResumeAnalysis[]> {
  console.log('📄 Resume Analyzer: Starting analysis for', topProfiles.length, 'profiles')
  console.log('📄 Config:', RESUME_CONFIG)

  const analyses: ResumeAnalysis[] = []
  const profilesToAnalyze = topProfiles.slice(0, RESUME_CONFIG.maxResumesToAnalyze)

  for (const profile of profilesToAnalyze) {
    const analysis = await analyzeProfileResume(profile, searchContext)
    analyses.push(analysis)
  }

  const analyzedCount = analyses.filter(a => a.analyzed).length
  console.log(`📄 Resume Analyzer: Completed ${analyzedCount}/${analyses.length} analyses`)

  return analyses
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
    // Extract text from PDF
    const resumeText = await extractPDFText(profile.resume_url)
    if (!resumeText || resumeText.length < 50) {
      return {
        ...baseAnalysis,
        reason: 'Resume text extraction failed or too short'
      }
    }

    // AI Analysis
    const aiAnalysis = await analyzeResumeWithAI(resumeText, searchContext)
    
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
 * Extract text from PDF resume
 */
async function extractPDFText(resumeUrl: string): Promise<string> {
  // For now, return placeholder - you'll need to implement PDF parsing
  // Options: pdf-parse, pdfjs-dist, or external service like PDFShift
  
  // Simulated PDF extraction
  console.log('📄 Extracting PDF text from:', resumeUrl)
  
  // TODO: Implement actual PDF text extraction
  // const response = await fetch(resumeUrl)
  // const buffer = await response.arrayBuffer()
  // const pdf = await pdfParse(Buffer.from(buffer))
  // return pdf.text
  
  // Placeholder for now
  return "Sample resume content for testing - replace with actual PDF extraction"
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
    return JSON.parse(responseText)

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
