'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'

// Simple skill type - just name and proficiency
export interface SimpleSkill {
  name: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface SimpleSkillsProps {
  skills: SimpleSkill[]
  onSkillsChange: (skills: SimpleSkill[]) => void
  maxSkills?: number
}

// Helper function to normalize text (capitalize words)
const normalizeText = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function SimpleSkills({ skills, onSkillsChange, maxSkills = 20 }: SimpleSkillsProps) {
  const [skillName, setSkillName] = useState('')
  const [proficiencyLevel, setProficiencyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate')

  const addSkill = () => {
    if (!skillName.trim()) return
    if (skills.length >= maxSkills) return
    
    const normalizedName = normalizeText(skillName.trim())
    
    // Check if skill already exists
    if (skills.some(skill => skill.name.toLowerCase() === normalizedName.toLowerCase())) {
      return
    }

    const newSkill: SimpleSkill = {
      name: normalizedName,
      proficiency_level: proficiencyLevel
    }

    onSkillsChange([...skills, newSkill])
    setSkillName('')
    setProficiencyLevel('intermediate')
  }

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    onSkillsChange(updatedSkills)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Skills ({skills.length}/{maxSkills})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new skill */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter skill (e.g. Martial Arts, Driving, etc.)"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <select
            className="px-3 py-2 border rounded-md bg-input text-foreground"
            value={proficiencyLevel}
            onChange={(e) => setProficiencyLevel(e.target.value as any)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <Button 
            type="button"
            onClick={addSkill} 
            disabled={!skillName.trim() || skills.length >= maxSkills}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <Label>Your Skills</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`${getProficiencyColor(skill.proficiency_level)} flex items-center gap-1`}
                >
                  <span>{skill.name}</span>
                  <span className="text-xs opacity-75">({skill.proficiency_level})</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add your skills and proficiency levels. These will be displayed on your profile.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
