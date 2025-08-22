import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  console.log('Custom email verification:', { token, email })

  if (!token || !email) {
    console.log('Missing token or email')
    return NextResponse.redirect('https://stuntpitch.com/auth/verify-error?error=missing_params')
  }

  try {
    const supabase = createClient()
    
    // Verify the token manually
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) {
      console.error('OTP verification failed:', error)
      return NextResponse.redirect('https://stuntpitch.com/auth/verify-error?error=invalid_token')
    }

    console.log('Email verification successful for:', email)
    
    // Redirect to dashboard with success
    return NextResponse.redirect('https://stuntpitch.com/dashboard?verified=true')
    
  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.redirect('https://stuntpitch.com/auth/verify-error?error=server_error')
  }
}
