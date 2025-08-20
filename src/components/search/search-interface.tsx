'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { SearchFiltersComponent } from './search-filters'
import { ProfileCard } from './profile-card'
import { SearchSuggestions } from './search-suggestions'
import { Search, Filter, SortAsc, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { SearchFilters, SearchQuery } from '@/lib/search/search-utils'

interface SearchResult {
  profiles: any[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function SearchInterface() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'relevance' | 'experience' | 'rate' | 'location' | 'updated'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const limit = 12

  // Perform search
  const performSearch = async (searchPage: number = 1, newQuery?: string, newFilters?: SearchFilters) => {
    setLoading(true)
    
    try {
      const searchQuery: SearchQuery = {
        query: newQuery !== undefined ? newQuery : query,
        filters: newFilters !== undefined ? newFilters : filters,
        page: searchPage,
        limit,
        sortBy,
        sortOrder
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQuery),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResult = await response.json()
      setResults(data)
      setPage(searchPage)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ profiles: [], total: 0, page: 1, limit, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(1)
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    performSearch(1, query, filters)
  }

  // Handle sorting changes
  useEffect(() => {
    if (results) {
      performSearch(page)
    }
  }, [sortBy, sortOrder])

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    performSearch(newPage)
  }

  // Initial search to show some results
  useEffect(() => {
    performSearch(1)
  }, [])

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Stunt Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're looking for... (e.g., 'female martial artist with motorcycle skills in Los Angeles')"
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
            
            <SearchSuggestions
              onSuggestionClick={(suggestion) => {
                setQuery(suggestion)
                performSearch(1, suggestion)
              }}
            />
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <SearchFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />
      )}

      {/* Results Header */}
      {results && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {results.total === 0 ? 'No performers found' : 
               results.total === 1 ? '1 performer found' : 
               `${results.total.toLocaleString()} performers found`}
            </h2>
            {query && (
              <p className="text-gray-600 text-sm mt-1">
                Results for "{query}"
              </p>
            )}
          </div>

          {results.total > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="experience">Experience</option>
                  <option value="rate">Day Rate</option>
                  <option value="location">Location</option>
                  <option value="updated">Recently Updated</option>
                </Select>
              </div>
              
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Results Grid */}
      {results && !loading && (
        <>
          {results.profiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No performers found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>Tips:</strong></p>
                  <ul className="text-left max-w-md mx-auto space-y-1">
                    <li>• Try broader search terms</li>
                    <li>• Remove some filters</li>
                    <li>• Use different skill combinations</li>
                    <li>• Check spelling and try synonyms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {page} of {results.totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= results.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
