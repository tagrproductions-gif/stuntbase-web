'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Star, GripVertical, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { compressImage } from '@/lib/file-compression'

interface PhotoData {
  file: File
  caption: string
  preview: string
}

interface ExistingPhoto {
  id: number
  profile_id: string
  file_path: string
  file_name: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

interface EnhancedPhotoUploadProps {
  photos: PhotoData[]
  existingPhotos: ExistingPhoto[]
  onPhotosChange: (photos: PhotoData[]) => void
  onExistingPhotosChange: (photos: ExistingPhoto[]) => void
  onDeleteExistingPhoto: (photoId: number) => void
  maxPhotos?: number
}

export function EnhancedPhotoUpload({ 
  photos, 
  existingPhotos,
  onPhotosChange, 
  onExistingPhotosChange,
  onDeleteExistingPhoto,
  maxPhotos = 5 
}: EnhancedPhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [draggedExistingIndex, setDraggedExistingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalPhotos = existingPhotos.length + photos.length

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newPhotos: PhotoData[] = []
    const remainingSlots = maxPhotos - totalPhotos

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

  // Caption functionality removed - not supported in database schema

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos]
    const [moved] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, moved)
    onPhotosChange(newPhotos)
  }

  const moveExistingPhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...existingPhotos]
    const [moved] = newPhotos.splice(fromIndex, 1)
    newPhotos.splice(toIndex, 0, moved)
    
    // Update sort_order for all photos
    const reorderedPhotos = newPhotos.map((photo, index) => ({
      ...photo,
      sort_order: index + 1,
      is_primary: index === 0 // First photo becomes primary
    }))
    
    onExistingPhotosChange(reorderedPhotos)
  }

  const handleExistingDragStart = (e: React.DragEvent, index: number) => {
    setDraggedExistingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleExistingDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedExistingIndex !== null && draggedExistingIndex !== index) {
      moveExistingPhoto(draggedExistingIndex, index)
      setDraggedExistingIndex(index)
    }
  }

  const handleExistingDragEnd = () => {
    setDraggedExistingIndex(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Photos
          <span className="text-sm font-normal text-gray-500">
            {totalPhotos}/{maxPhotos}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div className="space-y-4">
            <Label>Current Photos (drag to reorder)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingPhotos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="relative group border rounded-lg overflow-hidden cursor-move"
                  draggable
                  onDragStart={(e) => handleExistingDragStart(e, index)}
                  onDragOver={(e) => handleExistingDragOver(e, index)}
                  onDragEnd={handleExistingDragEnd}
                >
                  <div className="aspect-video relative">
                    <Image
                      src={photo.file_path}
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
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="bg-gray-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteExistingPhoto(photo.id)}
                        className="bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Existing photo
                      </span>
                      <span className="text-xs text-gray-400">
                        {photo.file_name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Area */}
        {totalPhotos < maxPhotos && (
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
              PNG, JPG, GIF up to 10MB • {maxPhotos - totalPhotos} slots remaining
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

        {/* New Photos */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <Label>New Photos to Upload</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden border-blue-200">
                  <div className="aspect-video relative">
                    <Image
                      src={photo.preview}
                      alt={`New photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        New
                      </div>
                    </div>
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
          </div>
        )}

        {totalPhotos === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="mx-auto h-8 w-8 mb-2" />
            <p>No photos uploaded yet</p>
            <p className="text-sm">Add photos to showcase your work and appearance</p>
          </div>
        )}

        {existingPhotos.length > 0 && (
          <p className="text-xs text-gray-500">
            💡 Drag and drop existing photos to reorder them. The first photo will be your primary profile photo.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
