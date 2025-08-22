'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { SearchFilters } from '@/lib/search/search-utils'
import { getAllSkills } from '@/lib/supabase/profiles'
import { Skill } from '@/types/database'

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onApplyFilters: () => void
  loading?: boolean
}

export function SearchFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  loading = false 
}: SearchFiltersProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  useEffect(() => {
    loadSkills()
  }, [])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const loadSkills = async () => {
    const { data } = await getAllSkills()
    if (data) {
      setAvailableSkills(data)
    }
  }

  const updateLocalFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onApplyFilters()
  }

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    onApplyFilters()
  }

  const addSkill = (skillName: string) => {
    const currentSkills = localFilters.skills || []
    if (!currentSkills.includes(skillName)) {
      updateLocalFilter('skills', [...currentSkills, skillName])
    }
    setSkillSearch('')
  }

  const removeSkill = (skillName: string) => {
    const currentSkills = localFilters.skills || []
    updateLocalFilter('skills', currentSkills.filter(s => s !== skillName))
  }

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !(localFilters.skills || []).includes(skill.name)
  )

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof SearchFilters]
    return value !== undefined && value !== null && value !== '' && 
           !(Array.isArray(value) && value.length === 0)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Results
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State, Country"
              value={localFilters.location || ''}
              onChange={(e) => updateLocalFilter('location', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select
              value={localFilters.availabilityStatus || ''}
              onChange={(e) => updateLocalFilter('availabilityStatus', e.target.value || undefined)}
            >
              <option value="">Any availability</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="space-y-2">
            <Input
              placeholder="Search and add skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
            
            {skillSearch && filteredSkills.length > 0 && (
              <div className="border rounded-md bg-white shadow-sm max-h-32 overflow-y-auto">
                {filteredSkills.slice(0, 5).map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    onClick={() => addSkill(skill.name)}
                  >
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-xs text-gray-500">{skill.category}</div>
                  </button>
                ))}
              </div>
            )}

            {localFilters.skills && localFilters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {localFilters.skills.map(skill => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Advanced Filters</h4>
            
            {/* Physical Attributes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height Range (inches)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minHeight || ''}
                    onChange={(e) => updateLocalFilter('minHeight', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxHeight || ''}
                    onChange={(e) => updateLocalFilter('maxHeight', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Weight Range (lbs)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minWeight || ''}
                    onChange={(e) => updateLocalFilter('minWeight', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxWeight || ''}
                    onChange={(e) => updateLocalFilter('maxWeight', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Experience and Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minExperience || ''}
                    onChange={(e) => updateLocalFilter('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxExperience || ''}
                    onChange={(e) => updateLocalFilter('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Day Rate Range ($)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minDayRate || ''}
                    onChange={(e) => updateLocalFilter('minDayRate', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxDayRate || ''}
                    onChange={(e) => updateLocalFilter('maxDayRate', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={localFilters.gender || ''}
                  onChange={(e) => updateLocalFilter('gender', e.target.value || undefined)}
                >
                  <option value="">Any gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="union">Union Status</Label>
                <Select
                  value={localFilters.unionStatus || ''}
                  onChange={(e) => updateLocalFilter('unionStatus', e.target.value || undefined)}
                >
                  <option value="">Any union status</option>
                  <option value="SAG-AFTRA">SAG-AFTRA</option>
                  <option value="Non-union">Non-union</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel">Travel Radius (miles)</Label>
              <Input
                id="travel"
                type="number"
                placeholder="Minimum travel radius"
                value={localFilters.travelRadius || ''}
                onChange={(e) => updateLocalFilter('travelRadius', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters} disabled={loading} className="flex-1">
            {loading ? 'Applying...' : 'Apply Filters'}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filter Count */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600 text-center">
            {Object.keys(localFilters).filter(key => {
              const value = localFilters[key as keyof SearchFilters]
              return value !== undefined && value !== null && value !== '' && 
                     !(Array.isArray(value) && value.length === 0)
            }).length} active filter{Object.keys(localFilters).length === 1 ? '' : 's'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
