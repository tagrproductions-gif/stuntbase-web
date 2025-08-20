'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, User, Bot, Search, Users, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navigation/navbar'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Profile {
  id: string
  full_name: string
  location: string
  bio: string
  experience_years: number
  height_feet: number
  height_inches: number
  weight_lbs: number
  profile_photos: any[]
}

// Helper function to format height from feet and inches
function formatHeight(feet: number, inches: number): string {
  return inches > 0 ? `${feet}'${inches}"` : `${feet}'`;
}

// Helper function to get primary photo (same logic as profile page)
function getPrimaryPhoto(profile: Profile) {
  return profile.profile_photos?.find((p: any) => p.is_primary) || profile.profile_photos?.[0];
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [carouselProfiles, setCarouselProfiles] = useState<Profile[]>([])
  const searchParams = useSearchParams()

  // Check if user was redirected after profile deletion
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShowDeleteSuccess(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowDeleteSuccess(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Fetch random profiles for carousel
  useEffect(() => {
    const fetchCarouselProfiles = async () => {
      try {
        const response = await fetch('/api/search?limit=8&sortBy=random')
        if (response.ok) {
          const data = await response.json()
          // Shuffle the profiles to get random order
          const shuffled = [...(data.profiles || [])].sort(() => Math.random() - 0.5)
          setCarouselProfiles(shuffled.slice(0, 6))
        }
      } catch (error) {
        console.error('Error fetching carousel profiles:', error)
      }
    }
    
    if (!hasSearched) {
      fetchCarouselProfiles()
    }
  }, [hasSearched])

  // Typing animation function
  const typeMessage = async (text: string) => {
    setIsTyping(true)
    setTypingText('')
    
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10)) // Faster speed - 10ms per character
      setTypingText(text.slice(0, i))
    }
    
    setIsTyping(false)
    setTypingText('')
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    // Don't set hasSearched here - wait for API response

    // Add user message to chat
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(updatedMessages)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Now show split screen and update profiles immediately
      setHasSearched(true)
      setProfiles(data.profiles || [])
      
      // Start typing animation
      await typeMessage(data.response)
      
      // Add final message after typing is complete
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])

    } catch (error) {
      console.error('Chat error:', error)
      setHasSearched(true)
      const errorMessage = 'Sorry, I encountered an error. Please try again.'
      
      await typeMessage(errorMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Animated Background */}
      <div className="animated-bg"></div>
      <Navbar />


      {/* Success Message for Profile Deletion */}
      {showDeleteSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Profile Successfully Deleted</p>
              <p className="text-sm text-green-600">
                Your profile data has been removed. You can create a new profile anytime by signing up again.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row transition-all duration-300 ${hasSearched ? 'h-[calc(100vh-4rem)]' : 'max-w-4xl mx-auto min-h-[60vh]'}`}>
        {/* Main Chat Area */}
        <div className={`transition-all duration-300 flex flex-col ${hasSearched ? 'lg:w-1/2 w-full h-full border-r border-border' : 'w-full px-4 py-8'}`}>
          {/* Header - only show when not searched */}
          {!hasSearched && (
            <div className="text-center mb-6 px-4">
              <div className="max-w-none mx-auto">
                <h1 className="reveal" style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)',
                  fontWeight: '900',
                  lineHeight: '1.2',
                  background: 'var(--title-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '1.5rem',
                  whiteSpace: 'nowrap'
                }}>
                  Find Stunt Performers with AI
                </h1>
                <p className="reveal reveal-1" style={{
                  fontSize: '1rem',
                  color: '#888888',
                  fontWeight: 'normal',
                  lineHeight: '1.6',
                  marginBottom: '0'
                }}>
                  Natural language search powered by AI to find the perfect talent for your project
                </p>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className={`${hasSearched ? 'flex-1 flex flex-col p-4' : 'px-4 mt-8'}`}>
            <Card className={`${hasSearched ? 'flex-1 flex flex-col' : 'depth-card'}`}>
              <CardContent className={`${hasSearched ? 'p-4 flex-1 flex flex-col' : 'p-6'}`}>
              {/* Messages */}
              <div className={`space-y-4 mb-6 overflow-y-auto ${hasSearched ? 'flex-1' : 'max-h-96'}`}>
                {messages.length === 0 && !hasSearched && (
                  <div className="text-center py-8 text-muted-foreground reveal reveal-3">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-primary float" />
                    <p className="text-lg font-medium">Start your search...</p>
                    <p className="text-sm mt-2 opacity-75">Try: "I need a martial artist for an action sequence in Atlanta"</p>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-card text-card-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Show typing animation when isTyping */}
                {isTyping && (
                  <div className="flex items-start space-x-3 justify-start reveal">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center gentle-pulse">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-card text-card-foreground px-4 py-2 rounded-lg max-w-xs lg:max-w-md shadow-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {typingText}<span className="animate-pulse text-primary">|</span>
                      </p>
                      {!typingText && (
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {loading && !isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-card px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-3 reveal reveal-4">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe the performer you're looking for..."
                    disabled={loading}
                    className="w-full focus-glow text-base py-4 px-6 pr-20 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-all duration-500 shadow-lg"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="button-enhanced px-8 py-4 rounded-2xl text-white font-medium shadow-xl"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Panel - only show after search */}
        {hasSearched && (
          <div className="lg:w-1/2 w-full h-full flex flex-col lg:border-l lg:border-t-0 border-t border-border reveal">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-orange-500/5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                {profiles.length > 0 ? `Found ${profiles.length} Performers` : 'No Results'}
            </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {profiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {profiles.map((profile, index) => (
                    <Card 
                      key={profile.id} 
                      className="overflow-hidden group depth-card reveal"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animationDuration: '600ms',
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="relative">
                        {/* Main Photo */}
                        <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                          {(() => {
                            const primaryPhoto = getPrimaryPhoto(profile);
                            return primaryPhoto ? (
                              <Image
                                src={primaryPhoto.file_path}
                                alt={profile.full_name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <User className="w-16 h-16 text-muted-foreground" />
                              </div>
                            );
                          })()}
                          
                          {/* Gradient overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Name and Location overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h3 className="font-bold text-lg leading-tight mb-1 profile-overlay-text">{profile.full_name}</h3>
                            <p className="text-sm text-white/90 mb-2 profile-overlay-text-90">{profile.location}</p>
                            
                            {/* Physical Stats */}
                            <div className="flex items-center space-x-2 text-xs text-white/80 profile-overlay-text-80">
                              {(profile.height_feet || profile.height_inches) && (
                                <span className="bg-black/30 px-2 py-1 rounded backdrop-blur-sm font-medium">
                                  {formatHeight(profile.height_feet || 0, profile.height_inches || 0)}
                                </span>
                              )}
                              {profile.weight_lbs && (
                                <span className="bg-black/30 px-2 py-1 rounded backdrop-blur-sm font-medium">
                                  {profile.weight_lbs} lbs
                                </span>
                              )}
                              {profile.experience_years && (
                                <span className="bg-black/30 px-2 py-1 rounded backdrop-blur-sm font-medium">
                                  {profile.experience_years}y exp
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <CardContent className="p-3">
                          <Link href={`/profile/${profile.id}`} className="block">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                              View Profile
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : messages.length > 1 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>No performers match your criteria.</p>
                  <p className="text-sm mt-2">Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          </div>
        )}
          </div>

      {/* Compact Feature Widgets - only show when not searched */}
      {!hasSearched && (
        <div className="max-w-2xl mx-auto px-4 -mt-4 pb-6 reveal reveal-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg mb-2 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Profiles</h3>
              <p className="text-xs text-muted-foreground text-center">Detailed performer data</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg mb-2 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">AI Search</h3>
              <p className="text-xs text-muted-foreground text-center">Natural language queries</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg mb-2 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Verified</h3>
              <p className="text-xs text-muted-foreground text-center">Professional credentials</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Carousel - only show when not searched */}
      {!hasSearched && carouselProfiles.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-6 reveal reveal-3">
          <div className="profile-carousel">
            <div className="carousel-track">
              {/* Create seamless loop avoiding back-to-back duplicates */}
              {(() => {
                if (carouselProfiles.length <= 1) {
                  // If only 1 profile, duplicate it with spacing
                  return [...carouselProfiles, ...carouselProfiles];
                } else if (carouselProfiles.length <= 3) {
                  // For small arrays, interleave to avoid adjacency
                  const shuffled = [...carouselProfiles].sort(() => Math.random() - 0.5);
                  return [...carouselProfiles, ...shuffled];
                } else {
                  // For larger arrays, add a rotated version to avoid last->first adjacency
                  const rotated = [...carouselProfiles.slice(1), carouselProfiles[0]];
                  return [...carouselProfiles, ...rotated];
                }
              })().map((profile, index) => (
                <div key={`${profile.id}-${index}`} className="carousel-item">
                  <Card className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300">
                    <div className="aspect-[3/4] relative bg-muted">
                      {(() => {
                        const primaryPhoto = getPrimaryPhoto(profile);
                        return primaryPhoto ? (
                          <Image
                            src={primaryPhoto.file_path}
                            alt={profile.full_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <User className="w-12 h-12 text-muted-foreground" />
                          </div>
                        );
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-semibold text-sm leading-tight mb-1 profile-overlay-text">{profile.full_name}</h3>
                        <p className="text-xs text-white/80 profile-overlay-text-80">{profile.location}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}