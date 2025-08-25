import { createClient } from '@/lib/supabase/client'

/**
 * 🚀 MEMORY OPTIMIZED: Upload resume via API endpoint with server-side text extraction
 * This prevents loading pdf-parse in the browser and handles extraction server-side
 */
export async function uploadResume(file: File, userId: string) {
  try {
    console.log('📄 Uploading resume via API...')
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload/resume', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }
    
    const result = await response.json()
    console.log('📄 Resume upload successful:', result)
    
    return { 
      url: result.url, 
      error: null,
      fileName: result.fileName,
      filePath: result.filePath,
      fileSize: result.fileSize,
      extractedText: result.extractedText
    }
  } catch (error) {
    console.error('Resume upload error:', error)
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Failed to upload resume', 
      extractedText: null 
    }
  }
}

/**
 * Delete a resume file from Supabase Storage
 */
export async function deleteResume(filePath: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from('resumes')
      .remove([filePath])

    if (error) {
      console.error('Resume delete error:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error('Resume delete error:', error)
    return { error: 'Failed to delete resume' }
  }
}


