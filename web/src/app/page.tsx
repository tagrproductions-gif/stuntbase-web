'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Send, User, Bot, Search, Users, Shield, MessageCircle, Grid3X3, ChevronLeft, ChevronRight, Database } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navigation/navbar'
import { AIResponse } from '@/components/chat/ai-response'
import { useAuth } from '@/hooks/use-auth'
import { DatabaseSelectorDialog, DatabaseSelectorTrigger, DatabaseSelectorContent } from '@/components/ui/database-selector-dialog'

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

// 🎠 ULTRA-MINIMAL: Only what's needed for clickable photo carousel
interface CarouselProfile {
  id: string
  full_name: string
  photo_url: string
}

interface ProjectDatabase {
  id: string
  project_name: string
  description: string | null
  profiles: {
    full_name: string
    id: string
  }
}

// Helper function to format height from feet and inches
function formatHeight(feet: number, inches: number): string {
  return inches > 0 ? `${feet}'${inches}"` : `${feet}'`;
}

// 🎠 SIMPLIFIED: Direct photo URL access for carousel
function getProfilePhoto(profile: CarouselProfile) {
  return profile.photo_url;
}

// Helper function to get primary photo
function getPrimaryPhoto(profile: any) {
  return profile?.profile_photos?.find((p: any) => p.is_primary) || profile?.profile_photos?.[0]
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [carouselProfiles, setCarouselProfiles] = useState<CarouselProfile[]>([])
  const [displayProfiles, setDisplayProfiles] = useState<CarouselProfile[]>([])

  const [showPhotos, setShowPhotos] = useState(false)
  const [photosVisible, setPhotosVisible] = useState(false)
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [selectedDatabase, setSelectedDatabase] = useState<string>('global')
  const [projectDatabases, setProjectDatabases] = useState<ProjectDatabase[]>([])
  const [userProjects, setUserProjects] = useState<ProjectDatabase[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  
  // Carousel auto-scroll state
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  
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

  // Check for database parameter and pre-select project
  useEffect(() => {
    const databaseParam = searchParams.get('database')
    if (databaseParam && databaseParam !== 'global') {
      setSelectedDatabase(databaseParam)
    }
  }, [searchParams])







  // 🎠 ULTRA-LIGHTWEIGHT: Just fetch photos for clickable carousel
  useEffect(() => {
    const fetchCarouselProfiles = async () => {
      try {
        const response = await fetch('/api/carousel')
        if (response.ok) {
          const data = await response.json()
          const profiles = data.profiles || []
          
          // 🚀 MEMORY SAFE: Use the data exactly as-is, no complex processing
          setCarouselProfiles(profiles)
          setDisplayProfiles(profiles) // Simple direct assignment
        } else {
          console.warn('Carousel API unavailable - hiding carousel')
        }
      } catch (error) {
        console.error('Carousel fetch failed:', error)
      }
    }
    
    if (!hasSearched) {
      fetchCarouselProfiles()
    }
  }, [hasSearched])

  // Fetch project databases for selector - only when user is authenticated
  useEffect(() => {
    const fetchProjectDatabases = async () => {
      if (!user) {
        setUserProjects([])
        setProjectsLoading(false)
        return
      }
      
      setProjectsLoading(true)
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()
        if (data.projects) {
          setProjectDatabases(data.projects)
          // Only show user's own projects - we need to get current user ID
          // For now, we'll create a separate API endpoint to get user's own projects
          const userProjectsResponse = await fetch('/api/projects/my-projects')
          const userProjectsData = await userProjectsResponse.json()
          if (userProjectsData.projects) {
            setUserProjects(userProjectsData.projects)
            
            // Security check: if user has selected a project they don't own, reset to global
            if (selectedDatabase !== 'global') {
              const userOwnsSelectedProject = userProjectsData.projects.some(
                (project: ProjectDatabase) => project.id === selectedDatabase
              )
              if (!userOwnsSelectedProject) {
                console.warn('User tried to access project they do not own, resetting to global')
                setSelectedDatabase('global')
              }
            }
          } else {
            setUserProjects([])
            // If user has no projects, reset to global
            if (selectedDatabase !== 'global') {
              setSelectedDatabase('global')
            }
          }
        }
      } catch (error) {
        console.error('Error fetching project databases:', error)
        setUserProjects([])
      } finally {
        setProjectsLoading(false)
      }
    }

    if (!authLoading) {
      fetchProjectDatabases()
    }
  }, [user, authLoading])

  // Typing animation function
  const typeMessage = async (text: string) => {
    setIsTyping(true)
    setTypingText('')
    
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1)) // Even faster - 1ms per character
      setTypingText(text.slice(0, i))
      
      // Auto-scroll during typing on mobile
      if (messagesContainerRef.current && window.innerWidth < 768) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
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
      
      // Ensure proper scroll behavior after transition
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0 // Start fresh at top
        }
      }, 50) // Small delay to allow DOM update
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
          conversationHistory: messages,
          projectDatabaseId: selectedDatabase === 'global' ? null : selectedDatabase
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
          setTimeout(() => {
            setPhotosVisible(true)
            
            // Scroll to show profile cards with proper padding on mobile
            if (window.innerWidth < 768 && messagesContainerRef.current) {
              setTimeout(() => {
                if (messagesContainerRef.current) {
                  const container = messagesContainerRef.current
                  const maxScroll = container.scrollHeight - container.clientHeight
                  
                  // Leave some padding (80px) from the bottom to prevent cutting off under menu
                  const targetScroll = Math.max(0, maxScroll - 80)
                  
                  container.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                  })
                }
              }, 300) // Slight delay for smooth fade-in effect
            }
          }, 100)
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

  // Carousel hover handlers
  const handleCarouselMouseEnter = () => {
    setIsCarouselPaused(true)
  }

  const handleCarouselMouseLeave = () => {
    setIsCarouselPaused(false)
  }

  // Click handler for profile navigation
  const handleProfileClick = (profileId: string) => {
    // Navigate to profile page
    router.push(`/profile/${profileId}`)
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

  // Auto-scroll on mobile when messages change (but not during typing)
  useEffect(() => {
    if (!isTyping && window.innerWidth < 768 && messagesContainerRef.current && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current
          // Only scroll to bottom if no profile cards are showing
          if (!showPhotos) {
            container.scrollTop = container.scrollHeight
          }
          // If profile cards are showing, the specific scroll logic above handles it
        }
      }, 50)
    }
  }, [messages, isTyping, showPhotos])

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

      <div className={`transition-all duration-600 cubic-bezier(0.16, 1, 0.3, 1) ${
        hasSearched 
          ? 'xl:h-[calc(100vh-4rem)] xl:max-h-[calc(100vh-4rem)] xl:flex xl:pb-0 mobile-chat-container min-h-0 pb-24' 
          : 'max-w-4xl mx-auto min-h-[60vh] pt-0'
      }`}>

        {/* Main Chat Area */}
        <div className={`transition-all duration-600 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col ${
          hasSearched 
            ? 'xl:w-1/2 xl:h-full xl:border-r xl:border-border w-full h-full'
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
                <div className="reveal reveal-1 text-center max-w-2xl mx-auto" style={{
                  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                  lineHeight: '1.6',
                  marginBottom: '0'
                }}>
                  <div className="flex flex-col items-center gap-2">
                    <Link 
                      href="/profile/create" 
                      className="font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'var(--title-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Stunt Performers, Create a Profile
                    </Link>
                    <Link 
                      href="/profile/coordinator/create" 
                      className="font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'var(--title-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Stunt Coordinators, Create an AI Database
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className={`transition-all duration-600 cubic-bezier(0.16, 1, 0.3, 1) ${
            hasSearched 
              ? 'flex-1 flex flex-col h-full'
              : 'px-4 mt-4 sm:mt-8 lg:mt-6'
          }`}>
            <Card className={`${hasSearched ? 'flex-1 flex flex-col bg-transparent border-0 shadow-none xl:m-4 xl:shadow-md xl:bg-card xl:border xl:h-full xl:max-h-full' : 'depth-card'}`}>
              <CardContent className={`${hasSearched ? 'flex-1 flex flex-col p-2 sm:p-4 xl:p-6 xl:h-full xl:overflow-hidden' : 'p-4 sm:p-6'}`}>
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className={`space-y-4 overflow-y-auto ${hasSearched ? 'flex-1 xl:pb-4 pb-20 min-h-0 xl:max-h-[calc(100vh-16rem)]' : 'max-h-96 mb-4 sm:mb-6'}`}
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
                      <div className="bot-avatar">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div
                      className={`${
                        message.role === 'user'
                          ? 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-primary text-primary-foreground ml-auto'
                          : 'max-w-2xl px-4 py-3 rounded-lg bg-card text-card-foreground shadow-md'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <AIResponse content={message.content} />
                      )}
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
                    <div className="bot-avatar gentle-pulse">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="bg-card text-card-foreground px-4 py-3 rounded-lg max-w-2xl shadow-md">
                      {typingText ? (
                        <div className="animate-in fade-in duration-300">
                          <AIResponse content={typingText} isTyping={true} />
                        </div>
                      ) : (
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
                    <div className="bot-avatar">
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

                {/* Organic Photo Results - Only show on mobile/tablet, hidden on desktop split-screen */}
                {showPhotos && profiles.length > 0 && (
                  <div className={`xl:hidden mt-4 transition-all duration-1000 ease-out ${
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
                                <div className="text-xs mb-1 profile-overlay-text">
                                  {(profile.height_feet || profile.height_inches) && (
                                    <span className="mr-2">
                                      {formatHeight(profile.height_feet || 0, profile.height_inches || 0)}
                                    </span>
                                  )}
                                  {profile.weight_lbs && (
                                    <span>
                                      {profile.weight_lbs} lbs
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

              {/* Database Selector - Only show for users with projects */}
              {!hasSearched && user && userProjects.length > 0 && !projectsLoading && (
                <div className="mb-4 reveal reveal-2 flex justify-center">
                  <div className="w-full sm:w-64 h-10 relative">
                    {/* Database selector with smooth fade-in */}
                    <Select 
                      value={selectedDatabase} 
                      onChange={(e) => setSelectedDatabase(e.target.value)}
                      className="w-full bg-white/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-all duration-500 ease-out appearance-none bg-no-repeat bg-right pr-8"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="global">Entire Database</option>
                      {userProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}

              {/* Input - Only show when NOT searched (homepage) */}
              {!hasSearched && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 reveal reveal-4">
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

              {/* Desktop Input Bar - Fixed at bottom */}
              {hasSearched && (
                <div className="hidden xl:flex items-center gap-3 p-4 border-t border-border bg-card flex-shrink-0 animate-in slide-in-from-bottom-4 duration-500">
                  {user && userProjects.length > 0 && !projectsLoading && (
                    <div className="relative">
                      <Select 
                        value={selectedDatabase} 
                        onChange={(e) => setSelectedDatabase(e.target.value)}
                        className="w-48 text-sm appearance-none bg-no-repeat bg-right pr-8 transition-all duration-300"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '12px'
                        }}
                      >
                        <option value="global">Entire Database</option>
                        {userProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.project_name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about more performers..."
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
              )}
            </Card>
          </div>
        </div>

        {/* Desktop Profile Cards Panel - Right Side */}
        {hasSearched && (
          <div className="hidden xl:flex xl:w-1/2 xl:h-full xl:flex-col xl:overflow-hidden xl:bg-card xl:border-l xl:border-border">
            <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-foreground">
                {profiles.length > 0 ? `Found ${profiles.length} Performers` : 'Search Results'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {profiles.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {profiles.map((profile, index) => (
                    <div 
                      key={profile.id}
                      className={`group cursor-pointer ${
                        index < 9 ? 'opacity-0 animate-fade-in-card' : ''
                      }`}
                      style={index < 9 ? { animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' } : {}}
                      onClick={() => handleProfileClick(profile.id)}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                        <div className="aspect-[4/5] relative bg-muted">
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                                     <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                             <h3 className="font-semibold text-xs leading-tight mb-1 profile-overlay-text truncate">
                               {profile.full_name}
                             </h3>
                             {/* Height and Weight in pure white text - no background */}
                             <div className="text-xs mb-1 profile-overlay-text">
                               {(profile.height_feet || profile.height_inches) && (
                                 <span className="mr-2">
                                   {formatHeight(profile.height_feet || 0, profile.height_inches || 0)}
                                 </span>
                               )}
                               {profile.weight_lbs && (
                                 <span>
                                   {profile.weight_lbs} lbs
                                 </span>
                               )}
                             </div>
                             <p className="text-xs text-white/80 profile-overlay-text-80 truncate">
                               {profile.location}
                             </p>
                           </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="max-w-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Ready to Search</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a message to find performers and they'll appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Input Bar - Only show after chat starts on mobile/tablet */}
      {hasSearched && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={hasSearched ? "Ask about more performers..." : "I need a 5'8 martial artist in ATL"}
                disabled={loading}
                className={`w-full text-base py-3 px-4 rounded-full bg-background border-2 border-primary/20 hover:border-primary/40 focus:border-primary/60 transition-all duration-300 shadow-lg focus:shadow-xl ${
                  user && userProjects.length > 0 && !projectsLoading ? 'pr-16' : 'pr-4'
                }`}
              />
              {/* Database Selector Button - Only show for users with projects */}
              {user && userProjects.length > 0 && !projectsLoading && (
                <DatabaseSelectorDialog>
                  <DatabaseSelectorTrigger className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                    <Database className="w-4 h-4" />
                  </DatabaseSelectorTrigger>
                  <DatabaseSelectorContent
                    selectedDatabase={selectedDatabase}
                    userProjects={userProjects}
                    onDatabaseChange={setSelectedDatabase}
                  />
                </DatabaseSelectorDialog>
              )}
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
        <div className="max-w-2xl mx-auto px-4 mt-2 sm:mt-4 lg:mt-6 pb-4 sm:pb-6 reveal reveal-2">
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
            onMouseEnter={handleCarouselMouseEnter}
            onMouseLeave={handleCarouselMouseLeave}
            ref={carouselRef}
          >
            <div 
              className="carousel-track"
              style={{
                animationPlayState: isCarouselPaused ? 'paused' : 'running'
              }}
            >
              {/* 🎠 ULTRA-SIMPLE: Just clickable photo cards */}
              {displayProfiles.map((profile, index) => (
                <div key={`${profile.id}-${index}`} className="carousel-item">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    <Card className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                      <div className="aspect-[3/4] relative bg-muted">
                        <Image
                          src={profile.photo_url}
                          alt={profile.full_name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <h3 className="font-semibold text-sm leading-tight profile-overlay-text">{profile.full_name}</h3>
                        </div>
                      </div>
                    </Card>
                  </div>
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

