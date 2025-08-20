'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Search, User, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="StuntBase Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #C15F3C, #ff6b35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                StuntBase
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/search">
              <Button variant="ghost">
                <Search className="mr-2 h-4 w-4" />
                Filter Search
              </Button>
            </Link>
            
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Join Now</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
