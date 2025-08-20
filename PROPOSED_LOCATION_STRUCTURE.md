# 🌍 PROPOSED STRUCTURED LOCATION SYSTEM

## **🎬 MAJOR FILM/TV MARKETS (Tier 1)**
```javascript
const majorMarkets = [
  // California
  { value: "los-angeles-ca", label: "Los Angeles, CA", state: "CA", market: "tier1" },
  { value: "san-francisco-ca", label: "San Francisco, CA", state: "CA", market: "tier1" },
  { value: "san-diego-ca", label: "San Diego, CA", state: "CA", market: "tier1" },
  
  // New York
  { value: "new-york-ny", label: "New York, NY", state: "NY", market: "tier1" },
  
  // Georgia
  { value: "atlanta-ga", label: "Atlanta, GA", state: "GA", market: "tier1" },
  
  // Florida
  { value: "miami-fl", label: "Miami, FL", state: "FL", market: "tier1" },
  { value: "orlando-fl", label: "Orlando, FL", state: "FL", market: "tier1" },
  
  // Nevada
  { value: "las-vegas-nv", label: "Las Vegas, NV", state: "NV", market: "tier1" },
  
  // Illinois
  { value: "chicago-il", label: "Chicago, IL", state: "IL", market: "tier1" },
  
  // Texas
  { value: "austin-tx", label: "Austin, TX", state: "TX", market: "tier1" },
  { value: "dallas-tx", label: "Dallas, TX", state: "TX", market: "tier1" },
  { value: "houston-tx", label: "Houston, TX", state: "TX", market: "tier1" },
]
```

## **🏘️ SECONDARY MARKETS (Tier 2)**
```javascript
const secondaryMarkets = [
  // California
  { value: "sacramento-ca", label: "Sacramento, CA", state: "CA", market: "tier2" },
  { value: "fresno-ca", label: "Fresno, CA", state: "CA", market: "tier2" },
  
  // New York
  { value: "buffalo-ny", label: "Buffalo, NY", state: "NY", market: "tier2" },
  { value: "rochester-ny", label: "Rochester, NY", state: "NY", market: "tier2" },
  
  // Other states
  { value: "seattle-wa", label: "Seattle, WA", state: "WA", market: "tier2" },
  { value: "portland-or", label: "Portland, OR", state: "OR", market: "tier2" },
  { value: "denver-co", label: "Denver, CO", state: "CO", market: "tier2" },
  { value: "phoenix-az", label: "Phoenix, AZ", state: "AZ", market: "tier2" },
  { value: "boston-ma", label: "Boston, MA", state: "MA", market: "tier2" },
  { value: "philadelphia-pa", label: "Philadelphia, PA", state: "PA", market: "tier2" },
  
  // Add more as needed...
]
```

## **🌎 INTERNATIONAL MARKETS**
```javascript
const internationalMarkets = [
  { value: "vancouver-bc", label: "Vancouver, BC", country: "Canada", market: "international" },
  { value: "toronto-on", label: "Toronto, ON", country: "Canada", market: "international" },
  { value: "london-uk", label: "London, UK", country: "United Kingdom", market: "international" },
  { value: "dublin-ie", label: "Dublin, Ireland", country: "Ireland", market: "international" },
]
```

## **📱 UI/UX IMPLEMENTATION:**

### **Form Fields:**
```jsx
// Primary Location (Required)
<Select name="primary_location">
  <optgroup label="🎬 Major Markets">
    <option value="los-angeles-ca">Los Angeles, CA</option>
    <option value="atlanta-ga">Atlanta, GA</option>
    <option value="new-york-ny">New York, NY</option>
  </optgroup>
  <optgroup label="🏘️ Secondary Markets">
    <option value="seattle-wa">Seattle, WA</option>
    <option value="denver-co">Denver, CO</option>
  </optgroup>
  <optgroup label="🌎 International">
    <option value="vancouver-bc">Vancouver, BC</option>
    <option value="london-uk">London, UK</option>
  </optgroup>
</Select>

// Secondary Location (Optional)
<Select name="secondary_location">
  <option value="">No secondary location</option>
  // Same options as above
</Select>

// Travel Radius (Optional)
<Select name="travel_radius">
  <option value="local">Local only</option>
  <option value="50">Within 50 miles</option>
  <option value="100">Within 100 miles</option>
  <option value="200">Within 200 miles</option>
  <option value="national">Willing to travel nationally</option>
  <option value="international">Willing to travel internationally</option>
</Select>
```

## **🔍 SEARCH BENEFITS:**

### **1. Exact Matching:**
```javascript
// Simple, clean search logic:
if (userSearches("atlanta")) {
  findProfiles({ primary_location: "atlanta-ga" })
  findProfiles({ secondary_location: "atlanta-ga" })
}
```

### **2. Regional Searches:**
```javascript
// "California performers"
findProfiles({ state: "CA" })

// "Southeast performers" 
findProfiles({ state: ["GA", "FL", "NC", "SC", "TN"] })
```

### **3. Market Tier Filtering:**
```javascript
// "Major market performers only"
findProfiles({ market: "tier1" })
```

## **🚀 MIGRATION STRATEGY:**

### **Phase 1: Add New Fields**
- Add `primary_location_structured` and `secondary_location_structured` 
- Keep existing `location` field for backward compatibility

### **Phase 2: Data Migration**
```sql
-- Map existing free-form locations to structured ones
UPDATE profiles SET primary_location_structured = 'los-angeles-ca' 
WHERE location ILIKE '%los angeles%' OR location ILIKE '%la%' OR location ILIKE '%hollywood%';

UPDATE profiles SET primary_location_structured = 'atlanta-ga'
WHERE location ILIKE '%atlanta%' OR location ILIKE '%atl%';
```

### **Phase 3: Update Search Logic**
- Prioritize structured location fields
- Fall back to old location field if structured is null

### **Phase 4: Deprecate Old Field**
- Eventually remove `location`, `city`, `state` fields
- Keep only structured location system

## **💰 BUSINESS BENEFITS:**

1. **Better Analytics**: "80% of performers are in Tier 1 markets"
2. **Targeted Features**: "Premium placement for LA market"
3. **Casting Director Tools**: "Find performers within 100 miles of shooting location"
4. **Market Insights**: "High demand in Atlanta, low supply in Denver"

This would make your platform WAY more professional and search-friendly! 🎯
