// Structured location system for StuntBase
export interface LocationOption {
  value: string
  label: string
  state?: string
  country?: string
  market: 'tier1' | 'tier2' | 'international'
  aliases: string[] // For search matching
}

// Major film/TV markets (Tier 1)
export const TIER1_MARKETS: LocationOption[] = [
  {
    value: "los-angeles-ca",
    label: "Los Angeles, CA",
    state: "CA",
    country: "USA",
    market: "tier1",
    aliases: ["la", "los angeles", "hollywood", "west hollywood", "weho", "burbank", "studio city", "beverly hills", "santa monica"]
  },
  {
    value: "new-york-ny",
    label: "New York, NY",
    state: "NY", 
    country: "USA",
    market: "tier1",
    aliases: ["nyc", "new york", "manhattan", "brooklyn", "queens", "bronx", "long island"]
  },
  {
    value: "atlanta-ga",
    label: "Atlanta, GA",
    state: "GA",
    country: "USA", 
    market: "tier1",
    aliases: ["atlanta", "atl", "hotlanta", "georgia"]
  },
  {
    value: "chicago-il",
    label: "Chicago, IL",
    state: "IL",
    country: "USA",
    market: "tier1", 
    aliases: ["chicago", "windy city", "illinois"]
  },
  {
    value: "miami-fl",
    label: "Miami, FL",
    state: "FL",
    country: "USA",
    market: "tier1",
    aliases: ["miami", "south beach", "florida"]
  },
  {
    value: "las-vegas-nv",
    label: "Las Vegas, NV", 
    state: "NV",
    country: "USA",
    market: "tier1",
    aliases: ["las vegas", "vegas", "sin city", "nevada"]
  },
  {
    value: "austin-tx",
    label: "Austin, TX",
    state: "TX", 
    country: "USA",
    market: "tier1",
    aliases: ["austin", "texas"]
  },
  {
    value: "orlando-fl",
    label: "Orlando, FL",
    state: "FL",
    country: "USA", 
    market: "tier1",
    aliases: ["orlando", "florida"]
  }
]

// Secondary markets (Tier 2)
export const TIER2_MARKETS: LocationOption[] = [
  {
    value: "san-francisco-ca",
    label: "San Francisco, CA",
    state: "CA",
    country: "USA",
    market: "tier2",
    aliases: ["san francisco", "sf", "bay area", "california"]
  },
  {
    value: "san-diego-ca", 
    label: "San Diego, CA",
    state: "CA",
    country: "USA",
    market: "tier2",
    aliases: ["san diego", "california"]
  },
  {
    value: "dallas-tx",
    label: "Dallas, TX",
    state: "TX",
    country: "USA",
    market: "tier2", 
    aliases: ["dallas", "texas"]
  },
  {
    value: "houston-tx",
    label: "Houston, TX",
    state: "TX",
    country: "USA",
    market: "tier2",
    aliases: ["houston", "texas"]
  },
  {
    value: "seattle-wa",
    label: "Seattle, WA",
    state: "WA",
    country: "USA", 
    market: "tier2",
    aliases: ["seattle", "washington"]
  },
  {
    value: "portland-or",
    label: "Portland, OR",
    state: "OR",
    country: "USA",
    market: "tier2",
    aliases: ["portland", "oregon"]
  },
  {
    value: "denver-co",
    label: "Denver, CO", 
    state: "CO",
    country: "USA",
    market: "tier2",
    aliases: ["denver", "boulder", "colorado"]
  },
  {
    value: "phoenix-az",
    label: "Phoenix, AZ",
    state: "AZ",
    country: "USA",
    market: "tier2",
    aliases: ["phoenix", "scottsdale", "arizona"]
  },
  {
    value: "boston-ma",
    label: "Boston, MA",
    state: "MA", 
    country: "USA",
    market: "tier2",
    aliases: ["boston", "cambridge", "massachusetts"]
  },
  {
    value: "philadelphia-pa",
    label: "Philadelphia, PA",
    state: "PA",
    country: "USA",
    market: "tier2",
    aliases: ["philadelphia", "philly", "pennsylvania"]
  },
  {
    value: "nashville-tn",
    label: "Nashville, TN",
    state: "TN",
    country: "USA",
    market: "tier2", 
    aliases: ["nashville", "music city", "tennessee"]
  },
  {
    value: "charlotte-nc",
    label: "Charlotte, NC",
    state: "NC",
    country: "USA",
    market: "tier2",
    aliases: ["charlotte", "north carolina"]
  },
  {
    value: "tampa-fl",
    label: "Tampa, FL",
    state: "FL",
    country: "USA",
    market: "tier2",
    aliases: ["tampa", "florida"]
  },
  {
    value: "jacksonville-fl",
    label: "Jacksonville, FL", 
    state: "FL",
    country: "USA",
    market: "tier2",
    aliases: ["jacksonville", "florida"]
  },
  {
    value: "sacramento-ca",
    label: "Sacramento, CA",
    state: "CA",
    country: "USA",
    market: "tier2",
    aliases: ["sacramento", "california"]
  }
]

// International markets
export const INTERNATIONAL_MARKETS: LocationOption[] = [
  {
    value: "vancouver-bc",
    label: "Vancouver, BC",
    state: "BC",
    country: "Canada",
    market: "international",
    aliases: ["vancouver", "british columbia", "canada"]
  },
  {
    value: "toronto-on",
    label: "Toronto, ON", 
    state: "ON",
    country: "Canada",
    market: "international",
    aliases: ["toronto", "ontario", "canada"]
  },
  {
    value: "london-uk",
    label: "London, UK",
    country: "United Kingdom",
    market: "international",
    aliases: ["london", "england", "uk", "united kingdom"]
  },
  {
    value: "dublin-ie",
    label: "Dublin, Ireland",
    country: "Ireland", 
    market: "international",
    aliases: ["dublin", "ireland"]
  }
]

// Combined list of all locations
export const ALL_LOCATIONS: LocationOption[] = [
  ...TIER1_MARKETS,
  ...TIER2_MARKETS, 
  ...INTERNATIONAL_MARKETS
]

// Travel radius options
export const TRAVEL_RADIUS_OPTIONS = [
  { value: "local", label: "Local only" },
  { value: "50", label: "Within 50 miles" },
  { value: "100", label: "Within 100 miles" },
  { value: "200", label: "Within 200 miles" },
  { value: "state", label: "Statewide" },
  { value: "regional", label: "Regional (multi-state)" },
  { value: "national", label: "National" },
  { value: "international", label: "International" }
]

// Helper functions
export function findLocationByValue(value: string): LocationOption | undefined {
  return ALL_LOCATIONS.find(loc => loc.value === value)
}

export function findLocationByAlias(searchTerm: string): LocationOption | undefined {
  const term = searchTerm.toLowerCase().trim()
  return ALL_LOCATIONS.find(loc => 
    loc.aliases.some(alias => alias.includes(term)) ||
    loc.label.toLowerCase().includes(term)
  )
}

export function getLocationsByState(state: string): LocationOption[] {
  return ALL_LOCATIONS.filter(loc => loc.state === state)
}

export function getLocationsByMarket(market: 'tier1' | 'tier2' | 'international'): LocationOption[] {
  return ALL_LOCATIONS.filter(loc => loc.market === market)
}
