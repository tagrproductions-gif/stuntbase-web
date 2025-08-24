'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload } from 'lucide-react'
import { updateCoordinatorPhotoAction } from '@/app/dashboard/coordinator-photo-actions'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/file-compression'

interface CoordinatorPhotoChangeProps {
  coordinatorId: string
  hasExistingPhoto?: boolean
}

export function CoordinatorPhotoChange({ coordinatorId, hasExistingPhoto = false }: CoordinatorPhotoChangeProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Compress the image
      const compressedFile = await compressImage(file)
      
      // Create form data
      const formData = new FormData()
      formData.append('profile_photo', compressedFile)

      // Upload the photo
      const result = await updateCoordinatorPhotoAction(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        // Refresh the page to show the new photo
        router.refresh()
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      setError('Failed to upload photo. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            {hasExistingPhoto ? 'Change Photo' : 'Add Photo'}
          </>
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={isUploading}
      />
      
      {error && (
        <p className="text-xs text-destructive mt-2 text-center">
          {error}
        </p>
      )}
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Upload a professional headshot
      </p>
    </div>
  )
}
