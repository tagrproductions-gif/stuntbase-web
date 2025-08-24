'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, User } from 'lucide-react'
import Image from 'next/image'
import { compressImage } from '@/lib/file-compression'

interface PhotoData {
  file: File
  preview: string
}

interface CoordinatorPhotoUploadProps {
  photo: PhotoData | null
  onPhotoChange: (photo: PhotoData | null) => void
}

export function CoordinatorPhotoUpload({ photo, onPhotoChange }: CoordinatorPhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (file.type.startsWith('image/')) {
      try {
        // Compress the image
        const compressedFile = await compressImage(file)
        const preview = URL.createObjectURL(compressedFile)
        onPhotoChange({
          file: compressedFile,
          preview
        })
      } catch (error) {
        console.error('Error compressing image:', error)
        // If compression fails, use original file
        const preview = URL.createObjectURL(file)
        onPhotoChange({
          file,
          preview
        })
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removePhoto = () => {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview)
    }
    onPhotoChange(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Photo *
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a professional profile photo. This will be displayed on your coordinator dashboard and project listings.
        </p>
        
        {!photo ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Upload your profile photo
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop a photo here, or{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB • Professional headshot recommended
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Label>Profile Photo</Label>
            <div className="relative group border rounded-lg overflow-hidden max-w-sm mx-auto">
              <div className="aspect-square relative">
                <Image
                  src={photo.preview}
                  alt="Profile photo"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">
                    {photo.file.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {(photo.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
