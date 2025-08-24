import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/debug/schema - Check if project_submissions table exists and its structure
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Try to query the table structure
    const { data, error } = await supabase
      .from('project_submissions')
      .select('*')
      .limit(1)

    // Try to get table info from information_schema
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'project_submissions' })
      .single()

    return NextResponse.json({
      tableExists: !error,
      sampleData: data,
      error: error?.message,
      tableInfo: tableInfo,
      tableError: tableError?.message
    })
  } catch (error) {
    console.error('Schema debug error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
