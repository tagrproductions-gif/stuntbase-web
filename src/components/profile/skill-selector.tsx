'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { getAllSkills } from '@/lib/supabase/profiles'
import { Skill } from '@/types/database'
import { SkillData } from '@/lib/validations/profile'

interface SkillSelectorProps {
  selectedSkills: SkillData[]
  onSkillsChange: (skills: SkillData[]) => void
  maxSkills?: number
}

export function SkillSelector({ selectedSkills, onSkillsChange, maxSkills = 20 }: SkillSelectorProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [proficiencyLevel, setProficiencyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    const { data, error } = await getAllSkills()
    if (data && !error) {
      setAvailableSkills(data)
    }
    setLoading(false)
  }

  const filteredSkills = availableSkills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.some(selected => selected.skill_id === skill.id)
  )

  const addSkill = () => {
    if (!selectedSkillId) return

    const newSkill: SkillData = {
      skill_id: selectedSkillId,
      proficiency_level: proficiencyLevel
    }

    onSkillsChange([...selectedSkills, newSkill])
    setSelectedSkillId('')
    setSearchTerm('')
  }

  const removeSkill = (skillId: string) => {
    onSkillsChange(selectedSkills.filter(skill => skill.skill_id !== skillId))
  }

  const getSkillName = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId)
    return skill?.name || 'Unknown Skill'
  }

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200'
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Skills & Specialties
          <span className="text-sm font-normal text-gray-500">
            {selectedSkills.length}/{maxSkills}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Skill Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="skill-search">Search Skills</Label>
            <Input
              id="skill-search"
              placeholder="Type to search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && filteredSkills.length > 0 && (
              <div className="border rounded-md bg-white shadow-lg max-h-32 overflow-y-auto">
                {filteredSkills.slice(0, 5).map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setSelectedSkillId(skill.id)
                      setSearchTerm(skill.name)
                    }}
                  >
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-xs text-gray-500">{skill.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level</Label>
            <Select
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value as any)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              type="button"
              onClick={addSkill}
              disabled={!selectedSkillId || selectedSkills.length >= maxSkills}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </div>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Skills</Label>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill, index) => (
                <Badge
                  key={`${skill.skill_id}-${index}`}
                  variant="outline"
                  className={`${getProficiencyColor(skill.proficiency_level)} flex items-center gap-1`}
                >
                  <span className="font-medium">{getSkillName(skill.skill_id)}</span>
                  <span className="text-xs">({skill.proficiency_level})</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.skill_id)}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedSkills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No skills selected yet</p>
            <p className="text-sm">Search and add your stunt skills above</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
