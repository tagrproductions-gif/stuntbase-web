import { Metadata } from 'next'
import { Navbar } from '@/components/navigation/navbar'
import { ReactiveFilterInterface } from '@/components/search/reactive-filter-interface'

export const metadata: Metadata = {
  title: 'Search Stunt Performers - StuntPitch',
  description: 'Search and filter through hundreds of professional stunt performers. Find the perfect talent for your project using advanced filters and AI-powered search.',
  openGraph: {
    title: 'Search Stunt Performers - StuntPitch',
    description: 'Search and filter through hundreds of professional stunt performers. Find the perfect talent for your project using advanced filters and AI-powered search.',
    url: 'https://stuntpitch.com/search',
    siteName: 'StuntPitch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Stunt Performers - StuntPitch',
    description: 'Search and filter through hundreds of professional stunt performers. Find the perfect talent for your project using advanced filters and AI-powered search.',
  },
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Find Stunt Performers</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Use smart filters based on actual performer data to find the perfect talent
          </p>
        </div>

        <ReactiveFilterInterface />
      </div>
    </div>
  )
}
