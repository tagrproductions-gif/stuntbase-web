'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RangeSlider } from '@/components/ui/range-slider'
import { ProfileCard } from './profile-card'
import { ChevronLeft, ChevronRight, Loader2, Users, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { SearchFilters, SearchQuery } from '@/lib/search/search-utils'

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

export function ReactiveFilterInterface() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [heightRange, setHeightRange] = useState<[number, number]>([48, 84])
  const [weightRange, setWeightRange] = useState<[number, number]>([80, 350])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const limit = 12

  // Load filter options from actual database data
  const loadFilterOptions = async () => {
    setFiltersLoading(true)
    try {
      const response = await fetch('/api/filters')
      if (response.ok) {
        const options: FilterOptions = await response.json()
        setFilterOptions(options)
        
        // Set initial ranges based on actual data
        if (options.heightRange) {
          setHeightRange([options.heightRange.min, options.heightRange.max])
        }
        if (options.weightRange) {
          setWeightRange([options.weightRange.min, options.weightRange.max])
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    } finally {
      setFiltersLoading(false)
    }
  }

  // Perform search with current filters
  const performSearch = async (searchPage: number = 1) => {
    setLoading(true)
    
    try {
      const searchFilters = { ...filters }
      
      // Always add height range (let backend decide if it's meaningful)
      if (filterOptions) {
        // Only add height filter if it's been changed from the full range
        if (heightRange[0] > filterOptions.heightRange.min || 
            heightRange[1] < filterOptions.heightRange.max) {
          searchFilters.minHeight = heightRange[0]
          searchFilters.maxHeight = heightRange[1]
        }
        
        // Only add weight filter if it's been changed from the full range
        if (weightRange[0] > filterOptions.weightRange.min || 
            weightRange[1] < filterOptions.weightRange.max) {
          searchFilters.minWeight = weightRange[0]
          searchFilters.maxWeight = weightRange[1]
        }
      }

      console.log('🎯 Sending search filters:', searchFilters)
      console.log('📊 Height range:', heightRange, 'Weight range:', weightRange)

      const searchQuery: SearchQuery = {
        filters: searchFilters,
        page: searchPage,
        limit,
        sortBy: 'updated',
        sortOrder: 'desc'
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery),
      })

      if (!response.ok) throw new Error('Search failed')

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

  // Handle dropdown filter changes
  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters }
    if (value === '' || value === 'all') {
      delete newFilters[key]
    } else {
      (newFilters as any)[key] = value
    }
    setFilters(newFilters)
  }

  // Remove a specific filter
  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
  }

  // Handle height slider change
  const handleHeightChange = (range: [number, number]) => {
    setHeightRange(range)
  }

  // Handle weight slider change
  const handleWeightChange = (range: [number, number]) => {
    setWeightRange(range)
  }

  // Format height for display
  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12)
    const remainingInches = inches % 12
    return remainingInches > 0 ? `${feet}'${remainingInches}"` : `${feet}'`
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    performSearch(newPage)
  }

  // Initialize
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Search when filters change
  useEffect(() => {
    if (filterOptions && !filtersLoading) {
      performSearch(1)
    }
  }, [filters, heightRange, weightRange, filterOptions, filtersLoading])

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = Object.keys(filters).length
    
    if (filterOptions) {
      if (heightRange[0] > filterOptions.heightRange.min || 
          heightRange[1] < filterOptions.heightRange.max) count++
      if (weightRange[0] > filterOptions.weightRange.min || 
          weightRange[1] < filterOptions.weightRange.max) count++
    }
    
    return count
  }

  if (filtersLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading filters...</span>
      </div>
    )
  }

  if (!filterOptions) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load filter options</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filter Section */}
      <Card>
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-2 py-0.5">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[32px] sm:min-h-[36px] touch-manipulation"
          >
            <span className="hidden sm:inline">
              {filtersCollapsed ? 'Show Filters' : 'Hide Filters'}
            </span>
            <span className="sm:hidden">
              {filtersCollapsed ? 'Show' : 'Hide'}
            </span>
            {filtersCollapsed ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          filtersCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
        }`}>
          <CardContent className="p-3 sm:p-6 pt-3 sm:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Gender Filter */}
            <div>
              <Label htmlFor="gender" className="text-sm font-semibold mb-2 block">Gender</Label>
              <Select
                value={filters.gender || ''}
                onChange={(e) => updateFilter('gender', e.target.value)}
              >
                <option value="">All Genders</option>
                {filterOptions.genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Ethnicity Filter */}
            <div>
              <Label htmlFor="ethnicity" className="text-sm font-semibold mb-2 block">Ethnic Appearance</Label>
              <Select
                value={filters.ethnicity || ''}
                onChange={(e) => updateFilter('ethnicity', e.target.value)}
              >
                <option value="">All Ethnicities</option>
                {filterOptions.ethnicityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <Label htmlFor="location" className="text-sm font-semibold mb-2 block">Location</Label>
              <Select
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
              >
                <option value="">All Locations</option>
                {filterOptions.locationOptions.slice(0, 20).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Union Status Filter */}
            <div>
              <Label htmlFor="union" className="text-sm font-semibold mb-2 block">Union Status</Label>
              <Select
                value={filters.unionStatus || ''}
                onChange={(e) => updateFilter('unionStatus', e.target.value)}
              >
                <option value="">All Union Status</option>
                {filterOptions.unionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Height and Weight Sliders */}
          <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-6">
            {/* Height Slider */}
            <div>
              <Label className="text-sm font-semibold mb-2 sm:mb-4 block">
                Height: {formatHeight(heightRange[0])} - {formatHeight(heightRange[1])}
              </Label>
              <RangeSlider
                min={filterOptions.heightRange.min}
                max={filterOptions.heightRange.max}
                value={heightRange}
                onValueChange={handleHeightChange}
                formatLabel={formatHeight}
                className="mt-2"
              />
            </div>

            {/* Weight Slider */}
            <div>
              <Label className="text-sm font-semibold mb-2 sm:mb-4 block">
                Weight: {weightRange[0]} lbs - {weightRange[1]} lbs
              </Label>
              <RangeSlider
                min={filterOptions.weightRange.min}
                max={filterOptions.weightRange.max}
                value={weightRange}
                onValueChange={handleWeightChange}
                formatLabel={(v) => `${v} lbs`}
                className="mt-2"
              />
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 min-h-[32px] sm:min-h-[36px] touch-manipulation"
            >
              ADVANCED OPTIONS
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="availability" className="text-sm font-semibold mb-2 block">Availability</Label>
                  <Select
                    value={filters.availabilityStatus || ''}
                    onChange={(e) => updateFilter('availabilityStatus', e.target.value)}
                  >
                    <option value="">All Availability</option>
                    {filterOptions.availabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </div>
      </Card>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && !filtersCollapsed && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}:
          </span>
          
          {Object.entries(filters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              {key}: {value}
              <button 
                onClick={() => removeFilter(key as keyof SearchFilters)} 
                className="ml-1 hover:bg-black/10 rounded-full"
              >
                ×
              </button>
            </Badge>
          ))}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {results.profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No performers found</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Try adjusting your filters to find what you're looking for.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="w-full sm:w-auto min-h-[44px] touch-manipulation"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Page {page} of {results.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= results.totalPages || loading}
                className="w-full sm:w-auto min-h-[44px] touch-manipulation"
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
