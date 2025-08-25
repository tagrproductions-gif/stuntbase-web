import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const memoryInMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024)
    }

    // Calculate memory usage percentage (assuming 512MB limit)
    const memoryLimit = 512
    const memoryUsagePercent = Math.round((memoryInMB.rss / memoryLimit) * 100)
    
    // Determine status based on memory usage
    let status = 'healthy'
    if (memoryUsagePercent > 90) status = 'critical'
    else if (memoryUsagePercent > 75) status = 'warning'
    else if (memoryUsagePercent > 60) status = 'caution'

    // Enhanced health check with memory monitoring
    const health = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        ...memoryInMB,
        usagePercent: memoryUsagePercent,
        limit: memoryLimit,
        status: memoryUsagePercent > 75 ? '⚠️ HIGH' : memoryUsagePercent > 50 ? '⚡ MEDIUM' : '✅ GOOD'
      },
      platform: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
