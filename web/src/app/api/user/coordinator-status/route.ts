import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user/coordinator-status - Check if current user is a coordinator
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a coordinator
    const { data: coordinator, error } = await supabase
      .from('stunt_coordinators')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking coordinator status:', error)
      return NextResponse.json({ error: 'Failed to check coordinator status' }, { status: 500 })
    }

    return NextResponse.json({ 
      isCoordinator: !!coordinator 
    })
  } catch (error) {
    console.error('Coordinator status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
