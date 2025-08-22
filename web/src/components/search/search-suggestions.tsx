'use client'

import { useState, useEffect } from 'react'

export const SEARCH_SUGGESTIONS = [
  // Popular skill combinations
  "martial artist with motorcycle experience",
  "female performer with horse riding skills", 
  "gymnast with wire work experience",
  "fire performer available in LA",
  "experienced fall specialist", 
  "sword fighting expert",
  "motorcycle stunt rider",
  "parkour specialist near NYC",
  "water work and diving expert",
  "wire work and aerial performer",
  
  // Location-based
  "stunt performers in Los Angeles",
  "performers available in Atlanta", 
  "motorcycle riders in Vancouver",
  "martial artists in Toronto",
  "fire performers in Las Vegas",
  
  // Physical attributes  
  "tall male performer over 6 feet",
  "petite female martial artist",
  "athletic gymnast under 130 lbs",
  "experienced performer over 40",
  
  // Union and professional
  "SAG-AFTRA stunt performers",
  "non-union motorcycle riders", 
  "available performers this month",
  "union fire work specialists",
  
  // Specialized skills
  "car chase and driving specialists",
  "horse riding and western stunts",
  "fighting and weapon combat",
  "climbing and rope work experts",
  "precision driving specialists"
]

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  className?: string
}

export function SearchSuggestions({ onSuggestionClick, className = "" }: SearchSuggestionsProps) {
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Generate random suggestions only on client side to avoid hydration mismatch
    const shuffled = [...SEARCH_SUGGESTIONS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 8)
    setRandomSuggestions(shuffled)
  }, [])

  // Show a static set during server-side rendering
  if (randomSuggestions.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-sm font-medium text-gray-700">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {SEARCH_SUGGESTIONS.slice(0, 8).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-gray-700">Popular searches:</p>
      <div className="flex flex-wrap gap-2">
        {randomSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
