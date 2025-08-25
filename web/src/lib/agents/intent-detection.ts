// 🚀 MEMORY FIX: Ultra-lightweight OpenAI calls (1KB vs 10MB)
import { callOpenAIJSON } from '@/lib/utils/openai-fetch'

export interface IntentAnalysis {
  intent: 'search' | 'conversation' | 'help' | 'greeting'
  confidence: number
  explanation: string
  suggestedResponse?: string
}

export async function detectUserIntent(
  message: string, 
  conversationHistory: any[] = []
): Promise<IntentAnalysis> {
  
  // Build conversation context
  const recentContext = conversationHistory
    .slice(-3) // Last 3 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  const isFirstMessage = conversationHistory.length === 0

  const prompt = `You are an AI that detects user intent in a stunt performer casting platform chat.

CONVERSATION CONTEXT:
${recentContext || 'This is the start of the conversation.'}

CURRENT USER MESSAGE: "${message}"

INTENT CATEGORIES:
1. "search" - User wants to find/search for stunt performers, including:
   - Specific casting requirements (e.g., "I need a female fighter", "Looking for someone in LA")
   - Specific person names (e.g., "john cihangir", "Sarah Chen", "Marcus Torres")
   - Person-related queries (e.g., "Who is Alex Smith?", "Tell me about Lisa Wong")
2. "conversation" - Casual chat, greetings, questions about the platform (e.g., "Hi", "How are you?", "What is this?", "Tell me about yourself")
3. "help" - User needs assistance with the platform (e.g., "How do I search?", "What can you help with?", "I'm confused")
4. "greeting" - Initial hello, introduction (e.g., "Hi", "Hello", "Hey there")

ANALYSIS RULES:
- If message contains specific casting requirements (height, location, skills, gender), it's "search"
- If message looks like a person's name (2+ capitalized words), it's likely "search" - they want to look up that person
- If message asks about a specific person (name + question), it's "search"
- If message is a simple greeting or casual question, it's "conversation" or "greeting"
- If user asks about platform functionality, it's "help"
- Consider conversation context - if they were just chatting, continue conversation
- IMPORTANT: Any mention of specific names should be treated as "search" intent

Return ONLY valid JSON:
{
  "intent": "search|conversation|help|greeting",
  "confidence": 0.0-1.0,
  "explanation": "Brief reason for classification",
  "suggestedResponse": "Optional brief response direction"
}`

  try {
    // 🚀 MEMORY OPTIMIZED: Direct fetch call (no heavy client)
    const analysis: IntentAnalysis = await callOpenAIJSON({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    console.log('🎯 Intent Detection Result:', analysis)
    return analysis

  } catch (error) {
    console.error('Intent detection error:', error)
    
    // Fallback: Simple keyword-based detection
    const lowerMessage = message.toLowerCase()
    
    // Search intent keywords
    const searchKeywords = ['find', 'need', 'looking for', 'search', 'want', 'height', 'location', 'skill', 'fighter', 'driver', 'performer']
    const hasSearchKeywords = searchKeywords.some(keyword => lowerMessage.includes(keyword))
    
    // Greeting keywords
    const greetingKeywords = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon']
    const hasGreeting = greetingKeywords.some(keyword => lowerMessage.includes(keyword))
    
    if (hasSearchKeywords) {
      return {
        intent: 'search',
        confidence: 0.7,
        explanation: 'Contains search-related keywords'
      }
    } else if (hasGreeting || isFirstMessage) {
      return {
        intent: 'greeting',
        confidence: 0.8,
        explanation: 'Appears to be a greeting or first message'
      }
    } else {
      return {
        intent: 'conversation',
        confidence: 0.6,
        explanation: 'Fallback to conversation mode'
      }
    }
  }
}
