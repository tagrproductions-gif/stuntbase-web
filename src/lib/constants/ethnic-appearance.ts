/**
 * Structured Ethnic Appearance Options
 * These are the ONLY allowed values for ethnic appearance throughout the app
 */

export const ETHNIC_APPEARANCE_OPTIONS = [
  { label: 'White', value: 'WHITE' },
  { label: 'Black', value: 'BLACK' },
  { label: 'Asian', value: 'ASIAN' },
  { label: 'Hispanic', value: 'HISPANIC' },
  { label: 'Middle Eastern', value: 'MIDDLE_EASTERN' }
] as const

// Type for ethnic appearance values
export type EthnicAppearanceValue = typeof ETHNIC_APPEARANCE_OPTIONS[number]['value']

// Helper function to find label by value
export function getEthnicAppearanceLabel(value: string | null | undefined): string {
  if (!value) return ''
  const option = ETHNIC_APPEARANCE_OPTIONS.find(opt => opt.value === value)
  return option?.label || value
}

// Helper function to find value by label (for legacy data migration)
export function getEthnicAppearanceValue(label: string | null | undefined): string | null {
  if (!label) return null
  
  // Direct value match
  const directMatch = ETHNIC_APPEARANCE_OPTIONS.find(opt => opt.value === label)
  if (directMatch) return directMatch.value
  
  // Label match (case insensitive)
  const labelMatch = ETHNIC_APPEARANCE_OPTIONS.find(opt => 
    opt.label.toLowerCase() === label.toLowerCase()
  )
  if (labelMatch) return labelMatch.value
  
  // Legacy mapping for common variations
  const normalizedLabel = label.toLowerCase().trim()
  
  if (normalizedLabel.includes('white') || normalizedLabel.includes('caucasian') || normalizedLabel.includes('european')) {
    return 'WHITE'
  }
  if (normalizedLabel.includes('black') || normalizedLabel.includes('african') || normalizedLabel.includes('afro')) {
    return 'BLACK'
  }
  if (normalizedLabel.includes('asian') || normalizedLabel.includes('chinese') || normalizedLabel.includes('japanese') || 
      normalizedLabel.includes('korean') || normalizedLabel.includes('indian') || normalizedLabel.includes('vietnamese') ||
      normalizedLabel.includes('thai') || normalizedLabel.includes('filipino')) {
    return 'ASIAN'
  }
  if (normalizedLabel.includes('hispanic') || normalizedLabel.includes('latino') || normalizedLabel.includes('latina') ||
      normalizedLabel.includes('mexican') || normalizedLabel.includes('spanish') || normalizedLabel.includes('puerto rican')) {
    return 'HISPANIC'
  }
  if (normalizedLabel.includes('middle eastern') || normalizedLabel.includes('arab') || normalizedLabel.includes('persian') ||
      normalizedLabel.includes('turkish') || normalizedLabel.includes('lebanese') || normalizedLabel.includes('iranian')) {
    return 'MIDDLE_EASTERN'
  }
  
  // If no match found, return null (will need manual review)
  return null
}

// All valid ethnic appearance values as array
export const ALL_ETHNIC_APPEARANCE_VALUES = ETHNIC_APPEARANCE_OPTIONS.map(opt => opt.value)
