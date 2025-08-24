'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Search, User, Menu, X, Database, Bot } from 'lucide-react'

export function Navbar() {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogoClick = () => {
    // Force a full page refresh when clicking the logo
    // This resets the chat interface back to homepage state
    if (window.location.pathname === '/') {
      window.location.reload()
    }
    closeMobileMenu()
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3" onClick={handleLogoClick}>
              <Image
                src="/logo.png"
                alt="StuntPitch Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #C15F3C, #ff6b35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                StuntPitch
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {pathname === '/search' ? (
              <Link href="/">
                <Button variant="ghost" className="text-sm">
                  <Bot className="mr-2 h-4 w-4" />
                  AI Search
                </Button>
              </Link>
            ) : pathname.startsWith('/dashboard') ? (
              <Link href="/">
                <Button variant="ghost" className="text-sm">
                  <Bot className="mr-2 h-4 w-4" />
                  AI Search
                </Button>
              </Link>
            ) : (
              <Link href="/search">
                <Button variant="ghost" className="text-sm">
                  <Search className="mr-2 h-4 w-4" />
                  Filter Search
                </Button>
              </Link>
            )}
            {user && (
              <Link href="/projects">
                <Button variant="ghost" className="text-sm">
                  <Database className="mr-2 h-4 w-4" />
                  Projects
                </Button>
              </Link>
            )}
            
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : user ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="text-sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="text-sm">Join Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {pathname === '/search' ? (
                <Link href="/" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <Bot className="mr-3 h-5 w-5" />
                    AI Search
                  </Button>
                </Link>
              ) : pathname.startsWith('/dashboard') ? (
                <Link href="/" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <Bot className="mr-3 h-5 w-5" />
                    AI Search
                  </Button>
                </Link>
              ) : (
                <Link href="/search" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <Search className="mr-3 h-5 w-5" />
                    Filter Search
                  </Button>
                </Link>
              )}
              {user && (
                <Link href="/projects" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <Database className="mr-3 h-5 w-5" />
                    Projects
                  </Button>
                </Link>
              )}
              
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : user ? (
                <Link href="/dashboard" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <User className="mr-3 h-5 w-5" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2 px-2">
                  <Link href="/auth/login" onClick={closeMobileMenu} className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={closeMobileMenu} className="block">
                    <Button className="w-full">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
