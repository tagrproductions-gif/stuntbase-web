import { ChatMessage } from '../types'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-web-app-url.com'

export class ChatService {
  static async sendMessage(message: string, conversationHistory: ChatMessage[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get chat response')
      }

      const data = await response.json()
      return {
        response: data.response,
        profiles: data.profiles || []
      }
    } catch (error) {
      console.error('Chat service error:', error)
      throw error
    }
  }
}
