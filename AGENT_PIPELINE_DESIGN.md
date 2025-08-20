# 🤖 TWO-AGENT SEARCH PIPELINE DESIGN

## **🎯 OVERVIEW**
Split the search into two specialized agents:
1. **Query Parser Agent** - Convert natural language to structured filters
2. **Casting Assistant Agent** - Use structured data to find and recommend performers

---

## **🤖 AGENT 1: QUERY PARSER**

### **Purpose:**
Convert messy user input into clean, structured filters for database queries.

### **Model:** 
Claude Haiku (ultra-cheap, ~100 tokens per call)

### **Input Example:**
```
"Looking for a badass female fighter in LA area, around 5'8", can do motorcycle stunts"
```

### **Output Example:**
```json
{
  "gender": "Woman",
  "location": "los-angeles-ca", 
  "height_min": 66,
  "height_max": 72,
  "skills": ["fight", "motorcycle"],
  "confidence": 0.9
}
```

### **Prompt Template:**
```
You are a film industry casting assistant. Parse this search query into structured filters.

AVAILABLE LOCATIONS:
- los-angeles-ca (aliases: LA, Los Angeles, Hollywood, WeHo, etc.)
- atlanta-ga (aliases: ATL, Atlanta, Georgia, etc.)
- new-york-ny (aliases: NYC, New York, Manhattan, etc.)
[... full list]

AVAILABLE SKILLS:
- fight (aliases: martial arts, combat, boxing, MMA, etc.)
- drive (aliases: driving, motorcycle, car, racing, etc.) 
- swim (aliases: water, diving, scuba, underwater, etc.)
[... full list]

USER QUERY: "{user_message}"

Return JSON only:
{
  "gender": "Man|Woman|Non-binary|null",
  "location": "structured-location-code|null", 
  "height_min": number_in_inches|null,
  "height_max": number_in_inches|null,
  "skills": ["skill1", "skill2"]|[],
  "age_range": "18-25|26-35|36-45|46+|null",
  "confidence": 0.0-1.0
}
```

---

## **🎭 AGENT 2: CASTING ASSISTANT**

### **Purpose:**
Use structured filters to query database and provide conversational recommendations.

### **Model:**
Claude Haiku (or Sonnet for complex queries)

### **Input:**
- Original user message
- Structured filters from Agent 1  
- Filtered profiles from database
- Search metadata (count, method used)

### **Process:**
1. Use structured filters for efficient DB query
2. Get only relevant profiles (5-20 instead of 500+)
3. Feed clean data to Agent 2 for natural response

### **Prompt Template:**
```
You are a professional casting assistant helping find stunt performers.

ORIGINAL REQUEST: "{original_message}"
INTERPRETED FILTERS: {parsed_filters}
SEARCH METHOD: {method} (vector/filtered/hybrid)
RESULTS FOUND: {count} performers

AVAILABLE PERFORMERS:
{filtered_profiles}

INSTRUCTIONS:
- Recommend specific performers from the list above
- Explain why they match the criteria
- Mention any close alternatives if exact matches aren't available
- Be conversational and professional
- Include performer IDs: [PROFILES: id1,id2,id3]
```

---

## **🔄 API FLOW**

### **Endpoint: `/api/chat` (Updated)**
```javascript
export async function POST(request) {
  const { message } = await request.json()
  
  // STAGE 1: Parse query into structured filters
  const parseResponse = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 200,
    messages: [{ role: 'user', content: queryParserPrompt(message) }]
  })
  
  const filters = JSON.parse(parseResponse.content[0].text)
  console.log('Parsed filters:', filters)
  
  // STAGE 2: Database query with structured filters
  const profiles = await queryWithStructuredFilters(filters)
  console.log('Filtered profiles:', profiles.length)
  
  // STAGE 3: Casting assistant response
  const assistantResponse = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', 
    max_tokens: 500,
    messages: [{ role: 'user', content: castingAssistantPrompt(message, filters, profiles) }]
  })
  
  return NextResponse.json({
    response: assistantResponse.content[0].text,
    profiles: extractMatchedProfiles(assistantResponse.content[0].text, profiles),
    filters: filters, // Debug info
    searchStats: { method: 'structured', count: profiles.length }
  })
}
```

---

## **📊 PERFORMANCE BENEFITS**

### **Cost Reduction:**
- **Before**: 10,000+ tokens per search (all profiles to Claude)
- **After**: ~600 tokens per search (parsing + filtered results)
- **Savings**: 85-95% reduction in AI costs

### **Speed Improvement:**
- **Before**: Large prompt → slow Claude response
- **After**: Small prompt → fast response
- **Database**: More efficient queries with exact filters

### **Accuracy Improvement:**
- **Before**: Claude sometimes hallucinates performers
- **After**: Agent 1 validates all filters, Agent 2 only uses real data

---

## **🎯 IMPLEMENTATION PHASES**

### **Phase 1: Build Query Parser Agent**
1. Create parsing prompt with all location/skill mappings
2. Test with various user queries
3. Validate JSON output format

### **Phase 2: Update Database Query Logic**
1. Create `queryWithStructuredFilters()` function
2. Optimize for exact filter matching
3. Add fallback for edge cases

### **Phase 3: Update Casting Assistant**
1. Simplify prompt (no more parsing logic)
2. Focus on recommendation quality
3. Add personality and industry knowledge

### **Phase 4: Add Intelligence**
1. Track parsing accuracy
2. Learn from user feedback
3. Expand skill/location mappings

---

## **🚀 FUTURE ENHANCEMENTS**

### **Smart Learning:**
- Track which parsed filters lead to successful matches
- A/B test different parsing strategies
- Build industry-specific vocabulary

### **Multi-Modal:**
- Parse location radius ("within 50 miles of Atlanta")
- Handle complex requirements ("SAG-AFTRA preferred but not required")
- Date availability ("available next month")

### **Performance Analytics:**
- Parse success rate
- Filter accuracy metrics  
- User satisfaction tracking

This two-agent approach will make your search incredibly fast, accurate, and cost-effective! 🎯
