const { createClient } = require('@supabase/supabase-js')
const pdfParse = require('pdf-parse')
const https = require('https')
const http = require('http')

// Supabase config - replace with your actual values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL.includes('YOUR_')) {
  console.error('❌ Please set your Supabase environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  console.error('\n   Or edit this file directly with your values')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function downloadPDF(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }
      
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
      response.on('error', reject)
    }).on('error', reject)
  })
}

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer)
    return data.text.trim()
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`)
  }
}

async function migrateResume(profileId, profileName, resumeUrl) {
  console.log(`\n🔄 Processing: ${profileName}`)
  console.log(`📄 Resume URL: ${resumeUrl}`)
  
  try {
    // Download PDF
    console.log('📥 Downloading PDF...')
    const pdfBuffer = await downloadPDF(resumeUrl)
    console.log(`📄 Downloaded ${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`)
    
    // Extract text
    console.log('📝 Extracting text...')
    const extractedText = await extractTextFromPDF(pdfBuffer)
    console.log(`📝 Extracted ${extractedText.length} characters`)
    
    if (extractedText.length < 50) {
      throw new Error('PDF text too short - may be image-based or corrupted')
    }
    
    // Update database
    console.log('💾 Saving to database...')
    const { error } = await supabase
      .from('profiles')
      .update({ 
        resume_text: extractedText,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
    
    if (error) {
      throw new Error(`Database update failed: ${error.message}`)
    }
    
    console.log(`✅ Successfully migrated ${profileName}`)
    return true
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${profileName}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Resume Migration Tool')
  console.log('========================')
  
  try {
    // Get profiles that need migration
    console.log('📋 Finding profiles that need migration...')
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, resume_url, resume_text')
      .not('resume_url', 'is', null)
      .is('resume_text', null)
      .order('created_at', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`)
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('✅ All resumes already migrated! No work needed.')
      return
    }
    
    console.log(`📊 Found ${profiles.length} profiles that need migration:`)
    profiles.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.full_name} (${p.id})`)
    })
    
    console.log('\n🔄 Starting migration...')
    
    let successCount = 0
    let failCount = 0
    
    for (const profile of profiles) {
      const success = await migrateResume(profile.id, profile.full_name, profile.resume_url)
      if (success) {
        successCount++
      } else {
        failCount++
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n📊 MIGRATION COMPLETE!')
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📝 Total: ${profiles.length}`)
    
    if (failCount > 0) {
      console.log('\n⚠️ Some resumes failed. Common reasons:')
      console.log('  - PDF is image-based (no extractable text)')
      console.log('  - PDF is corrupted or password-protected')
      console.log('  - Network issues downloading the file')
      console.log('\nYou can run this script again to retry failed items.')
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    process.exit(1)
  }
}

main().then(() => {
  console.log('\n🎉 Migration script completed!')
  process.exit(0)
}).catch(error => {
  console.error('\n💥 Script failed:', error)
  process.exit(1)
})
