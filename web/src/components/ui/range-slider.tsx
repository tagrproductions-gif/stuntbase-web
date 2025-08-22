'use client'

import { useState, useEffect } from 'react'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  formatLabel?: (value: number) => string
  className?: string
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  formatLabel = (v) => v.toString(),
  className = ''
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)

  const percentageMin = ((value[0] - min) / (max - min)) * 100
  const percentageMax = ((value[1] - min) / (max - min)) * 100

  // Unified function to calculate new value from position
  const calculateValueFromPosition = (clientX: number) => {
    const slider = document.querySelector('.range-slider-track') as HTMLElement
    if (!slider) return null

    const rect = slider.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const newValue = min + (percentage / 100) * (max - min)
    return Math.round(newValue / step) * step
  }

  // Mouse event handlers
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const steppedValue = calculateValueFromPosition(e.clientX)
    if (steppedValue === null) return

    if (isDragging === 'min') {
      onValueChange([Math.min(steppedValue, value[1] - step), value[1]])
    } else {
      onValueChange([value[0], Math.max(steppedValue, value[0] + step)])
    }
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  // Touch event handlers for mobile support
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    
    // Prevent default to avoid scrolling while dragging
    e.preventDefault()
    
    const touch = e.touches[0]
    const steppedValue = calculateValueFromPosition(touch.clientX)
    if (steppedValue === null) return

    if (isDragging === 'min') {
      onValueChange([Math.min(steppedValue, value[1] - step), value[1]])
    } else {
      onValueChange([value[0], Math.max(steppedValue, value[0] + step)])
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(null)
  }

  // Start dragging handlers
  const startDragging = (thumb: 'min' | 'max', e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent default to avoid interfering with touch gestures
    setIsDragging(thumb)
  }

  useEffect(() => {
    if (isDragging) {
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, value, min, max, step])

  return (
    <div className={`relative w-full ${className}`}>
      {/* Labels */}
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-6 flex items-center">
        <div className="range-slider-track relative w-full h-2 bg-muted rounded-full">
          {/* Active range */}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${percentageMin}%`,
              width: `${percentageMax - percentageMin}%`
            }}
          />

          {/* Min thumb */}
          <div
            className="absolute w-6 h-6 bg-primary border-4 border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-1/2"
            style={{ 
              left: `${percentageMin}%`,
              touchAction: 'manipulation'
            }}
            onMouseDown={(e) => startDragging('min', e)}
            onTouchStart={(e) => startDragging('min', e)}
          />

          {/* Max thumb */}
          <div
            className="absolute w-6 h-6 bg-primary border-4 border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-1/2"
            style={{ 
              left: `${percentageMax}%`,
              touchAction: 'manipulation'
            }}
            onMouseDown={(e) => startDragging('max', e)}
            onTouchStart={(e) => startDragging('max', e)}
          />
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </div>
    </div>
  )
}
