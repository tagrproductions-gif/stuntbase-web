/**
 * Text normalization utilities for consistent formatting
 */

// Capitalize each word in a string (Title Case)
export const capitalizeWords = (text: string): string => {
  if (!text) return text
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Normalize location text (handles common location formats)
export const normalizeLocation = (location: string): string => {
  if (!location) return location
  
  // Split by comma for city, state format
  const parts = location.split(',').map(part => part.trim())
  
  return parts
    .map(part => {
      // Handle state abbreviations (keep them uppercase)
      if (part.length === 2 && /^[A-Za-z]{2}$/.test(part)) {
        return part.toUpperCase()
      }
      // Handle common state names and cities
      return capitalizeWords(part)
    })
    .join(', ')
}

// Normalize names (handles first/last name format)
export const normalizeName = (name: string): string => {
  if (!name) return name
  
  // Handle common name prefixes/suffixes
  const words = name.split(' ')
  return words
    .map(word => {
      // Handle common prefixes (Dr., Mr., Mrs., etc.)
      if (word.toLowerCase().match(/^(dr|mr|mrs|ms|prof)\.?$/)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase().replace(/\.$/, '') + '.'
      }
      // Handle suffixes (Jr., Sr., III, etc.)
      if (word.toLowerCase().match(/^(jr|sr|ii|iii|iv)\.?$/)) {
        return word.toUpperCase().replace(/\.$/, '') + '.'
      }
      // Regular word capitalization
      return capitalizeWords(word)
    })
    .join(' ')
}

// Normalize general text input
export const normalizeText = (text: string): string => {
  if (!text) return text
  return capitalizeWords(text.trim())
}

// Convert simple skills/certs to database format for backward compatibility
export const convertSimpleSkillsToDatabase = (simpleSkills: { name: string; proficiency_level: string }[]) => {
  return simpleSkills.map(skill => ({
    skill_id: skill.name, // Use name as ID for simple skills
    proficiency_level: skill.proficiency_level
  }))
}

export const convertSimpleCertificationsToDatabase = (simpleCerts: { name: string }[]) => {
  return simpleCerts.map(cert => ({
    certification_id: cert.name, // Use name as ID for simple certifications
    date_obtained: null,
    expiry_date: null,
    certification_number: null
  }))
}
