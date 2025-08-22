// File compression utilities for photos and PDFs
import imageCompression from 'browser-image-compression'

// Photo compression options
const PHOTO_COMPRESSION_OPTIONS = {
  maxSizeMB: 2, // Max file size in MB
  maxWidthOrHeight: 1920, // Max dimension
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.8
}

// PDF compression is more complex and typically requires server-side processing
const MAX_PDF_SIZE_MB = 10 // 10MB limit for PDFs

/**
 * Compress an image file
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // Only compress if file is larger than 2MB
    if (file.size <= 2 * 1024 * 1024) {
      return file
    }

    console.log('Original image size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    
    const compressedFile = await imageCompression(file, PHOTO_COMPRESSION_OPTIONS)
    
    console.log('Compressed image size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
    
    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Validate and potentially compress PDF file
 */
export function validatePDF(file: File): { isValid: boolean; error?: string } {
  // Check if it's a PDF
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'File must be a PDF' }
  }

  // Check file size (10MB limit)
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > MAX_PDF_SIZE_MB) {
    return { 
      isValid: false, 
      error: `PDF file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_PDF_SIZE_MB}MB.` 
    }
  }

  return { isValid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate image file
 */
export function validateImage(file: File): { isValid: boolean; error?: string } {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' }
  }

  // Check file size (20MB limit before compression)
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > 20) {
    return { 
      isValid: false, 
      error: `Image file is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is 20MB.` 
    }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Image must be JPEG, PNG, or WebP format' 
    }
  }

  return { isValid: true }
}
