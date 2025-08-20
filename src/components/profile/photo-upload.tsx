'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react'
import Image from 'next/image'
import { compressImage } from '@/lib/file-compression'

interface PhotoData {
  file: File
  caption: string
  preview: string
}

interface PhotoUploadProps {
  photos: PhotoData[]
  onPhotosChange: (photos: PhotoData[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newPhotos: PhotoData[] = []
    const remainingSlots = maxPhotos - photos.length

    for (const file of Array.from(files).slice(0, remainingSlots)) {
      if (file.type.startsWith('image/')) {
        try {
          // Compress the image
          const compressedFile = await compressImage(file)
          const preview = URL.createObjectURL(compressedFile)
          newPhotos.push({
            file: compressedFile,
            caption: '',
            preview
          })
        } catch (error) {
          console.error('Error compressing image:', error)
          // If compression fails, use original file
          const preview = URL.createObjectURL(file)
          newPhotos.push({
            file,
            caption: '',
            preview
          })
        }
      }
    }

    onPhotosChange([...photos, ...newPhotos])
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

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const updateCaption = (index: number, caption: string) => {
    const newPhotos = photos.map((photo, i) => 
      i === index ? { ...photo, caption } : photo
    )
    onPhotosChange(newPhotos)
  }

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [moved] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, moved)
    onPhotosChange(newPhotos)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Photos
          <span className="text-sm font-normal text-gray-500">
            {photos.length}/{maxPhotos}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {photos.length < maxPhotos && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop photos here, or{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB • {maxPhotos - photos.length} slots remaining
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <Label>Uploaded Photos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <Input
                      placeholder="Add a caption (optional)"
                      value={photo.caption}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {(photo.file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => movePhoto(index, index - 1)}
                          >
                            ←
                          </Button>
                        )}
                        {index < photos.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => movePhoto(index, index + 1)}
                          >
                            →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {photos.length > 0 && "The first photo will be your primary profile photo. Use the arrows to reorder."}
            </p>
          </div>
        )}

        {photos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="mx-auto h-8 w-8 mb-2" />
            <p>No photos uploaded yet</p>
            <p className="text-sm">Add photos to showcase your work and appearance</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
