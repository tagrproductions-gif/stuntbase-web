// Re-export all shared types for easy mobile access
// export * from '../../../shared/types/database'
// Temporary: commented out until we fix the shared types

// Mobile-specific types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface Profile {
  id: string
  full_name: string
  location: string
  bio: string
  experience_years: number
  height_feet: number
  height_inches: number
  weight_lbs: number
  profile_photos: any[]
}
