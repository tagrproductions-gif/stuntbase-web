import { createClient } from '@/lib/supabase/client'

/**
 * Upload a resume file to Supabase Storage
 */
export async function uploadResume(file: File, userId: string) {
  const supabase = createClient()
  
  // Create a unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/resume_${Date.now()}.${fileExt}`
  
  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Resume upload error:', error)
      return { url: null, error: error.message }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    return { 
      url: urlData.publicUrl, 
      error: null,
      fileName: file.name,
      filePath: fileName,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Resume upload error:', error)
    return { url: null, error: 'Failed to upload resume' }
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


