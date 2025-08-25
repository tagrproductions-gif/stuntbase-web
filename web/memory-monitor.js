#!/usr/bin/env node

/**
 * 🚀 MEMORY LEAK DIAGNOSTIC TOOL
 * Monitors Node.js memory usage and provides detailed breakdown
 */

function formatBytes(bytes) {
  return Math.round(bytes / 1024 / 1024 * 100) / 100 + ' MB'
}

function getDetailedMemoryInfo() {
  const usage = process.memoryUsage()
  const timestamp = new Date().toISOString()
  
  return {
    timestamp,
    rss: formatBytes(usage.rss), // Resident Set Size - total memory allocated
    heapTotal: formatBytes(usage.heapTotal), // Total heap allocated
    heapUsed: formatBytes(usage.heapUsed), // Heap actually used
    external: formatBytes(usage.external), // C++ objects bound to JS
    arrayBuffers: formatBytes(usage.arrayBuffers), // ArrayBuffers (file data)
    
    // Calculate derived metrics
    heapFree: formatBytes(usage.heapTotal - usage.heapUsed),
    heapUtilization: Math.round((usage.heapUsed / usage.heapTotal) * 100) + '%'
  }
}

function displayMemoryStatus() {
  const info = getDetailedMemoryInfo()
  
  console.log('\n' + '='.repeat(60))
  console.log('🧠 MEMORY DIAGNOSTIC REPORT')
  console.log('='.repeat(60))
  console.log(`📅 Time: ${info.timestamp}`)
  console.log(`📊 RSS (Total Memory): ${info.rss}`)
  console.log(`🏗️  Heap Total: ${info.heapTotal}`)
  console.log(`🔥 Heap Used: ${info.heapUsed} (${info.heapUtilization})`)
  console.log(`💚 Heap Free: ${info.heapFree}`)
  console.log(`🔗 External Objects: ${info.external}`)
  console.log(`📦 Array Buffers: ${info.arrayBuffers}`)
  
  // Memory leak indicators
  const rssNum = parseFloat(info.rss)
  const heapUsedNum = parseFloat(info.heapUsed)
  const arrayBuffersNum = parseFloat(info.arrayBuffers)
  
  console.log('\n🚨 MEMORY LEAK ANALYSIS:')
  
  if (rssNum > 400) {
    console.log('❌ CRITICAL: RSS > 400MB - Memory leak detected!')
  } else if (rssNum > 250) {
    console.log('⚠️  WARNING: RSS > 250MB - Monitor closely')
  } else {
    console.log('✅ GOOD: RSS < 250MB - Memory usage acceptable')
  }
  
  if (arrayBuffersNum > 50) {
    console.log('❌ CRITICAL: ArrayBuffers > 50MB - PDF/Image processing leak!')
  } else if (arrayBuffersNum > 20) {
    console.log('⚠️  WARNING: ArrayBuffers > 20MB - Monitor file processing')
  } else {
    console.log('✅ GOOD: ArrayBuffers < 20MB - File processing OK')
  }
  
  if (heapUsedNum > 200) {
    console.log('❌ CRITICAL: Heap > 200MB - Database/Object leak!')
  } else if (heapUsedNum > 100) {
    console.log('⚠️  WARNING: Heap > 100MB - Monitor object retention')
  } else {
    console.log('✅ GOOD: Heap < 100MB - Object management OK')
  }
  
  console.log('='.repeat(60))
}

// Enable garbage collection if available
if (global.gc) {
  console.log('🗑️  Garbage collection available - will force cleanup')
} else {
  console.log('⚠️  Run with --expose-gc flag to enable manual garbage collection')
}

// Display initial state
console.log('🚀 Starting memory monitoring...')
displayMemoryStatus()

// Monitor every 5 seconds
setInterval(() => {
  displayMemoryStatus()
  
  // Force garbage collection if available
  if (global.gc) {
    console.log('🗑️  Forcing garbage collection...')
    global.gc()
  }
}, 5000)

// Monitor for specific events
process.on('exit', () => {
  console.log('\n🏁 Process exiting - Final memory state:')
  displayMemoryStatus()
})

console.log('\n📝 USAGE INSTRUCTIONS:')
console.log('1. Keep this monitor running')
console.log('2. Use your web app (search, upload photos, etc.)')
console.log('3. Watch for memory spikes and leaks')
console.log('4. Press Ctrl+C to stop monitoring')
console.log('\n🎯 TARGET: Keep RSS < 250MB, ArrayBuffers < 20MB')
