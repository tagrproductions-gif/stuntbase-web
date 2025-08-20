# 🚀 Vector Embeddings Setup Guide

Your AI search now supports **true semantic search** with vector embeddings! This means users can search with natural language like:

- *"Action hero type who can do his own stunts"*
- *"Female performer for fantasy movie with sword fighting"*  
- *"Someone like Tom Cruise in Mission Impossible"*

## 📋 Setup Steps

### 1. Enable pgvector in Supabase

Run this in your **Supabase SQL Editor**:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run Database Migration

Copy and run the entire contents of `setup-vector-embeddings.sql` in your **Supabase SQL Editor**.

This will:
- ✅ Add embedding column to profiles table
- ✅ Create vector indexes for fast search
- ✅ Add helper functions for content generation
- ✅ Create semantic search functions

### 3. Add OpenAI API Key

Add to your `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Cost**: ~$0.02 per 1M tokens (very cheap for embeddings!)

### 4. Install Dependencies

```bash
npm install openai
npm install --save-dev tsx
```

### 5. Generate Embeddings

Generate embeddings for all existing profiles:

```bash
# Generate all embeddings (recommended)
npm run generate-embeddings

# Or generate for specific profile
npm run generate-embeddings:profile your-profile-id-here
```

**Time**: ~2-5 minutes for 100 profiles

## 🎯 How It Works

### Hybrid Search Algorithm

Your search now uses a **smart hybrid approach**:

1. **Vector Search First** (semantic matching)
   - Converts search query to embedding
   - Finds profiles with similar meaning
   - Returns top 50 most similar profiles

2. **Filtered Search Fallback** (if vector search fails)
   - Traditional keyword/filter matching
   - Ensures search always works

### Example Searches

**Query**: *"Female stunt performer for action movie, needs motorcycle and fight skills"*

**Vector Search Finds**:
- Sarah (martial arts + motorcycle racing) - 92% similarity
- Maria (boxing + vehicle stunts) - 89% similarity  
- Jessica (MMA + driving) - 85% similarity

**Traditional Search Would Miss**: Profiles that describe skills differently but mean the same thing.

## 💰 Cost Analysis

### Current Costs (per 500 daily searches):

**Before Vector Search**:
- Claude Haiku: $250-$1,000/day

**After Vector Search**:
- Claude Haiku: $250-$1,000/day  
- OpenAI Embeddings: ~$2-5/day
- **Total**: $252-$1,005/day

**Embedding Generation** (one-time):
- 1000 profiles: ~$0.50-$2.00 total
- Re-generation when profiles update: ~$0.01 per profile

## 🔧 Configuration Options

### Similarity Threshold

In `src/app/api/chat/route.ts`, adjust the similarity threshold:

```javascript
// More strict matching (fewer results, higher quality)
const vectorResults = await searchProfilesBySimilarity(message, 0.85, 50)

// More loose matching (more results, lower quality)  
const vectorResults = await searchProfilesBySimilarity(message, 0.70, 50)
```

### Embedding Model Options

In `src/lib/embeddings/embedding-service.ts`:

**Current (Recommended)**:
```javascript
model: "text-embedding-3-small" // 1536 dims, $0.02/1M tokens
```

**Alternatives**:
```javascript
model: "text-embedding-3-large" // 3072 dims, $0.13/1M tokens (higher quality)
model: "text-embedding-ada-002" // 1536 dims, $0.10/1M tokens (legacy)
```

## 🆓 Free Alternative

Replace OpenAI with Hugging Face (free):

Uncomment the Hugging Face code in `embedding-service.ts` and add:

```bash
HUGGINGFACE_API_KEY=your-hf-token-here
npm install @huggingface/inference
```

**Trade-off**: Free but lower quality embeddings.

## 🔄 Maintenance

### Auto-Update Embeddings

Embeddings are automatically regenerated when:
- Profile content changes (bio, skills, certifications)
- Content hash differs from stored hash

### Manual Regeneration

```bash
# Regenerate all embeddings
npm run generate-embeddings

# Regenerate specific profile  
npm run generate-embeddings:profile abc123

# Regenerate via API
curl -X POST http://localhost:3000/api/embeddings/generate
```

## 🐛 Troubleshooting

### Vector Search Not Working?

1. **Check pgvector extension**:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. **Verify embedding columns exist**:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name LIKE '%embedding%';
   ```

3. **Check if embeddings are generated**:
   ```sql
   SELECT COUNT(*) FROM profiles WHERE content_embedding IS NOT NULL;
   ```

### API Errors?

- **OpenAI API key missing**: Add `OPENAI_API_KEY` to `.env.local`
- **Rate limits**: Reduce batch size in generation script
- **Embedding dimension errors**: Ensure pgvector supports 1536 dimensions

## 📊 Monitoring Performance

### Search Method Used

Your chat responses now show which search method was used:

```
SEARCH METHOD: AI Semantic Search
RESULTS RANKED BY AI SIMILARITY
```

vs

```
SEARCH METHOD: Filtered Search
FILTERS APPLIED: Gender: male, Location: GA
```

### Success Rate

Monitor in your server logs:
- `Vector search found X matches` = Success
- `Vector search failed, falling back` = Fallback used

## 🚀 Next Steps

1. **Run the setup** (Steps 1-5 above)
2. **Test semantic search** with natural language queries
3. **Monitor performance** and adjust similarity thresholds
4. **Consider upgrading** to larger embedding model for better quality

Your search is now **AI-powered** and understands **meaning**, not just keywords! 🎉
