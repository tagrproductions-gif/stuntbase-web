import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { migrateExistingResumes } from '../../../../scripts/migrate-existing-resumes'

/**
 * 🔄 Admin API to trigger backwards migration of existing resumes
 * 
 * POST /api/admin/migrate-resumes
 * 
 * This endpoint allows admins to trigger the migration process via HTTP request
 * instead of running the script directly.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Admin triggered resume migration via API')
    
    // Basic admin check (you might want to add proper admin authentication)
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Optional: Add admin role check here
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('is_admin')
    //   .eq('user_id', user.id)
    //   .single()
    // 
    // if (!profile?.is_admin) {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   )
    // }
    
    // Start migration (this will run in the background)
    console.log('🚀 Starting resume migration process...')
    
    // Run migration and capture output
    const migrationPromise = migrateExistingResumes()
    
    return NextResponse.json({
      message: 'Resume migration started',
      status: 'running',
      timestamp: new Date().toISOString(),
      note: 'Check server logs for detailed progress'
    })
    
  } catch (error) {
    console.error('💥 Migration API error:', error)
    return NextResponse.json(
      { 
        error: 'Migration failed to start',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/migrate-resumes
 * 
 * Check migration status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check how many resumes need migration
    const { data: profilesNeedingMigration, error } = await supabase
      .from('profiles')
      .select('id, full_name, resume_url')
      .not('resume_url', 'is', null)
      .is('resume_text', null)
    
    if (error) {
      throw error
    }
    
    // Check how many resumes have been migrated
    const { data: migratedProfiles, error: migratedError } = await supabase
      .from('profiles')
      .select('id')
      .not('resume_url', 'is', null)
      .not('resume_text', 'is', null)
    
    if (migratedError) {
      throw migratedError
    }
    
    return NextResponse.json({
      status: 'checked',
      needsMigration: profilesNeedingMigration?.length || 0,
      alreadyMigrated: migratedProfiles?.length || 0,
      pendingProfiles: profilesNeedingMigration?.map(p => ({
        id: p.id,
        name: p.full_name,
        resumeUrl: p.resume_url
      })) || [],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Migration status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
