'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Calendar } from 'lucide-react'
import { getAllCertifications } from '@/lib/supabase/profiles'
import { Certification } from '@/types/database'
import { CertificationData } from '@/lib/validations/profile'

interface CertificationSelectorProps {
  selectedCertifications: CertificationData[]
  onCertificationsChange: (certifications: CertificationData[]) => void
  maxCertifications?: number
}

export function CertificationSelector({ 
  selectedCertifications, 
  onCertificationsChange, 
  maxCertifications = 10 
}: CertificationSelectorProps) {
  const [availableCertifications, setAvailableCertifications] = useState<Certification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCertificationId, setSelectedCertificationId] = useState('')
  const [dateObtained, setDateObtained] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [certificationNumber, setCertificationNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    const { data, error } = await getAllCertifications()
    if (data && !error) {
      setAvailableCertifications(data)
    }
    setLoading(false)
  }

  const filteredCertifications = availableCertifications.filter(cert => 
    (cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cert.issuing_organization.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !selectedCertifications.some(selected => selected.certification_id === cert.id)
  )

  const addCertification = () => {
    if (!selectedCertificationId) return

    const newCertification: CertificationData = {
      certification_id: selectedCertificationId,
      date_obtained: dateObtained || '',
      expiry_date: expiryDate || '',
      certification_number: certificationNumber || ''
    }

    onCertificationsChange([...selectedCertifications, newCertification])
    setSelectedCertificationId('')
    setSearchTerm('')
    setDateObtained('')
    setExpiryDate('')
    setCertificationNumber('')
  }

  const removeCertification = (certificationId: string) => {
    onCertificationsChange(selectedCertifications.filter(cert => cert.certification_id !== certificationId))
  }

  const getCertificationInfo = (certificationId: string) => {
    const cert = availableCertifications.find(c => c.id === certificationId)
    return cert ? { name: cert.name, organization: cert.issuing_organization } : { name: 'Unknown', organization: 'Unknown' }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Certifications & Training
          <span className="text-sm font-normal text-gray-500">
            {selectedCertifications.length}/{maxCertifications}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Certification Section */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cert-search">Search Certifications</Label>
            <Input
              id="cert-search"
              placeholder="Type to search certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && filteredCertifications.length > 0 && (
              <div className="border rounded-md bg-white shadow-lg max-h-32 overflow-y-auto">
                {filteredCertifications.slice(0, 5).map(cert => (
                  <button
                    key={cert.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setSelectedCertificationId(cert.id)
                      setSearchTerm(`${cert.name} - ${cert.issuing_organization}`)
                    }}
                  >
                    <div className="font-medium">{cert.name}</div>
                    <div className="text-xs text-gray-500">{cert.issuing_organization}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date-obtained">Date Obtained</Label>
              <Input
                id="date-obtained"
                type="date"
                value={dateObtained}
                onChange={(e) => setDateObtained(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-number">Certification Number</Label>
              <Input
                id="cert-number"
                placeholder="Optional"
                value={certificationNumber}
                onChange={(e) => setCertificationNumber(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addCertification}
            disabled={!selectedCertificationId || selectedCertifications.length >= maxCertifications}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </div>

        {/* Selected Certifications */}
        {selectedCertifications.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Certifications</Label>
            <div className="space-y-2">
              {selectedCertifications.map((cert, index) => {
                const certInfo = getCertificationInfo(cert.certification_id)
                return (
                  <div
                    key={`${cert.certification_id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{certInfo.name}</div>
                      <div className="text-xs text-gray-600">{certInfo.organization}</div>
                      {(cert.date_obtained || cert.expiry_date) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {cert.date_obtained && <span>Obtained: {cert.date_obtained}</span>}
                          {cert.expiry_date && <span>Expires: {cert.expiry_date}</span>}
                        </div>
                      )}
                      {cert.certification_number && (
                        <div className="text-xs text-gray-500 mt-1">
                          #{cert.certification_number}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert.certification_id)}
                      className="ml-2 p-1 hover:bg-red-100 rounded-full text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedCertifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No certifications selected yet</p>
            <p className="text-sm">Search and add your certifications above</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
