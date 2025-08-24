import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Settings } from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select how you'd like to use our platform. You cannot change this later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Stunt Performer Option */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors flex flex-col h-full">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Stunt Performer</CardTitle>
              <CardDescription className="text-base">
                Create a detailed profile to showcase your skills and get discovered by casting directors
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Create detailed profile with photos, skills, and measurements
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Upload resume and demo reel
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Get discovered through search and project submissions
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Submit to project databases
                </div>
              </div>
              
              <Link href="/profile/create" className="block">
                <Button className="w-full text-base py-6">
                  Create Performer Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stunt Coordinator Option */}
          <Card className="relative overflow-hidden border-2 hover:border-secondary/50 transition-colors flex flex-col h-full">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <Settings className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Stunt Coordinator</CardTitle>
              <CardDescription className="text-base">
                Create project databases to find and manage stunt performers for your productions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3 flex-shrink-0"></div>
                  Quick setup with just your name
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3 flex-shrink-0"></div>
                  Create project databases for your productions
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3 flex-shrink-0"></div>
                  Review performer submissions
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3 flex-shrink-0"></div>
                  Private profile (not visible in searches)
                </div>
              </div>
              
              <Link href="/profile/coordinator/create" className="block">
                <Button variant="secondary" className="w-full text-base py-6">
                  Create Coordinator Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
