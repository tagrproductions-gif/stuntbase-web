# 🤖 AI Agent Flow & Filtering Logic Breakdown

## 🎯 High-Level Architecture

This stunt performer casting platform uses a **sophisticated multi-agent AI system** with **intelligent filtering** to match casting directors with the right talent. The system has evolved from simple search to a context-aware, conversation-driven platform.

---

## 🔄 Main Processing Flow

### **Entry Point: User Input Processing**
```
User Message → Intent Detection → Route to Appropriate Agent System
```

### **1. Intent Detection Agent** 🎯
- **Purpose**: Determines what the user wants to do
- **Model**: OpenAI GPT-4o-mini
- **Categories**:
  - `search` - Finding performers (casting requirements, names)
  - `conversation` - Casual chat, greetings, platform questions
  - `help` - Platform assistance requests
  - `greeting` - Initial introductions

**Key Logic:**
```typescript
// Analyzes conversation context (last 3 messages)
// Detects specific names vs general search terms
// Returns confidence score and routing decision
```

---

## 🔀 Routing Logic

### **Route 1: Name-Based Queries** 👤
**Trigger**: Specific person names detected (e.g., "John Cihangir", "Sarah Chen")

**Flow**:
```
Name Detection → Database Name Search → Generate Response
```

**Features**:
- Fast bypass of AI processing for efficiency
- Direct database lookup by name matching
- Handles partial names and fuzzy matching

---

### **Route 2: Search Intent - Two-Agent Pipeline** 🔍

This is the **core casting search system** with multiple specialized agents:

#### **Agent 1: Query Parser** 🤖
- **Model**: OpenAI GPT-4o-mini with JSON mode
- **Purpose**: Convert natural language to structured database filters
- **Input**: `"Looking for a badass female fighter in LA area, around 5'8", can do motorcycle stunts"`
- **Output**: 
```json
{
  "gender": "Woman",
  "location": "los-angeles-ca", 
  "height_min": 66,
  "height_max": 72,
  "skills": ["fight", "drive"],
  "confidence": 0.9
}
```

