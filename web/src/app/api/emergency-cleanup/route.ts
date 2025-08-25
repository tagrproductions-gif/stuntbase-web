import { NextRequest, NextResponse } from 'next/server'

/**
 * 🚨 EMERGENCY MEMORY CLEANUP ENDPOINT
 * Forces aggressive garbage collection and memory cleanup
 */
export async function POST(request: NextRequest) {
  console.log('🚨 EMERGENCY: Memory cleanup requested')
  
  const memoryBefore = process.memoryUsage()
  console.log('📊 Memory BEFORE cleanup:', {
    rss: Math.round(memoryBefore.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memoryBefore.heapUsed / 1024 / 1024) + 'MB', 
    external: Math.round(memoryBefore.external / 1024 / 1024) + 'MB',
    arrayBuffers: Math.round(memoryBefore.arrayBuffers / 1024 / 1024) + 'MB'
  })
  
  try {
    // Force multiple aggressive garbage collections
    if (global.gc) {
      console.log('🗑️ Forcing garbage collection...')
      global.gc()
      await new Promise(resolve => setTimeout(resolve, 100))
      global.gc()
      await new Promise(resolve => setTimeout(resolve, 100))
      global.gc()
      await new Promise(resolve => setTimeout(resolve, 500))
      global.gc()
      console.log('🗑️ Completed 4 garbage collection cycles')
    } else {
      console.log('⚠️ Garbage collection not available (run with --expose-gc)')
    }
    
    // Clear any global caches that might exist
    try {
      // Clear require cache for non-core modules
      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules') && !key.includes('next')) {
          delete require.cache[key]
        }
      })
      console.log('🧹 Cleared require cache')
    } catch (cacheError) {
      console.warn('⚠️ Cache cleanup warning:', cacheError)
    }
    
    // Give time for cleanup to take effect
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const memoryAfter = process.memoryUsage()
    console.log('📊 Memory AFTER cleanup:', {
      rss: Math.round(memoryAfter.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryAfter.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(memoryAfter.external / 1024 / 1024) + 'MB', 
      arrayBuffers: Math.round(memoryAfter.arrayBuffers / 1024 / 1024) + 'MB'
    })
    
    const rssSaved = Math.round((memoryBefore.rss - memoryAfter.rss) / 1024 / 1024)
    const arrayBuffersSaved = Math.round((memoryBefore.arrayBuffers - memoryAfter.arrayBuffers) / 1024 / 1024)
    
    return NextResponse.json({
      success: true,
      message: 'Emergency cleanup completed',
      savings: {
        rss: rssSaved + 'MB',
        arrayBuffers: arrayBuffersSaved + 'MB'
      },
      before: {
        rss: Math.round(memoryBefore.rss / 1024 / 1024),
        arrayBuffers: Math.round(memoryBefore.arrayBuffers / 1024 / 1024)
      },
      after: {
        rss: Math.round(memoryAfter.rss / 1024 / 1024),
        arrayBuffers: Math.round(memoryAfter.arrayBuffers / 1024 / 1024)
      }
    })
    
  } catch (error) {
    console.error('🚨 Emergency cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown cleanup error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Emergency cleanup endpoint. Use POST to trigger cleanup.',
    usage: 'POST /api/emergency-cleanup'
  })
}
