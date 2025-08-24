'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start border-2 shadow-lg text-red-600 hover:text-red-700 hover:bg-red-50" 
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