**Parsing Logic**:
- Maps natural language to **exact** database values
- Handles height conversions (5'8" → 68 inches)
- Maps skills to predefined categories with aliases
- Validates against available locations and options
- Detects "broad search" patterns vs specific requirements

---

#### **Database Query Engine** 🗄️
**File**: `structured-query.ts`

**Flexible Matching Philosophy**:
- **Height**: ±3 inches flexibility (5'9" finds 5'6" to 6'0")
- **Weight**: ±10 lbs flexibility
- **Skills**: Related skills mapping (martial arts → fight category)
- **Location**: Primary + secondary location matching

**Filter Application Order**:
1. **Base Query**: Public profiles only
2. **Gender Filter**: Exact match
3. **Location Filter**: Structured locations + fallback to unstructured
4. **Height Filter**: Flexible range with safety bounds
5. **Weight Filter**: Flexible range with safety bounds
6. **Skills Filter**: Direct + related skills matching
7. **Union Status Filter**: SAG-AFTRA pattern matching
8. **Travel Radius Filter**: Hierarchical matching

**Related Skills Mapping**:
```typescript
{
  'fight': ['martial arts', 'combat', 'boxing', 'karate', 'mma', 'wrestling'],
  'gun': ['firearms', 'weapon', 'tactical', 'military', 'police'],
  'drive': ['motorcycle', 'car', 'vehicle', 'racing', 'precision driving'],
  // ... more mappings
}
```

**Profile Completeness Sorting**:
- Scores profiles based on filled fields
- Randomizes equal scores for fair exposure
- Prioritizes profiles with photos, skills, certifications

---

#### **Agent 3: Resume Analyzer** 📄
**Model**: OpenAI GPT-4o-mini
**Tier System**: Currently analyzing all users, designed for Pro/Premium migration

**Process**:
1. **Eligibility Check**: Subscription tier validation
2. **PDF Text Extraction**: Extract text from uploaded resumes
3. **AI Analysis**: Extract relevant experience, notable credits, skills
4. **Relevance Scoring**: Rate match to search context (0.0-1.0)

**Analysis Output**:
```typescript
{
  profileId: string,
  tier: 'free' | 'pro' | 'premium',
  relevantExperience: ["John Wick 4 stunt double"],
  notableCredits: ["Fast & Furious franchise"],
  yearsExperience: 8,
  relevanceScore: 0.85,
  skillsFromResume: ["martial arts", "wire work"]
}
```

**Tier Migration Ready**:
```typescript
// Easy switch from all users to Pro-only
enableProOnlyMode() // Switches to paid tier analysis
```

---

#### **Agent 2: Casting Assistant** 🎭
**Model**: OpenAI GPT-4o-mini
**Purpose**: Generate human-like casting recommendations

**Input Context**:
- Original user message
- Parsed filters from Agent 1
- Filtered profiles from database
- Resume analysis insights
- Conversation history (last 3 messages)

**Response Philosophy**:
- **"Close Match" Focus**: Emphasizes adaptability over exact matches
- **Training Potential**: Highlights why someone could work despite differences
- **Relationship Building**: Remembers conversation context
- **Professional Tone**: Industry-appropriate language

**Response Format**:
```
🎬 Sarah Chen
📍 Los Angeles, CA • 5'7", 130 lbs, Asian ethnicity
⭐ Key Skills: Martial Arts, Wire Work, Gymnastics
🎥 Experience: Worked on "John Wick 4", 8 years experience
✨ Why Perfect: Her martial arts background makes her ideal

[PROFILES: prof123,prof456,prof789]
```

---

### **Route 3: Conversational Agent** 💬
**Model**: OpenAI GPT-4o-mini
**Purpose**: Handle non-search interactions

**Features**:
- Platform information and help
- Casual conversation
- Greeting responses
- Context-aware dialogue

---

## 🎛️ Frontend Filtering System

### **Reactive Filter Interface**
**File**: `reactive-filter-interface.tsx`

**Real-Time Features**:
- **Debounced Sliders**: Height/weight update UI immediately, search after 500ms delay
- **Auto-Search**: Filters trigger search automatically
- **Dynamic Options**: Filter options loaded from actual database data
- **Mobile Responsive**: Touch-optimized controls

**Filter Types**:
1. **Dropdown Filters**: Gender, Ethnicity, Location, Union Status
2. **Range Sliders**: Height (48-84 inches), Weight (80-350 lbs)
3. **Advanced Options**: Availability, Travel radius

**Search API Integration**:
```typescript
// Sends structured filters to /api/search
{
  filters: {
    gender: "Woman",
    location: "los-angeles-ca",
    minHeight: 66,
    maxHeight: 72
  },
  page: 1,
  limit: 12,
  sortBy: 'updated'
}
```

---

## 🔧 Configuration & Migration

### **Resume Analysis Tiers**
```typescript
const RESUME_CONFIG = {
  enableForAllUsers: true,        // 🔧 Current: Testing mode
  enabledTiers: ['pro', 'premium'], // 🔮 Future: Paid only
  maxResumesToAnalyze: 4,
  timeoutMs: 10000
}
```

### **AI Model Usage**
- **Query Parser**: OpenAI GPT-4o-mini (fast, cheap)
- **Casting Assistant**: OpenAI GPT-4o-mini (conversational)
- **Resume Analyzer**: OpenAI GPT-4o-mini (analysis)
- **Intent Detection**: OpenAI GPT-4o-mini (routing)

### **Performance Optimizations**
- **Token Limits**: 300-600 tokens per agent call
- **Caching**: Profile completeness scores
- **Retry Logic**: Exponential backoff for API failures
- **Fallback**: Simple responses if AI fails

---

## 📊 Search Performance

### **Cost Reduction**:
- **Before**: 10,000+ tokens per search (all profiles to AI)
- **After**: ~600 tokens per search (structured filtering)
- **Savings**: 85-95% reduction in AI costs

### **Speed Improvement**:
- **Structured Queries**: Fast database filtering first
- **Small AI Payloads**: Only relevant profiles to AI
- **Parallel Processing**: Multiple filter applications

### **Accuracy**:
- **No Hallucination**: AI only works with real database profiles
- **Flexible Matching**: Close matches prioritized over exact
- **Context Awareness**: Conversation history considered

---

## 🚀 Future Enhancements

### **Planned Features**:
- **Vector Embeddings**: Semantic similarity search
- **Learning System**: Track successful matches
- **Multi-Modal**: Image analysis, voice queries
- **Real-Time**: WebSocket updates for availability

### **Analytics Tracking**:
- Parse success rates
- Filter accuracy metrics
- User satisfaction scores
- Search-to-contact conversion

---

This multi-agent system provides **intelligent, context-aware talent matching** with **flexible filtering** and **conversational interaction**, making it feel like working with a professional casting assistant who understands both technical requirements and industry nuances.
