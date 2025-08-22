#!/usr/bin/env npx tsx

/**
 * Script to generate embeddings for all profiles
 * Usage: npx tsx src/scripts/generate-embeddings.ts
 */

import { generateAllProfileEmbeddings, generateProfileEmbedding } from '../lib/embeddings/embedding-service'

async function main() {
  const args = process.argv.slice(2)
  const profileId = args.find(arg => arg.startsWith('--profile='))?.split('=')[1]
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '5')
  
  console.log('🚀 Starting embedding generation...')
  console.log('⚠️  Make sure you have:')
  console.log('   - OPENAI_API_KEY set in your environment')
  console.log('   - pgvector extension enabled in Supabase')
  console.log('   - Ran the setup-vector-embeddings.sql script')
  console.log('')
  
  try {
    if (profileId) {
      console.log(`Generating embedding for specific profile: ${profileId}`)
      await generateProfileEmbedding(profileId)
      console.log('✅ Embedding generated successfully!')
    } else {
      console.log(`Generating embeddings for all profiles (batch size: ${batchSize})`)
      console.log('This may take several minutes...')
      await generateAllProfileEmbeddings(batchSize)
      console.log('✅ All embeddings generated successfully!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { main }
