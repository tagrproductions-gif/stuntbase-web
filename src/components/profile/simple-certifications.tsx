'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Award } from 'lucide-react'

// Simple certification type - just name
export interface SimpleCertification {
  name: string
}

interface SimpleCertificationsProps {
  certifications: SimpleCertification[]
  onCertificationsChange: (certifications: SimpleCertification[]) => void
  maxCertifications?: number
}

// Helper function to normalize text (capitalize words)
const normalizeText = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function SimpleCertifications({ certifications, onCertificationsChange, maxCertifications = 10 }: SimpleCertificationsProps) {
  const [certificationName, setCertificationName] = useState('')

  const addCertification = () => {
    if (!certificationName.trim()) return
    if (certifications.length >= maxCertifications) return
    
    const normalizedName = normalizeText(certificationName.trim())
    
    // Check if certification already exists
    if (certifications.some(cert => cert.name.toLowerCase() === normalizedName.toLowerCase())) {
      return
    }

    const newCertification: SimpleCertification = {
      name: normalizedName
    }

    onCertificationsChange([...certifications, newCertification])
    setCertificationName('')
  }

  const removeCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index)
    onCertificationsChange(updatedCertifications)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCertification()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certifications ({certifications.length}/{maxCertifications})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new certification */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter certification (e.g. CPR Certified, Stunt Safety, etc.)"
              value={certificationName}
              onChange={(e) => setCertificationName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button 
            type="button"
            onClick={addCertification} 
            disabled={!certificationName.trim() || certifications.length >= maxCertifications}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected certifications */}
        {certifications.length > 0 && (
          <div className="space-y-2">
            <Label>Your Certifications</Label>
            <div className="flex flex-wrap gap-2">
              {certifications.map((certification, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                >
                  <span>{certification.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeCertification(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {certifications.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add your certifications and training. No dates or numbers required.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
