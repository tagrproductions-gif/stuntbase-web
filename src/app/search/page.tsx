import { Navbar } from '@/components/navigation/navbar'
import { ReactiveFilterInterface } from '@/components/search/reactive-filter-interface'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Find Stunt Performers</h1>
          <p className="text-muted-foreground mt-2">
            Use smart filters based on actual performer data to find the perfect talent
          </p>
        </div>

        <ReactiveFilterInterface />
      </div>
    </div>
  )
}
