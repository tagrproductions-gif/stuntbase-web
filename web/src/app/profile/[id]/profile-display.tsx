'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navigation/navbar'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Shield, 
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { findLocationByValue } from '@/lib/constants/locations'
import { getEthnicAppearanceLabel } from '@/lib/constants/ethnic-appearance'

interface ProfileDisplayProps {
  profile: any // Full profile with relations
  isOwner: boolean
}

export function ProfileDisplay({ profile, isOwner }: ProfileDisplayProps) {
  const originalPhotos = profile.profile_photos || []
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Helper function to get location display name
  const getLocationDisplay = (structuredLocation: string | null, fallbackLocation: string | null) => {
    if (structuredLocation) {
      const locationData = findLocationByValue(structuredLocation)
      return locationData?.label || structuredLocation
    }
    return fallbackLocation
  }
  
  // Put primary photo in the middle index of the array (only for 5 photos)
  const arrangePhotosWithPrimaryInCenter = (photos: any[]) => {
    if (photos.length <= 1) return { photos, primaryIndex: 0 }
    
    // For less than 5 photos, use simple left-to-right ordering
    if (photos.length < 5) {
      const originalPrimaryIndex = photos.findIndex(photo => photo.is_primary)
      const primaryIndex = originalPrimaryIndex === -1 ? 0 : originalPrimaryIndex
      return { photos, primaryIndex }
    }
    
    // For exactly 5 photos, use the center arrangement logic
    const originalPrimaryIndex = photos.findIndex(photo => photo.is_primary)
    
    if (originalPrimaryIndex === -1) {
      // Treat the first photo as primary if none is marked
      const firstPhoto = photos[0]
      const otherPhotos = photos.slice(1)
      
      const middleIndex = Math.floor(photos.length / 2)
      const arranged = new Array(photos.length)
      arranged[middleIndex] = firstPhoto
      
      let leftIndex = middleIndex - 1
      let rightIndex = middleIndex + 1
      
      for (let i = 0; i < otherPhotos.length; i++) {
        if (i % 2 === 0 && leftIndex >= 0) {
          arranged[leftIndex] = otherPhotos[i]
          leftIndex--
        } else if (rightIndex < photos.length) {
          arranged[rightIndex] = otherPhotos[i]
          rightIndex++
        } else if (leftIndex >= 0) {
          arranged[leftIndex] = otherPhotos[i]
          leftIndex--
        }
      }
      
      return { photos: arranged, primaryIndex: middleIndex }
    }
    
    const primaryPhoto = photos[originalPrimaryIndex]
    const otherPhotos = photos.filter((_, index) => index !== originalPrimaryIndex)
    
    // Calculate the middle index for the final array
    const middleIndex = Math.floor(photos.length / 2)
    
    // Create new array with primary photo in the middle position
    const arranged = new Array(photos.length)
    arranged[middleIndex] = primaryPhoto
    
    // Fill the remaining positions with other photos
    let leftIndex = middleIndex - 1
    let rightIndex = middleIndex + 1
    
    for (let i = 0; i < otherPhotos.length; i++) {
      if (i % 2 === 0 && leftIndex >= 0) {
        arranged[leftIndex] = otherPhotos[i]
        leftIndex--
      } else if (rightIndex < photos.length) {
        arranged[rightIndex] = otherPhotos[i]
        rightIndex++
      } else if (leftIndex >= 0) {
        arranged[leftIndex] = otherPhotos[i]
        leftIndex--
      }
    }
    
    return { photos: arranged, primaryIndex: middleIndex }
  }
  
  const { photos: allPhotos, primaryIndex } = arrangePhotosWithPrimaryInCenter(originalPhotos)
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(primaryIndex)
  const [isClient, setIsClient] = useState(false)
  const [viewportDimensions, setViewportDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 768, // Use mobile-first default
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Track viewport dimensions for dynamic sizing
  useEffect(() => {
    const updateViewportDimensions = () => {
      if (typeof window !== 'undefined') {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    }

    updateViewportDimensions()
    window.addEventListener('resize', updateViewportDimensions)
    return () => window.removeEventListener('resize', updateViewportDimensions)
  }, [])

  // Calculate dynamic dimensions based on viewport - optimized for mobile
  const getDynamicDimensions = () => {
    // Use client-side dimensions only after hydration to prevent mismatch
    if (!isClient) {
      // Default dimensions for SSR (desktop-first to prevent layout shifts)
      return {
        photoWidth: 220,
        photoHeight: 308,
        spacing: 154,
        activeScale: 1.25,
        inactiveScale: 0.9
      }
    }
    
    const { width, height } = viewportDimensions
    
    // Improved mobile-first photo sizing logic
    let photoWidth
    if (width < 640) {
      // Mobile: Use larger percentage of screen width for better visibility
      photoWidth = Math.max(180, Math.min(240, width * 0.45)) // 45% of viewport width, min 180px, max 240px
    } else if (width < 768) {
      // Tablet: Balanced sizing
      photoWidth = Math.max(200, Math.min(260, width * 0.35)) // 35% of viewport width
    } else {
      // Desktop: Use original logic
      photoWidth = Math.max(220, Math.min(280, width * 0.25)) // 25% of viewport width
    }
    
    const photoHeight = photoWidth * 1.4 // Maintain aspect ratio
    
    // Spacing between photos - adjusted for mobile
    const spacing = width < 640 ? photoWidth * 0.5 : photoWidth * 0.7 // Tighter spacing on mobile
    
    // Scale factors based on screen size - enhanced for mobile
    const activeScale = width < 640 ? 1.15 : width < 768 ? 1.2 : 1.25
    const inactiveScale = width < 640 ? 0.85 : width < 768 ? 0.9 : 0.9
    
    return {
      photoWidth,
      photoHeight,
      spacing,
      activeScale,
      inactiveScale
    }
  }

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)
  }

  // Touch gesture handling
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && allPhotos.length > 0) {
      nextPhoto()
    }
    if (isRightSwipe && allPhotos.length > 0) {
      prevPhoto()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        {/* Large Photo Carousel */}
        {allPhotos.length > 0 && (() => {
          const dimensions = getDynamicDimensions()
          const carouselHeight = Math.max(200, dimensions.photoHeight * dimensions.activeScale + 40) // Add padding
          
          return (
          <div 
            className="relative overflow-hidden bg-background"
            style={{ height: carouselHeight }}
          >
            <div className="flex items-center justify-center h-full">
              <div 
                ref={carouselRef}
                className="relative w-full max-w-6xl mx-auto"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex items-center justify-center px-4">
                  {allPhotos.map((photo: any, index: number) => {
                    const offset = index - currentPhotoIndex
                    const isActive = index === currentPhotoIndex
                    const dimensions = getDynamicDimensions()
                    
                    // Make background photos progressively smaller
                    let scale = dimensions.activeScale
                    let spacingMultiplier = 1 // Default spacing
                    
                    if (Math.abs(offset) === 1) {
                      scale = dimensions.inactiveScale * 0.95 // Slightly smaller for adjacent photos
                      spacingMultiplier = 1 // Normal spacing
                    } else if (Math.abs(offset) === 2) {
                      scale = dimensions.inactiveScale * 0.8 // Noticeably smaller for side photos
                      spacingMultiplier = 0.9 // Slightly tighter spacing
                    } else if (Math.abs(offset) >= 3) {
                      scale = dimensions.inactiveScale * 0.65 // Much smaller for far photos
                      spacingMultiplier = 0.75 // Much tighter spacing for smaller photos
                    } else if (!isActive) {
                      scale = dimensions.inactiveScale
                    }
                    
                    // Dynamic spacing based on photo size and position
                    let translateX = offset * dimensions.spacing * spacingMultiplier
                    
                    let zIndex = isActive ? 10 : Math.max(0, 5 - Math.abs(offset))
                    
                    // Keep full opacity but add lighting/dimming effects via overlay
                    let opacity = 1 // All photos at 100% opacity
                    let overlayOpacity = 0 // Darkness overlay for dimming effect
                    let blur = 0
                    
                    if (Math.abs(offset) === 0) {
                      overlayOpacity = 0 // Active photo - no dimming
                      blur = 0
                    } else if (Math.abs(offset) === 1) {
                      overlayOpacity = 0.15 // Adjacent photos - slight dimming
                      blur = 0.3
                    } else if (Math.abs(offset) === 2) {
                      overlayOpacity = 0.35 // Side photos - moderate dimming
                      blur = 0.7
                    } else if (Math.abs(offset) === 3) {
                      overlayOpacity = 0.55 // Far photos - heavy dimming
                      blur = 1.2
                    } else {
                      opacity = 0 // Photos too far away are invisible
                      blur = 2
                    }

                    return (
                      <div
                        key={photo.id}
                        className="absolute transition-all duration-700 ease-in-out cursor-pointer"
                        style={{
                          transform: `translateX(${translateX}px) scale(${scale})`,
                          zIndex,
                          opacity,
                          filter: `blur(${blur}px)`,
                        }}
                        onClick={() => setCurrentPhotoIndex(index)}
                      >
                        <div 
                          className="relative rounded-xl overflow-hidden shadow-md bg-card"
                          style={{
                            width: dimensions.photoWidth,
                            height: dimensions.photoHeight
                          }}
                        >
                          <Image
                            src={photo.file_path}
                            alt={`${profile.full_name} - Photo ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={Math.abs(offset) <= 1}
                          />
                          {!isActive && overlayOpacity > 0 && (
                            <div 
                              className="absolute inset-0 bg-black transition-all duration-700 ease-in-out pointer-events-none" 
                              style={{ opacity: overlayOpacity }}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            

            
            {isOwner && (
              <div className="absolute top-6 right-6 z-20">
                <Link href={`/profile/${profile.id}/edit`}>
                  <Button variant="secondary" className="shadow-lg">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
          )
        })()}

        {/* No Photos Placeholder */}
        {allPhotos.length === 0 && (
          <div className="h-[50vh] bg-background flex items-center justify-center relative border-b border-border">
            <div className="text-center text-muted-foreground">
              <User className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <h2 className="text-xl font-medium mb-1">No Photos Available</h2>
              <p className="text-sm">Photos will be displayed here once uploaded</p>
            </div>
            
            {isOwner && (
              <div className="absolute top-6 right-6">
                <Link href={`/profile/${profile.id}/edit`}>
                  <Button variant="secondary" className="shadow-lg">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Smaller Header Section */}
        <div className="bg-card px-6 py-6 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              {/* Smaller name */}
              <h1 className="text-3xl font-bold text-foreground mb-2">
                  {profile.full_name}
                </h1>
                
              {/* Location and status */}
              <div className="flex items-center justify-center gap-4 text-base text-muted-foreground mb-4">
                  {(profile.primary_location_structured || profile.location) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{getLocationDisplay(profile.primary_location_structured, profile.location)}</span>
                    </div>
                  )}
                  {profile.availability_status && (
                  <Badge variant={profile.availability_status === 'available' ? 'default' : 'secondary'} 
                         className="text-sm">
                      {profile.availability_status}
                    </Badge>
                  )}
              </div>
              
              {/* Action Buttons - All Links as Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {profile.resume_url && (
                  <Button size="default" variant="outline" className="border-2 shadow-lg" asChild>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Resume
                    </a>
                  </Button>
                )}
                {profile.email && (
                  <Button size="default" variant="outline" className="border-2 shadow-lg" asChild>
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Now
                    </a>
                  </Button>
                )}
                {profile.reel_url && (
                  <Button size="default" variant="outline" className="border-2 shadow-lg" asChild>
                    <a href={profile.reel_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Demo Reel
                    </a>
                  </Button>
                )}
                {profile.website && (
                  <Button size="default" variant="outline" className="border-2 shadow-lg" asChild>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
                {profile.imdb_url && (
                  <Button size="default" variant="outline" className="border-2 shadow-lg" asChild>
                    <a href={profile.imdb_url} target="_blank" rel="noopener noreferrer">
                      <Film className="mr-2 h-4 w-4" />
                      IMDB
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-foreground text-base leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Clean Professional Layout with Cards */}
        <div className="bg-background px-6 py-8 pb-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Contact Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.phone && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Mobile</span>
                          <span className="text-foreground">••••••••</span>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Email</span>
                          <span className="text-foreground">{profile.email}</span>
                        </div>
                      )}
                      {profile.union_status && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Union Status</span>
                          <span className="text-foreground">{profile.union_status}</span>
                        </div>
                      )}
                      {(profile.primary_location_structured || profile.location) && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Primary Location</span>
                          <span className="text-foreground">{getLocationDisplay(profile.primary_location_structured, profile.location)}</span>
                        </div>
                      )}
                      {(profile.secondary_location_structured || profile.secondary_location) && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Secondary Location</span>
                          <span className="text-foreground">{getLocationDisplay(profile.secondary_location_structured, profile.secondary_location)}</span>
                        </div>
                      )}
                      {profile.travel_radius && profile.travel_radius !== 'local' && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Travel Range</span>
                          <span className="text-foreground">
                            {profile.travel_radius === '50' ? 'Within 50 miles' :
                             profile.travel_radius === '100' ? 'Within 100 miles' :
                             profile.travel_radius === '200' ? 'Within 200 miles' :
                             profile.travel_radius === 'state' ? 'Statewide' :
                             profile.travel_radius === 'regional' ? 'Regional' :
                             profile.travel_radius === 'national' ? 'National' :
                             profile.travel_radius === 'international' ? 'International' :
                             profile.travel_radius}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.gender && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Identify as</span>
                          <span className="text-foreground">{profile.gender}</span>
                        </div>
                      )}
                      {profile.ethnicity && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Ethnic Appearance</span>
                          <span className="text-foreground">{getEthnicAppearanceLabel(profile.ethnicity)}</span>
                        </div>
                      )}

                      {profile.loan_out_status && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Loan Out?</span>
                          <span className="text-foreground">{profile.loan_out_status}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Card */}
                {profile.profile_skills && profile.profile_skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Skills & Specialties
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.profile_skills.map((skill: any) => (
                          <Badge
                            key={skill.id}
                            variant="outline"
                            className={`${getProficiencyColor(skill.proficiency_level)} text-sm`}
                          >
                            {skill.skills?.name || skill.skill_id} ({skill.proficiency_level})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}


              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Wardrobe Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Wardrobe Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                    {profile.hair_color && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Hair Color</span>
                        <span className="text-foreground">{profile.hair_color}</span>
                      </div>
                    )}
                  {(profile.height_feet || profile.height_inches) && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Height</span>
                        <span className="text-foreground">{profile.height_feet || 0}' {profile.height_inches || 0}"</span>
                    </div>
                  )}
                  {profile.weight_lbs && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="text-foreground">{profile.weight_lbs} lbs</span>
                      </div>
                    )}
                    {profile.shirt_neck && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Shirt (Neck)</span>
                        <span className="text-foreground">{profile.shirt_neck}</span>
                    </div>
                  )}
                    {profile.shirt_sleeve && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Shirt (Sleeve)</span>
                        <span className="text-foreground">{profile.shirt_sleeve}</span>
                    </div>
                  )}
                    {profile.pants_waist && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Pants (Waist)</span>
                        <span className="text-foreground">{profile.pants_waist}</span>
                    </div>
                  )}
                    {profile.pants_inseam && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Pants (Inseam)</span>
                        <span className="text-foreground">{profile.pants_inseam}</span>
                      </div>
                    )}
                    {profile.shoe_size && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Shoe</span>
                        <span className="text-foreground">{profile.shoe_size}</span>
                    </div>
                  )}
                    {profile.t_shirt_size && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">T-Shirt</span>
                        <span className="text-foreground">{profile.t_shirt_size}</span>
                    </div>
                  )}
                    {profile.hat_size && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Hat</span>
                        <span className="text-foreground">{profile.hat_size}</span>
                    </div>
                  )}
                    {profile.glove_size && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Glove</span>
                        <span className="text-foreground">{profile.glove_size}</span>
                      </div>
                    )}

                    {/* Gender-specific wardrobe */}
                    {profile.gender === 'Man' && (
                      <>
                        {profile.jacket_size && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Jacket Size</span>
                            <span className="text-foreground">{profile.jacket_size}</span>
                          </div>
                        )}
                        {profile.jacket_length && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Jacket Length</span>
                            <span className="text-foreground">{profile.jacket_length}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {profile.gender === 'Woman' && (
                      <>
                        {profile.pants_size && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Pants Size</span>
                            <span className="text-foreground">{profile.pants_size}</span>
                          </div>
                        )}
                        {profile.dress_size && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Dress Size</span>
                            <span className="text-foreground">{profile.dress_size}</span>
                          </div>
                        )}
                        {profile.underbust && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Underbust</span>
                            <span className="text-foreground">{profile.underbust}</span>
                          </div>
                        )}
                        {profile.hips && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Hips</span>
                            <span className="text-foreground">{profile.hips}</span>
                          </div>
                        )}
                        {profile.chest && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Chest</span>
                            <span className="text-foreground">{profile.chest}</span>
                          </div>
                        )}
                        {profile.waist && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Waist</span>
                            <span className="text-foreground">{profile.waist}</span>
                          </div>
                        )}
                      </>
                    )}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications Card */}
                {profile.profile_certifications && profile.profile_certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.profile_certifications.map((cert: any) => (
                          <Badge
                            key={cert.id}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          >
                            {cert.certifications?.name || cert.certification_id}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}