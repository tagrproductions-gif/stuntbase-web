import { NextRequest, NextResponse } from 'next/server'
import { generateAllProfileEmbeddings, generateProfileEmbedding } from '@/lib/embeddings/embedding-service'

export async function POST(request: NextRequest) {
  try {
    const { profileId, batchSize } = await request.json()
    
    if (profileId) {
      // Generate embedding for specific profile
      await generateProfileEmbedding(profileId)
      return NextResponse.json({ 
        success: true, 
        message: `Embedding generated for profile ${profileId}` 
      })
    } else {
      // Generate embeddings for all profiles
      await generateAllProfileEmbeddings(batchSize || 10)
      return NextResponse.json({ 
        success: true, 
        message: 'All embeddings generated successfully' 
      })
    }
    
  } catch (error: any) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate embeddings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profileId')
  
  if (profileId) {
    try {
      await generateProfileEmbedding(profileId)
      return NextResponse.json({ 
        success: true, 
        message: `Embedding generated for profile ${profileId}` 
      })
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  } else {
    return NextResponse.json(
      { error: 'Profile ID required' },
      { status: 400 }
    )
  }
}
