'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function AuthDebug() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
      
      console.log('Session:', session)
      console.log('User:', session?.user)
      console.log('Error:', error)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setSession(session)
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div>Loading auth state...</div>

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Authentication Debug</h3>
      <div className="space-y-2 text-sm">
        <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
        <p><strong>Role:</strong> {user?.role || 'None'}</p>
        {session && (
          <details>
            <summary>Full session data</summary>
            <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
