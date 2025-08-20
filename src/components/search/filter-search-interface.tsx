'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RangeSlider } from '@/components/ui/range-slider'
import { ProfileCard } from './profile-card'
import { ChevronLeft, ChevronRight, Loader2, MapPin, Users, Filter, ChevronDown } from 'lucide-react'
import { SearchFilters, SearchQuery } from '@/lib/search/search-utils'
import { ALL_LOCATIONS, TIER1_MARKETS, TIER2_MARKETS } from '@/lib/constants/locations'
import { ETHNIC_APPEARANCE_OPTIONS } from '@/lib/constants/ethnic-appearance'

// Constants for filter options
const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Non-binary', value: 'Non-binary' },
  { label: 'Other', value: 'Other' }
]

const heightRanges = [
  { label: "4'6\" - 5'0\"", min: 54, max: 60 },
  { label: "5'0\" - 5'4\"", min: 60, max: 64 },
  { label: "5'4\" - 5'8\"", min: 64, max: 68 },
  { label: "5'8\" - 6'0\"", min: 68, max: 72 },
  { label: "6'0\" - 6'4\"", min: 72, max: 76 },
  { label: "6'4\"+", min: 76, max: 84 }
]

const weightRanges = [
  { label: "100-120 lbs", min: 100, max: 120 },
  { label: "120-140 lbs", min: 120, max: 140 },
  { label: "140-160 lbs", min: 140, max: 160 },
  { label: "160-180 lbs", min: 160, max: 180 },
  { label: "180-200 lbs", min: 180, max: 200 },
  { label: "200+ lbs", min: 200, max: 350 }
]

