import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin } = requestUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback:', { 
    fullUrl: request.url,
    code: code ? 'present' : 'missing', 
    origin, 
    next,
    allSearchParams: Object.fromEntries(searchParams.entries()),
    headers: {
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'host': request.headers.get('host'),
      'user-agent': request.headers.get('user-agent')
    }
  })

  if (code) {
    const supabase = createClient()
    console.log('Attempting to exchange code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('Code exchange successful, user:', data.user?.email);
      // Always use the production URL in production, regardless of headers
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      
      let redirectUrl: string
      
      if (isLocalEnv) {
        // In development, use the origin from the request
        redirectUrl = `${origin}${next}`
      } else if (siteUrl) {
        // In production, always use the configured site URL
        redirectUrl = `${siteUrl}${next}`
      } else {
        // Fallback to origin if no site URL is configured
        redirectUrl = `${origin}${next}`
      }
      
      console.log('Successful auth, redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('Auth exchange error:', error)
    }
  }

  // Determine error page URL
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  const errorUrl = isLocalEnv ? `${origin}/auth/auth-code-error` : 
                   siteUrl ? `${siteUrl}/auth/auth-code-error` : 
                   `${origin}/auth/auth-code-error`
  
  console.log('Auth failed, redirecting to error page:', errorUrl)
  return NextResponse.redirect(errorUrl)
}
