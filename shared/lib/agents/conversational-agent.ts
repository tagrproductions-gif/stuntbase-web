import OpenAI from 'openai'
import { IntentAnalysis } from './intent-detection'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface ConversationalResponse {
  response: string
  shouldTransitionToSearch?: boolean
  searchHint?: string
}

export async function generateConversationalResponse(
  message: string,
  conversationHistory: any[] = [],
  intentAnalysis: IntentAnalysis
): Promise<ConversationalResponse> {

  // Build conversation context
  const recentContext = conversationHistory
    .slice(-4) // Last 4 messages for better context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  const isFirstMessage = conversationHistory.length === 0

  const prompt = `You are Alex, a friendly and knowledgeable casting assistant for a stunt performer platform. You help casting directors find the perfect stunt performers for their projects.

CONVERSATION CONTEXT:
${recentContext || 'This is the start of the conversation.'}

CURRENT USER MESSAGE: "${message}"
DETECTED INTENT: ${intentAnalysis.intent} (confidence: ${(intentAnalysis.confidence * 100).toFixed(0)}%)

YOUR PERSONALITY:
- Warm, professional, and enthusiastic about the stunt industry
- Knowledgeable about casting, stunts, and film production
- Helpful without being pushy
- Great at building rapport and understanding needs
- Always ready to transition to helping with searches when appropriate

RESPONSE GUIDELINES:

FOR GREETINGS/FIRST TIME:
- Welcome them warmly to the platform
- Briefly explain what you can help with
- Ask about their current project or casting needs
- Keep it conversational and inviting

FOR CASUAL CONVERSATION:
- Engage naturally with their topic
- Show personality and industry knowledge
- Gently guide toward how you can help with their casting needs
- Share relevant insights about stunt work or casting

FOR HELP REQUESTS:
- Explain platform features clearly
- Give specific examples of how to search
- Offer to help them get started with a search

FOR UNCLEAR MESSAGES:
- Ask clarifying questions
- Offer multiple ways you can assist
- Stay positive and helpful

IMPORTANT RULES:
- Keep responses to 2-3 sentences max for better conversational flow
- Don't immediately pitch specific performers unless they're clearly searching
- Be natural and human-like, avoid robotic responses
- If they seem ready to search, gently encourage it but don't force it
- Match their energy level and communication style

Generate a natural, helpful response:`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      temperature: 0.7, // Slightly more creative for natural conversation
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.choices[0]?.message?.content || ''
    
    // Detect if the response is encouraging a search
    const shouldTransitionToSearch = responseText.toLowerCase().includes('search') || 
                                   responseText.toLowerCase().includes('find') ||
                                   responseText.toLowerCase().includes('looking for')

    console.log('💬 Conversational Response Generated:', {
      length: responseText.length,
      shouldTransitionToSearch
    })

    return {
      response: responseText,
      shouldTransitionToSearch
    }

  } catch (error) {
    console.error('Conversational response error:', error)
    
    // Fallback responses based on intent
    const fallbackResponses = {
      greeting: "Hi there! I'm Alex, your casting assistant. I help directors find amazing stunt performers for their projects. What kind of production are you working on?",
      conversation: "I'd be happy to help you with that! Is there anything specific about stunt casting or our platform that I can assist you with?",
      help: "I'm here to help you find the perfect stunt performers for your project. You can search by location, skills, physical attributes, and more. What kind of talent are you looking for?",
      search: "Let me help you find the right performers for your project. What specific requirements do you have in mind?"
    }

    return {
      response: fallbackResponses[intentAnalysis.intent] || fallbackResponses.conversation,
      shouldTransitionToSearch: false
    }
  }
}
