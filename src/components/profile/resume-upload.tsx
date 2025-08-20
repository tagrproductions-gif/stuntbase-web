'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, File, X, Download } from 'lucide-react'
import { validatePDF, formatFileSize } from '@/lib/file-compression'

interface ResumeUploadProps {
  currentResume?: {
    url: string
    filename: string
    size: number
    uploadedAt: string
  }
  onResumeChange: (file: File | null) => void
  onRemoveExisting?: () => void
}

export function ResumeUpload({ 
  currentResume, 
  onResumeChange, 
  onRemoveExisting 
}: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    console.log('📄 ResumeUpload - File selected:', file.name, file.size, file.type)
    setError(null)
    
    const validation = validatePDF(file)
    console.log('📄 ResumeUpload - Validation result:', validation)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    onResumeChange(file)
    console.log('📄 ResumeUpload - File set successfully')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removeFile = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setSelectedFile(null)
    setError(null)
    onResumeChange(null)
  }

  const removeExisting = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onRemoveExisting) {
      onRemoveExisting()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Resume Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Resume Display */}
        {currentResume && !selectedFile && (
          <div className="mb-4 p-4 border border-border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium text-foreground">{currentResume.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(currentResume.size)} • 
                    Uploaded {new Date(currentResume.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={currentResume.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={removeExisting}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Selected File Display */}
        {selectedFile && (
          <div className="mb-4 p-4 border border-border rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • Ready to upload
                  </p>
                </div>
              </div>
                          <Button type="button" size="sm" variant="ghost" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Upload Area */}
        {!selectedFile && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(false)
            }}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {currentResume ? 'Replace Resume' : 'Upload Resume'}
            </p>
            <p className="text-muted-foreground mb-4">
              Drag and drop your PDF resume here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum file size: 10MB • PDF format only
            </p>
            
            <div className="relative">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => document.getElementById('resume-file-input')?.click()}
              >
                Choose File
              </Button>
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• PDF format only</p>
          <p>• Maximum file size: 10MB</p>
          <p>• Your resume will be publicly accessible to profile visitors</p>
        </div>
      </CardContent>
    </Card>
  )
}
