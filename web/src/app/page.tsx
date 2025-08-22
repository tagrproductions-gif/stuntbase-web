'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, User, Bot, Search, Users, Shield, MessageCircle, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [displayProfiles, setDisplayProfiles] = useState<Profile[]>([])

  const [showPhotos, setShowPhotos] = useState(false)
  const [photosVisible, setPhotosVisible] = useState(false)
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  // Carousel touch interaction states
  const [carouselOffset, setCarouselOffset] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [isManualControl, setIsManualControl] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [animationStartTime, setAnimationStartTime] = useState(Date.now())
  const [isDragging, setIsDragging] = useState(false)
  
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const initialOffset = useRef<number>(0)
  const currentOffsetRef = useRef<number>(0)
  const animationRef = useRef<number>(0)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  // Check if user was redirected after profile deletion
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShowDeleteSuccess(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowDeleteSuccess(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
      }
    }
  }, [])

  // Keep ref in sync with state
  useEffect(() => {
    currentOffsetRef.current = carouselOffset
  }, [carouselOffset])

  // Fetch random profiles for carousel
  useEffect(() => {
    const fetchCarouselProfiles = async () => {
      try {
        const response = await fetch('/api/search?limit=8&sortBy=random')
        if (response.ok) {
          const data = await response.json()
          // Shuffle the profiles to get random order
          const shuffled = [...(data.profiles || [])].sort(() => Math.random() - 0.5)
          const profiles = shuffled.slice(0, 6)
          setCarouselProfiles(profiles)
          
          // Generate display profiles for carousel (this only happens once)
          let displayProfilesArray: Profile[] = []
          if (profiles.length <= 1) {
            // If only 1 profile, duplicate it with spacing
            displayProfilesArray = [...profiles, ...profiles]
          } else if (profiles.length <= 3) {
            // For small arrays, interleave to avoid adjacency
            const shuffledAgain = [...profiles].sort(() => Math.random() - 0.5)
            displayProfilesArray = [...profiles, ...shuffledAgain]
          } else {
            // For larger arrays, add a rotated version to avoid last->first adjacency
            const rotated = [...profiles.slice(1), profiles[0]]
            displayProfilesArray = [...profiles, ...rotated]
          }
          setDisplayProfiles(displayProfilesArray)
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
      await new Promise(resolve => setTimeout(resolve, 3)) // Much faster - 3ms per character
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
    
    // Hide photos when starting new message
    setPhotosVisible(false)
    setShowPhotos(false)

    // On mobile, immediately trigger full-screen chat for first message
    if (!hasSearched && window.innerWidth < 768) {
      // Save current scroll position before transition
      if (messagesContainerRef.current) {
        setScrollPosition(messagesContainerRef.current.scrollTop)
      }
      setHasSearched(true)
    }

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
        if (response.status === 401) {
          // User is not authenticated - redirect to signup
          router.push('/auth/signup')
          return
        }
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Update search state and profiles (for desktop or if not already set)
      if (!hasSearched) {
        setHasSearched(true)
      }
      setProfiles(data.profiles || [])
      
      // Start typing animation
      await typeMessage(data.response)
      
      // Add final message after typing is complete
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      
      // Show photos after a brief delay if we have results
      if (data.profiles && data.profiles.length > 0) {
        setTimeout(() => {
          setShowPhotos(true)
          // Small delay for smooth fade-in
          setTimeout(() => setPhotosVisible(true), 100)
        }, 500)
      }

    } catch (error) {
      console.error('Chat error:', error)
      // Ensure chat view is shown even on error (for desktop or if not already set)
      if (!hasSearched) {
        setHasSearched(true)
      }
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



  // Photo interaction handler
  const handleProfileSelect = (index: number) => {
    setSelectedProfileIndex(index)
  }

  // Calculate current animation position based on time elapsed
  const getCurrentAnimationPosition = () => {
    const elapsed = Date.now() - animationStartTime
    const animationDuration = 30000 // 30 seconds for full cycle
    const progress = (elapsed % animationDuration) / animationDuration
    return progress * -50 // -50% is the full translation (from CSS)
  }

  // Carousel touch handlers for mobile
  const handleCarouselTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    
    e.preventDefault() // Prevent scrolling during touch
    
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
    
    // Capture current animation position
    const currentPosition = getCurrentAnimationPosition()
    initialOffset.current = currentPosition
    currentOffsetRef.current = currentPosition
    
    setCarouselOffset(currentPosition)
    setIsCarouselPaused(true)
    setIsManualControl(true)
    setIsDragging(true)
    
    // Clear any existing pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
    }
  }

  const handleCarouselTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return
    
    e.preventDefault()
    touchEndX.current = e.touches[0].clientX
    
    // Calculate drag distance and convert to percentage
    const dragDistance = touchStartX.current - touchEndX.current
    const containerWidth = carouselRef.current?.offsetWidth || 1000
    const dragPercent = (dragDistance / containerWidth) * 100
    
    // Apply real-time drag feedback
    const newOffset = initialOffset.current - dragPercent
    currentOffsetRef.current = newOffset
    setCarouselOffset(newOffset)
  }

  const handleCarouselTouchEnd = () => {
    if (!isMobile || !isDragging) return
    
    setIsDragging(false)
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 30 // Reduced for better responsiveness
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // Apply momentum based on swipe speed/distance
    let finalOffset = currentOffsetRef.current
    
    if (isLeftSwipe) {
      // Add extra momentum for left swipe
      finalOffset -= 5
    } else if (isRightSwipe) {
      // Add extra momentum for right swipe  
      finalOffset += 5
    }
    
    currentOffsetRef.current = finalOffset
    setCarouselOffset(finalOffset)

    // Resume auto-scroll after a delay
    pauseTimeoutRef.current = setTimeout(() => {
      // Use the ref value to get the actual current position
      const currentPos = currentOffsetRef.current
      const normalizedPos = ((currentPos % 50) + 50) % 50 // Handle negative values
      const newProgress = normalizedPos / 50
      const newStartTime = Date.now() - (newProgress * 30000)
      
      setAnimationStartTime(newStartTime)
      setIsCarouselPaused(false)
      setIsManualControl(false)
    }, 2000) // Reduced timeout for faster resume
    
    // Reset touch coordinates
    touchStartX.current = 0
    touchEndX.current = 0
  }

  // Restore scroll position after transition to full-screen
  useEffect(() => {
    if (hasSearched && messagesContainerRef.current && scrollPosition > 0) {
      // Small delay to allow transition to complete
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = scrollPosition
        }
      }, 100)
    }
  }, [hasSearched, scrollPosition])

  // Mobile viewport handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name=viewport]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }

      // Handle mobile keyboard resize
      const handleResize = () => {
        if (window.innerWidth < 768) {
          // Update CSS custom property for real viewport height
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
        }
      }

      handleResize()
      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleResize)
      }
    }
  }, [])

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

      <div className={`transition-all duration-700 ease-in-out ${
        hasSearched 
          ? 'mobile-chat-container min-h-0 pb-24' 
          : 'max-w-4xl mx-auto min-h-[60vh]'
      }`}>

        {/* Main Chat Area */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col ${
          hasSearched 
            ? 'w-full h-full'
            : 'w-full px-4 py-8'
        }`}>
          {/* Header - only show when not searched */}
          {!hasSearched && (
            <div className="text-center mb-4 sm:mb-6 px-4">
              <div className="max-w-none mx-auto">
                <h1 className="reveal" style={{
                  fontSize: 'clamp(1.5rem, 6vw, 3.5rem)',
                  fontWeight: '900',
                  lineHeight: '1.1',
                  background: 'var(--title-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '1.5rem'
                }}>
                  <span className="block sm:inline">Find Stunt Performers</span>
                  <span className="block sm:inline sm:ml-2">with AI</span>
                </h1>
                <p className="reveal reveal-1 text-muted-foreground max-w-2xl mx-auto" style={{
                  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                  lineHeight: '1.6',
                  marginBottom: '0'
                }}>
                  Natural language search powered by AI to find the perfect talent for your project
                </p>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className={`transition-all duration-700 ease-in-out ${
            hasSearched 
              ? 'flex-1 flex flex-col p-2 sm:p-4 h-full'
              : 'px-4 mt-4 sm:mt-8'
          }`}>
            <Card className={`${hasSearched ? 'flex-1 flex flex-col bg-transparent border-0 shadow-none' : 'depth-card'}`}>
              <CardContent className={`${hasSearched ? 'p-2 sm:p-4 flex-1 flex flex-col h-full' : 'p-4 sm:p-6'}`}>
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className={`space-y-4 overflow-y-auto ${hasSearched ? 'flex-1 pb-20 min-h-0' : 'max-h-96 mb-4 sm:mb-6'}`}
              >
                {messages.length === 0 && !hasSearched && (
                  <div className="text-center py-8 text-muted-foreground reveal reveal-3">
                    <div className="w-16 h-16 mx-auto mb-4 relative float">
                      <Bot className="w-16 h-16 text-primary drop-shadow-lg" style={{
                        filter: 'drop-shadow(0 0 20px rgba(196, 95, 60, 0.4))'
                      }} />
                    </div>
                    <p className="text-lg font-medium">You Search, I'll Pitch</p>
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
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-card text-card-foreground shadow-md'
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
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center gentle-pulse">
                      <Bot className="w-5 h-5 text-primary-foreground" />
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
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
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

                {/* Organic Photo Results - Fade in after chat message */}
                {showPhotos && profiles.length > 0 && (
                  <div className={`mt-4 transition-all duration-1000 ease-out ${
                    photosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profiles.map((profile, index) => (
                        <div 
                          key={profile.id}
                          className="group cursor-pointer"
                          onClick={() => handleProfileSelect(index)}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
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
                                    <User className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                );
                              })()}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                                <h4 className="font-semibold text-xs leading-tight mb-1 profile-overlay-text line-clamp-1">
                                  {profile.full_name}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-white/80">
                                  {(profile.height_feet || profile.height_inches) && (
                                    <span className="bg-black/30 px-1 py-0.5 rounded text-xs">
                                      {formatHeight(profile.height_feet || 0, profile.height_inches || 0)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input - Only show when NOT searched (homepage) */}
              {!hasSearched && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 reveal reveal-4">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="I need a 5'8 martial artist in ATL"
                      disabled={loading}
                      className="w-full focus-glow text-base py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-all duration-500 shadow-lg"
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="button-enhanced px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-medium shadow-xl w-full sm:w-auto min-h-[48px] touch-manipulation"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Send Message</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Input Bar - Only show after chat starts */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={hasSearched ? "Ask about more performers..." : "I need a 5'8 martial artist in ATL"}
                disabled={loading}
                className="w-full text-base py-3 px-4 pr-12 rounded-full bg-background border-2 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-all duration-300 shadow-lg focus:shadow-xl"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation shrink-0"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Compact Feature Widgets - only show when not searched */}
      {!hasSearched && (
        <div className="max-w-2xl mx-auto px-4 mt-2 sm:-mt-4 pb-4 sm:pb-6 reveal reveal-2">
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
      {!hasSearched && displayProfiles.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-6 reveal reveal-3">
          <div 
            className="profile-carousel"
            onTouchStart={handleCarouselTouchStart}
            onTouchMove={handleCarouselTouchMove}
            onTouchEnd={handleCarouselTouchEnd}
            ref={carouselRef}
          >
            <div 
              className={`carousel-track ${isManualControl ? 'manual-control' : ''}`}
              style={{
                animationPlayState: isCarouselPaused ? 'paused' : 'running',
                ...(isManualControl && {
                  animation: 'none',
                  transform: `translateX(${carouselOffset}%)`,
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                })
              }}
            >
              {/* Display pre-generated profiles to avoid re-rendering on input changes */}
              {displayProfiles.map((profile, index) => (
                <div key={`${profile.id}-${index}`} className="carousel-item">
                  <Link href={`/profile/${profile.id}`}>
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
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Photo Browser */}
      {selectedProfileIndex !== null && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          {/* Photo Browser Header */}
          <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedProfileIndex(null)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Chat
              </Button>
              <div className="text-sm text-muted-foreground">
                {selectedProfileIndex + 1} of {profiles.length}
              </div>
            </div>
          </div>

          {/* Photo Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {profiles[selectedProfileIndex] && (
              <div className="max-w-lg mx-auto">
                <Card className="overflow-hidden depth-card">
                  <div className="aspect-[4/5] relative bg-muted">
                    {(() => {
                      const profile = profiles[selectedProfileIndex];
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
                          <User className="w-16 h-16 text-muted-foreground" />
                        </div>
                      );
                    })()}
                  </div>
                  
                  <CardContent className="p-4">
                    <h2 className="text-xl font-bold mb-2">{profiles[selectedProfileIndex].full_name}</h2>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{profiles[selectedProfileIndex].location}</p>
                      <div className="flex gap-2">
                        {(profiles[selectedProfileIndex].height_feet || profiles[selectedProfileIndex].height_inches) && (
                          <span className="bg-primary/10 px-2 py-1 rounded">
                            {formatHeight(profiles[selectedProfileIndex].height_feet || 0, profiles[selectedProfileIndex].height_inches || 0)}
                          </span>
                        )}
                        {profiles[selectedProfileIndex].weight_lbs && (
                          <span className="bg-primary/10 px-2 py-1 rounded">
                            {profiles[selectedProfileIndex].weight_lbs} lbs
                          </span>
                        )}
                        {profiles[selectedProfileIndex].experience_years && (
                          <span className="bg-primary/10 px-2 py-1 rounded">
                            {profiles[selectedProfileIndex].experience_years}y exp
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Link href={`/profile/${profiles[selectedProfileIndex].id}`} className="flex-1">
                        <Button className="w-full">View Full Profile</Button>
                      </Link>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (selectedProfileIndex > 0) {
                            setSelectedProfileIndex(selectedProfileIndex - 1)
                          }
                        }}
                        disabled={selectedProfileIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (selectedProfileIndex < profiles.length - 1) {
                            setSelectedProfileIndex(selectedProfileIndex + 1)
                          }
                        }}
                        disabled={selectedProfileIndex === profiles.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  )
}

