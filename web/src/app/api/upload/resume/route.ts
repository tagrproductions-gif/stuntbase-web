import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/resume_${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Resume upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // 2. Get the public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    // 3. Extract PDF text server-side
    let extractedText = null
    
    try {
      console.log('📄 Extracting PDF text on server...')
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text.trim()
      
      console.log(`📄 Successfully extracted ${extractedText?.length || 0} characters`)
      
      if (extractedText && extractedText.length < 50) {
        console.warn('📄 PDF text very short - may be image-based')
      }
    } catch (error) {
      console.error('📄 PDF text extraction failed:', error)
      // Continue with upload even if text extraction fails
      extractedText = null
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      filePath: fileName,
      fileSize: file.size,
      extractedText
    })

  } catch (error) {
    console.error('Resume upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