interface SearchResult {
  profiles: any[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FilterOptions {
  genderOptions: Array<{ label: string; value: string }>
  ethnicityOptions: Array<{ label: string; value: string }>
  locationOptions: Array<{ label: string; value: string }>
  heightRange: { min: number; max: number }
  weightRange: { min: number; max: number }
  unionOptions: Array<{ label: string; value: string }>
  availabilityOptions: Array<{ label: string; value: string }>
  totalProfiles: number
}

export function FilterSearchInterface() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [heightRange, setHeightRange] = useState<[number, number]>([48, 84]) // Default 4' to 7'
  const [weightRange, setWeightRange] = useState<[number, number]>([80, 350]) // Default 80 to 350 lbs
  const [showAdvanced, setShowAdvanced] = useState(false)
  const limit = 12

  // Load filter options from API
  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/filters')
      if (response.ok) {
        const options: FilterOptions = await response.json()
        setFilterOptions(options)
        
        // Set initial height and weight ranges based on actual data
        if (options.heightRange) {
          setHeightRange([options.heightRange.min, options.heightRange.max])
        }
        if (options.weightRange) {
          setWeightRange([options.weightRange.min, options.weightRange.max])
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // Perform search
  const performSearch = async (searchPage: number = 1, newFilters?: SearchFilters) => {
    setLoading(true)
    
    try {
      // Include height and weight ranges in filters
      const searchFilters = newFilters !== undefined ? newFilters : filters
      
      // Add height range if it's been modified
      if (heightRange[0] > (filterOptions?.heightRange.min || 48) || 
          heightRange[1] < (filterOptions?.heightRange.max || 84)) {
        searchFilters.minHeight = heightRange[0]
        searchFilters.maxHeight = heightRange[1]
      }
      
      // Add weight range if it's been modified  
      if (weightRange[0] > (filterOptions?.weightRange.min || 80) || 
          weightRange[1] < (filterOptions?.weightRange.max || 350)) {
        searchFilters.minWeight = weightRange[0]
        searchFilters.maxWeight = weightRange[1]
      }

      const searchQuery: SearchQuery = {
        filters: searchFilters,
        page: searchPage,
        limit,
        sortBy: 'updated',
        sortOrder: 'desc'
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

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    performSearch(1, newFilters)
  }

  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    performSearch(1, newFilters)
  }

  // Handle height range selection
  const selectHeightRange = (range: typeof heightRanges[0]) => {
    const newFilters = { 
      ...filters, 
      minHeight: range.min, 
      maxHeight: range.max === 120 ? undefined : range.max 
    }
    setFilters(newFilters)
    performSearch(1, newFilters)
  }

  // Handle weight range selection
  const selectWeightRange = (range: typeof weightRanges[0]) => {
    const newFilters = { 
      ...filters, 
      minWeight: range.min, 
      maxWeight: range.max === 500 ? undefined : range.max 
    }
    setFilters(newFilters)
    performSearch(1, newFilters)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    performSearch(newPage)
  }

  // Initial search to show all results
  useEffect(() => {
    performSearch(1)
  }, [])

  // Get active filter count
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters]
    return value !== undefined && value !== null && value !== ''
  }).length

  // Get readable location label
  const getLocationLabel = (value: string) => {
    const location = ALL_LOCATIONS.find(loc => loc.value === value)
    return location?.label || value
  }

  // Get readable height range
  const getHeightRangeLabel = () => {
    if (filters.minHeight && filters.maxHeight) {
      const feet1 = Math.floor(filters.minHeight / 12)
      const inches1 = filters.minHeight % 12
      const feet2 = Math.floor(filters.maxHeight / 12)
      const inches2 = filters.maxHeight % 12
      return `${feet1}'${inches1}" - ${feet2}'${inches2}"`
    } else if (filters.minHeight) {
      const feet = Math.floor(filters.minHeight / 12)
      const inches = filters.minHeight % 12
      return `over ${feet}'${inches}"`
    }
    return null
  }

  // Get readable weight range
  const getWeightRangeLabel = () => {
    if (filters.minWeight && filters.maxWeight) {
      return `${filters.minWeight} - ${filters.maxWeight} lbs`
    } else if (filters.minWeight) {
      return `over ${filters.minWeight} lbs`
    }
    return null
  }

  // Get readable ethnic appearance label
  const getEthnicityLabel = (value: string) => {
    const option = ETHNIC_APPEARANCE_OPTIONS.find(opt => opt.value === value)
    return option?.label || value
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="space-y-6">
        {/* Gender Filter */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Gender</h3>
          <div className="flex gap-3">
            {genderOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.gender === option.value ? "default" : "outline"}
                onClick={() => filters.gender === option.value 
                  ? removeFilter('gender') 
                  : updateFilter('gender', option.value)
                }
                className="px-6 py-2"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Ethnic Appearance Filter */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ethnic Appearance</h3>
          <div className="flex flex-wrap gap-3">
            {ETHNIC_APPEARANCE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filters.ethnicity === option.value ? "default" : "outline"}
                onClick={() => filters.ethnicity === option.value 
                  ? removeFilter('ethnicity') 
                  : updateFilter('ethnicity', option.value)
                }
                className="px-4 py-2"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </h3>
          <div className="space-y-4">
            {/* Tier 1 Markets */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Major Markets</h4>
              <div className="flex flex-wrap gap-2">
                {TIER1_MARKETS.map((location) => (
                  <Button
                    key={location.value}
                    variant={filters.location === location.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => filters.location === location.value 
                      ? removeFilter('location') 
                      : updateFilter('location', location.value)
                    }
                  >
                    {location.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tier 2 Markets */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Regional Markets</h4>
              <div className="flex flex-wrap gap-2">
                {TIER2_MARKETS.slice(0, 8).map((location) => (
                  <Button
                    key={location.value}
                    variant={filters.location === location.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => filters.location === location.value 
                      ? removeFilter('location') 
                      : updateFilter('location', location.value)
                    }
                  >
                    {location.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Height Range Slider-style buttons */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Height</h3>
          <div className="flex flex-wrap gap-2">
            {heightRanges.map((range, index) => {
              const isSelected = filters.minHeight === range.min && 
                (range.max === 120 ? !filters.maxHeight : filters.maxHeight === range.max)
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => isSelected 
                    ? (removeFilter('minHeight'), removeFilter('maxHeight'))
                    : selectHeightRange(range)
                  }
                >
                  {range.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Weight Range Slider-style buttons */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Weight</h3>
          <div className="flex flex-wrap gap-2">
            {weightRanges.map((range, index) => {
              const isSelected = filters.minWeight === range.min && 
                (range.max === 500 ? !filters.maxWeight : filters.maxWeight === range.max)
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => isSelected 
                    ? (removeFilter('minWeight'), removeFilter('maxWeight'))
                    : selectWeightRange(range)
                  }
                >
                  {range.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-4">
          <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
            ADVANCED OPTIONS
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.gender && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Gender: {filters.gender}
              <button onClick={() => removeFilter('gender')} className="ml-1 hover:bg-black/10 rounded-full">
                ×
              </button>
            </Badge>
          )}
          
          {filters.ethnicity && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {getEthnicityLabel(filters.ethnicity)}
              <button onClick={() => removeFilter('ethnicity')} className="ml-1 hover:bg-black/10 rounded-full">
                ×
              </button>
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {getLocationLabel(filters.location)}
              <button onClick={() => removeFilter('location')} className="ml-1 hover:bg-black/10 rounded-full">
                ×
              </button>
            </Badge>
          )}
          
          {getHeightRangeLabel() && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Height: {getHeightRangeLabel()}
              <button onClick={() => {removeFilter('minHeight'); removeFilter('maxHeight')}} className="ml-1 hover:bg-black/10 rounded-full">
                ×
              </button>
            </Badge>
          )}
          
          {getWeightRangeLabel() && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Weight: {getWeightRangeLabel()}
              <button onClick={() => {removeFilter('minWeight'); removeFilter('maxWeight')}} className="ml-1 hover:bg-black/10 rounded-full">
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Header */}
      {results && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {results.total === 0 ? 'No performers found' : 
               results.total === 1 ? 'Found 1 Performer' : 
               `Found ${results.total.toLocaleString()} Performers`}
            </h2>
          </div>
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
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No performers found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>Tips:</strong></p>
                  <ul className="text-left max-w-md mx-auto space-y-1">
                    <li>• Try removing some filters</li>
                    <li>• Expand your location search</li>
                    <li>• Consider different physical requirements</li>
                    <li>• Check other gender or ethnic appearance options</li>
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
