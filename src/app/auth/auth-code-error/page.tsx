'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-2">
            <Image
              src="/logo.png"
              alt="StuntPitch Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-3xl font-bold" style={{
              background: 'linear-gradient(135deg, #C15F3C, #ff6b35)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              StuntPitch
            </span>
          </Link>
          <p className="text-muted-foreground mt-2">Email Verification Issue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Verification Failed
            </CardTitle>
            <CardDescription>
              There was a problem verifying your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This could happen if:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>The verification link has expired</li>
                <li>The link has already been used</li>
                <li>There was a network connection issue</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signup">
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Signing Up Again
                </Button>
              </Link>
              
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If you continue having issues, please contact support
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
