/**
 * 🚀 MEMORY OPTIMIZED: Ultra-lightweight OpenAI API calls
 * Replaces heavy OpenAI client with simple fetch calls
 * Memory usage: ~1KB vs ~10MB per client
 */

interface OpenAIMessage {
  role: 'user' | 'system' | 'assistant'
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  max_tokens?: number
  temperature?: number
  response_format?: { type: string }
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/**
 * Ultra-lightweight OpenAI API call
 * No connection pooling, no caching, no bloat
 */
export async function callOpenAI(request: OpenAIRequest): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }
    
    const data: OpenAIResponse = await response.json()
    return data.choices[0]?.message?.content || ''
    
  } catch (error) {
    console.error('OpenAI fetch error:', error)
    throw error
  }
}

/**
 * Helper for JSON mode responses
 */
export async function callOpenAIJSON(request: Omit<OpenAIRequest, 'response_format'>): Promise<any> {
  const response = await callOpenAI({
    ...request,
    response_format: { type: 'json_object' }
  })
  
  try {
    return JSON.parse(response)
  } catch (parseError) {
    console.error('Failed to parse OpenAI JSON response:', response)
    throw new Error('Invalid JSON response from OpenAI')
  }
}
