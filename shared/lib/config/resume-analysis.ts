/**
 * 🔧 RESUME ANALYSIS CONFIGURATION
 * 
 * Easy tier migration system - change these settings to control
 * which users get resume analysis based on subscription tiers
 */

export interface ResumeAnalysisConfig {
  // Enable resume analysis for all users (current mode for testing)
  enableForAllUsers: boolean
  
  // Which tiers are eligible when tier-based mode is enabled
  eligibleTiers: ('free' | 'pro' | 'premium')[]
  
  // Maximum number of resumes to analyze per search
  maxAnalysisCount: number
  
  // Timeout for PDF processing
  timeoutMs: number
}

// 🔧 CURRENT CONFIGURATION
const CONFIG: ResumeAnalysisConfig = {
  // ✅ PHASE 1: Analyze all users for testing
  enableForAllUsers: true,
  
  // 🔮 PHASE 2: Switch to Pro+ only (set enableForAllUsers to false)
  eligibleTiers: ['pro', 'premium'],
  
  maxAnalysisCount: 4,
  timeoutMs: 10000
}

export function getResumeAnalysisConfig(): ResumeAnalysisConfig {
  return { ...CONFIG }
}

export function updateResumeAnalysisConfig(updates: Partial<ResumeAnalysisConfig>) {
  Object.assign(CONFIG, updates)
  console.log('📄 Resume analysis config updated:', CONFIG)
}

// 🚀 MIGRATION HELPERS

/**
 * Phase 1: Test with all users (current)
 */
export function enableTestingMode() {
  updateResumeAnalysisConfig({
    enableForAllUsers: true
  })
  console.log('🧪 Resume analysis: TESTING MODE (all users)')
}

/**
 * Phase 2: Switch to Pro-only mode
 */
export function enableProOnlyMode() {
  updateResumeAnalysisConfig({
    enableForAllUsers: false,
    eligibleTiers: ['pro', 'premium']
  })
  console.log('💎 Resume analysis: PRO-ONLY MODE')
}

/**
 * Emergency: Disable resume analysis entirely
 */
export function disableResumeAnalysis() {
  updateResumeAnalysisConfig({
    enableForAllUsers: false,
    eligibleTiers: []
  })
  console.log('🚫 Resume analysis: DISABLED')
}
