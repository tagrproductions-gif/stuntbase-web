#!/usr/bin/env tsx
/**
 * 🔄 BACKWARDS MIGRATION: Extract text from existing resume PDFs
 * 
 * This script processes all existing profiles that have resume_url but no resume_text,
 * downloads their PDFs, extracts the text, and stores it in the database.
 * 
 * Usage: npm run migrate-resumes
 */

import { createClient } from '@supabase/supabase-js'
import pdfParse from 'pdf-parse'

// Configuration
const BATCH_SIZE = 5 // Process 5 resumes at a time to avoid overwhelming the system
const MAX_RETRIES = 3
const TIMEOUT_MS = 30000 // 30 seconds per PDF

interface ProfileWithResume {
  id: string
  full_name: string
  resume_url: string
  resume_text: string | null
}

async function extractPDFTextFromURL(url: string): Promise<string> {
  console.log(`📄 Downloading PDF from: ${url}`)
  
  try {
    // Download PDF
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'StuntGhost-Resume-Migration/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log(`📄 PDF downloaded, size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`)
    
    // Extract text
    const pdfData = await pdfParse(buffer)
    const extractedText = pdfData.text.trim()
    
    console.log(`📄 Extracted ${extractedText.length} characters`)
    
    if (extractedText.length < 50) {
      throw new Error('PDF text too short - may be corrupted or image-based')
    }
    
    return extractedText
    
  } catch (error) {
    console.error(`📄 PDF extraction failed:`, error)
    throw error
  }
}

async function migrateProfileResume(profile: ProfileWithResume, supabase: any): Promise<boolean> {
  console.log(`\n🔄 Processing ${profile.full_name} (${profile.id})`)
  
  try {
    // Extract text from PDF
    const extractedText = await extractPDFTextFromURL(profile.resume_url)
    
    // Update database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        resume_text: extractedText,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
    
    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`)
    }
    
    console.log(`✅ Successfully migrated resume for ${profile.full_name}`)
    return true
    
  } catch (error) {
    console.error(`❌ Failed to migrate resume for ${profile.full_name}:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting backwards migration of existing resumes...')
  
  // Create Supabase client using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // First, ensure the resume_text column exists
    console.log('📋 Checking database schema...')
    
    // Get all profiles with resumes but no extracted text
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, resume_url, resume_text')
      .not('resume_url', 'is', null)
      .is('resume_text', null)
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      throw new Error(`Failed to fetch profiles: ${fetchError.message}`)
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('✅ No resumes need migration. All existing resumes already have extracted text!')
      return
    }
    
    console.log(`📊 Found ${profiles.length} resumes that need text extraction`)
    
    // Process in batches
    let successCount = 0
    let failureCount = 0
    
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE)
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(profiles.length / BATCH_SIZE)}`)
      
      // Process batch with retries
      const results = await Promise.allSettled(
        batch.map(profile => migrateProfileResume(profile, supabase))
      )
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          successCount++
        } else {
          failureCount++
          console.error(`❌ Batch item ${i + index + 1} failed:`, 
            result.status === 'rejected' ? result.reason : 'Unknown error')
        }
      })
      
      // Brief pause between batches to avoid overwhelming the system
      if (i + BATCH_SIZE < profiles.length) {
        console.log('⏳ Pausing 2 seconds between batches...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Summary
    console.log('\n📊 MIGRATION SUMMARY:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${failureCount}`)
    console.log(`📝 Total: ${profiles.length}`)
    
    if (failureCount > 0) {
      console.log('\n⚠️ Some resumes failed to migrate. You can run this script again to retry failed items.')
      console.log('Common failure reasons:')
      console.log('- PDF is corrupted or image-based (no extractable text)')
      console.log('- PDF is hosted on a server that blocks downloads')
      console.log('- Network timeout or connection issues')
    }
    
    if (successCount > 0) {
      console.log('\n🎉 Migration completed! AI agents can now analyze existing resumes.')
    }
    
  } catch (error) {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error)
      process.exit(1)
    })
}

export { main as migrateExistingResumes }
