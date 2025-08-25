import OpenAI from 'openai'
import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
// 🚀 MEMORY OPTIMIZED: Use centralized client instead of creating redundant instances
// Note: This will need path adjustment for shared lib usage

// Define basic types for the embedding service
type Database = {
  public: {
    Tables: {
      profiles: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// 🚀 MEMORY OPTIMIZED: Simplified client creation for shared usage
function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore Server Component cookie errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore Server Component cookie errors
          }
        },
      },
    }
  )
}

function createClientBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Alternative: Use Hugging Face for free embeddings
// import { HfInference } from '@huggingface/inference'
// const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export interface EmbeddingResult {
  embedding: number[]
  contentHash: string
  generatedAt: string
}

/**
 * Generate embedding for text using OpenAI's text-embedding-3-small model
 * Cost: ~$0.02 per 1M tokens (very cheap!)
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    // Option 1: OpenAI (paid but high quality)
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // 1536 dimensions, $0.02/1M tokens
      input: text,
      encoding_format: "float",
    })

    const embedding = response.data[0].embedding

    // Option 2: Hugging Face (free alternative)
    // const response = await hf.featureExtraction({
    //   model: 'sentence-transformers/all-MiniLM-L6-v2',
    //   inputs: text,
    // })
    // const embedding = Array.isArray(response) ? response : []

    // Create content hash for caching
    const contentHash = await createContentHash(text)

    return {
      embedding,
      contentHash,
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate embedding content for a profile (bio + skills + attributes)
 */
export async function getProfileEmbeddingContent(profileId: string): Promise<string> {
  // Use browser client for scripts (when no request context)
  const supabase = typeof window !== 'undefined' ? createClientBrowser() : 
                  process.env.NODE_ENV === 'development' ? createClientBrowser() : createClient()
  
  const { data, error } = await supabase
    .rpc('get_profile_embedding_content', { profile_id: profileId })
  
  if (error) {
    throw new Error(`Failed to get profile content: ${error.message}`)
  }
  
  return data || ''
}

/**
 * Update profile embedding in database
 */
export async function updateProfileEmbedding(
  profileId: string,
  embeddingResult: EmbeddingResult
): Promise<void> {
  // Use browser client for scripts (when no request context)
  const supabase = typeof window !== 'undefined' ? createClientBrowser() : 
                  process.env.NODE_ENV === 'development' ? createClientBrowser() : createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({
      content_embedding: `[${embeddingResult.embedding.join(',')}]`,
      embedding_content_hash: embeddingResult.contentHash,
      embedding_generated_at: embeddingResult.generatedAt
    })
    .eq('id', profileId)
  
  if (error) {
    throw new Error(`Failed to update embedding: ${error.message}`)
  }
}

/**
 * Generate and store embedding for a single profile
 */
export async function generateProfileEmbedding(profileId: string): Promise<void> {
  try {
    // Get profile content
    const content = await getProfileEmbeddingContent(profileId)
    
    if (!content.trim()) {
      console.log(`Skipping profile ${profileId} - no content to embed`)
      return
    }
    
    // Check if embedding already exists and is current
    const supabase = typeof window !== 'undefined' ? createClientBrowser() : 
                    process.env.NODE_ENV === 'development' ? createClientBrowser() : createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('embedding_content_hash, updated_at')
      .eq('id', profileId)
      .single()
    
    const contentHash = await createContentHash(content)
    
    if (profile?.embedding_content_hash === contentHash) {
      console.log(`Embedding for profile ${profileId} is up to date`)
      return
    }
    
    // Generate new embedding
    console.log(`Generating embedding for profile ${profileId}`)
    const embeddingResult = await generateEmbedding(content)
    
    // Store in database
    await updateProfileEmbedding(profileId, embeddingResult)
    
    console.log(`Successfully updated embedding for profile ${profileId}`)
    
  } catch (error) {
    console.error(`Error generating embedding for profile ${profileId}:`, error)
    throw error
  }
}

/**
 * Batch generate embeddings for multiple profiles
 */
export async function generateAllProfileEmbeddings(batchSize: number = 10): Promise<void> {
  const supabase = typeof window !== 'undefined' ? createClientBrowser() : 
                  process.env.NODE_ENV === 'development' ? createClientBrowser() : createClient()
  
  // 🚨 MEMORY CRITICAL: Ultra-conservative limits to prevent memory crisis
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('is_public', true)
    .limit(5)  // 🚨 EMERGENCY: Reduced to 5 due to critical memory leaks
  
  if (error) {
    throw new Error(`Failed to fetch profiles: ${error.message}`)
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('No profiles found')
    return
  }
  
  console.log(`Starting embedding generation for ${profiles.length} profiles`)
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize)
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profiles.length / batchSize)}`)
    
    // Process batch in parallel (with rate limiting)
    const promises = batch.map(async (profile, index) => {
      // Add small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, index * 100))
      return generateProfileEmbedding(profile.id)
    })
    
    try {
      await Promise.all(promises)
      console.log(`Completed batch ${Math.floor(i / batchSize) + 1}`)
    } catch (error) {
      console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error)
      // Continue with next batch
    }
    
    // Pause between batches
    if (i + batchSize < profiles.length) {
      console.log('Pausing 2 seconds between batches...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('Embedding generation complete!')
}

/**
 * Search profiles using semantic similarity
 */
export async function searchProfilesBySimilarity(
  queryText: string,
  threshold: number = 0.8,
  maxResults: number = 50
): Promise<any[]> {
  try {
    // 🚨 MEMORY CRITICAL: Limit semantic search results to prevent memory overload
    const memoryOptimizedMaxResults = Math.min(maxResults, 15) // Cap at 15 for memory safety
    
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(queryText)
    
    // Search using the database function
    const supabase = typeof window !== 'undefined' ? createClientBrowser() : 
                    process.env.NODE_ENV === 'development' ? createClientBrowser() : createClient()
    const { data, error } = await supabase
      .rpc('search_profiles_by_embedding', {
        query_embedding: `[${queryEmbedding.embedding.join(',')}]`,
        similarity_threshold: threshold,
        max_results: memoryOptimizedMaxResults
      })
    
    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }
    
    // 🗑️ MEMORY CLEANUP: Clear embedding data immediately after use
    try {
      queryEmbedding.embedding.length = 0
    } catch (cleanupError) {
      console.warn('⚠️ Embedding cleanup warning:', cleanupError)
    }
    
    return data || []
    
  } catch (error) {
    console.error('Error in semantic search:', error)
    throw error
  }
}

/**
 * Helper function to create content hash
 */
async function createContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
