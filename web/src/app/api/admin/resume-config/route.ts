import { NextRequest, NextResponse } from 'next/server'
import { 
  getResumeAnalysisConfig, 
  enableTestingMode, 
  enableProOnlyMode, 
  disableResumeAnalysis 
} from '@/lib/config/resume-analysis'

/**
 * 🔧 ADMIN API: Resume Analysis Configuration
 * 
 * Easy way to switch between testing mode and Pro-only mode
 * 
 * Usage:
 * GET /api/admin/resume-config - Get current config
 * POST /api/admin/resume-config - Update config
 */

export async function GET() {
  try {
    const config = getResumeAnalysisConfig()
    
    return NextResponse.json({
      success: true,
      config,
      description: {
        current_mode: config.enableForAllUsers ? 'Testing (All Users)' : 'Tier-Based',
        eligible_tiers: config.eligibleTiers,
        max_analysis: config.maxAnalysisCount
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get config' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    switch (action) {
      case 'testing':
        enableTestingMode()
        break
        
      case 'pro_only':
        enableProOnlyMode()
        break
        
      case 'disable':
        disableResumeAnalysis()
        break
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: testing, pro_only, or disable' 
        }, { status: 400 })
    }
    
    const newConfig = getResumeAnalysisConfig()
    
    return NextResponse.json({
      success: true,
      message: `Resume analysis switched to: ${action}`,
      config: newConfig
    })
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update config' 
    }, { status: 500 })
  }
}
