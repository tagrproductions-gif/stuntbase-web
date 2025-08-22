import React from 'react'

interface Performer {
  name: string
  location?: string
  physicalStats?: string
  skills?: string
  experience?: string
  whyPerfect?: string
}

interface ParsedResponse {
  type: 'performers' | 'conversation' | 'text'
  data: Performer[] | string
  intro?: string
  outro?: string
}

// Flexible AI response parser
function parseAIResponse(text: string): ParsedResponse {
  try {
    // Split text into sections by performer emoji
    const sections = text.split(/(?=🎬)/g).filter(section => section.trim())
    
    // Check if we have performer sections
    const performerSections = sections.filter(section => section.includes('🎬'))
    
    if (performerSections.length > 0) {
      const performers: Performer[] = []
      
      for (const section of performerSections) {
        const performer: Performer = { name: '' }
        const lines = section.split('\n').map(line => line.trim()).filter(line => line)
        
        for (const line of lines) {
          if (line.includes('🎬')) {
            performer.name = line.replace(/🎬\s*/, '').trim()
          } else if (line.includes('📍')) {
            performer.location = line.replace(/📍\s*/, '').trim()
          } else if (line.includes('⭐')) {
            // Handle both "Key Skills:" and just the emoji
            performer.skills = line.replace(/⭐\s*(Key Skills:\s*)?/, '').trim()
          } else if (line.includes('🎥')) {
            // Handle both "Experience:" and just the emoji
            performer.experience = line.replace(/🎥\s*(Experience:\s*)?/, '').trim()
          } else if (line.includes('✨')) {
            // Handle both "Why Perfect:" and just the emoji
            performer.whyPerfect = line.replace(/✨\s*(Why Perfect:\s*)?/, '').trim()
          }
        }
        
        if (performer.name) {
          performers.push(performer)
        }
      }
      
      if (performers.length > 0) {
        // Extract intro text (everything before first 🎬)
        const introMatch = text.match(/^([\s\S]*?)(?=🎬)/)
        const intro = introMatch ? introMatch[1].trim() : undefined
        
        // Extract outro text (everything after last performer section)
        const lastPerformerIndex = text.lastIndexOf('🎬')
        const afterLastPerformer = lastPerformerIndex !== -1 ? 
          text.substring(lastPerformerIndex).split(/\n\s*\n/)[1] : undefined
        const outro = afterLastPerformer?.trim()
        
        return {
          type: 'performers',
          data: performers,
          intro,
          outro
        }
      }
    }
    
    // Check if it's a pure conversational response (no emojis, shorter)
    if (text.length < 300 && !text.includes('🎬') && !text.includes('📍')) {
      return { type: 'conversation', data: text }
    }
    
    // Fallback to plain text
    return { type: 'text', data: text }
    
  } catch (error) {
    console.warn('AI response parsing failed, using fallback:', error)
    return { type: 'text', data: text }
  }
}

// Component to render parsed AI response
export function AIResponse({ content, isTyping = false }: { content: string, isTyping?: boolean }) {
  const parsed = parseAIResponse(content)
  
  // Render based on parsed type
  switch (parsed.type) {
    case 'performers':
      return <PerformerResponse performers={parsed.data as Performer[]} intro={parsed.intro} outro={parsed.outro} isTyping={isTyping} />
    
    case 'conversation':
      return <ConversationResponse text={parsed.data as string} />
    
    default:
      return <FallbackResponse text={parsed.data as string} />
  }
}

function PerformerResponse({ performers, intro, outro, isTyping = false }: { 
  performers: Performer[], 
  intro?: string, 
  outro?: string,
  isTyping?: boolean
}) {
  return (
    <div className="space-y-4">
      {intro && (
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">{intro}</p>
      )}
      
      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎬</span>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{performer.name}</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              {performer.location && (
                <div className="flex items-start gap-2">
                  <span className="text-base">📍</span>
                  <span className="text-gray-700 dark:text-gray-300">{performer.location}</span>
                </div>
              )}
              
              {performer.skills && (
                <div className="flex items-start gap-2">
                  <span className="text-base">⭐</span>
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Key Skills: </span>
                    <span className="text-gray-700 dark:text-gray-300">{performer.skills}</span>
                  </div>
                </div>
              )}
              
              {performer.experience && (
                <div className="flex items-start gap-2">
                  <span className="text-base">🎥</span>
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Experience: </span>
                    <span className="text-gray-700 dark:text-gray-300">{performer.experience}</span>
                  </div>
                </div>
              )}
              
              {performer.whyPerfect && (
                <div className="flex items-start gap-2">
                  <span className="text-base">✨</span>
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Why Perfect: </span>
                    <span className="text-gray-700 dark:text-gray-300">{performer.whyPerfect}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {outro && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-4 italic">{outro}</p>
      )}
    </div>
  )
}

function ConversationResponse({ text }: { text: string }) {
  return (
    <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
      {text}
    </div>
  )
}

function FallbackResponse({ text }: { text: string }) {
  // Original format with better styling
  return (
    <div className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
      {text}
    </div>
  )
}
