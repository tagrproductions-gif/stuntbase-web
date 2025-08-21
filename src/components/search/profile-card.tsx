import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Calendar, DollarSign, User, ExternalLink } from 'lucide-react'
// import { formatCurrency } from '@/lib/utils' // Removed - using direct formatting

interface ProfileCardProps {
  profile: any // Profile with related data
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const primaryPhoto = profile.profile_photos?.find((p: any) => p.is_primary) || profile.profile_photos?.[0]
  const skills = profile.profile_skills?.slice(0, 3) || [] // Show first 3 skills

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200'
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 touch-manipulation">
      <div className="aspect-[3/4] relative bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.file_path}
            alt={profile.full_name || 'Profile photo'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Availability Status */}
        {profile.availability_status && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
            <Badge 
              variant={profile.availability_status === 'available' ? 'default' : 'secondary'}
              className="capitalize text-xs"
            >
              {profile.availability_status}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-2 sm:p-3 lg:p-4">
        {/* Name and Title */}
        <div className="mb-1 sm:mb-2">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-1">
            {profile.full_name}
          </h3>
        </div>

        {/* Key Info */}
        <div className="space-y-1 mb-2 sm:mb-3">
          {profile.location && (
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{profile.location}</span>
            </div>
          )}
          
          {profile.experience_years && (
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span>{profile.experience_years}y exp</span>
            </div>
          )}

          {(profile.day_rate_min || profile.day_rate_max) && (
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {profile.day_rate_min && profile.day_rate_max 
                  ? `$${profile.day_rate_min}-$${profile.day_rate_max}/day`
                  : profile.day_rate_min 
                    ? `$${profile.day_rate_min}+/day`
                    : `$${profile.day_rate_max}/day`
                }
              </span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 2).map((skill: any, index: number) => (
                <Badge
                  key={`${skill.skills?.name || skill.skill_id}-${index}`}
                  variant="outline"
                  className={`text-xs ${getProficiencyColor(skill.proficiency_level)}`}
                >
                  {skill.skills?.name || skill.skill_id}
                </Badge>
              ))}
              {profile.profile_skills?.length > 2 && (
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                  +{profile.profile_skills.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Physical Stats */}
        <div className="grid grid-cols-2 gap-1 mb-2 sm:mb-3 text-xs text-muted-foreground">
          {(profile.height_feet || profile.height_inches || profile.weight_lbs) && (
            <div className="space-y-0.5">
              {(profile.height_feet || profile.height_inches) && (
                <div>H: {profile.height_feet || 0}'{profile.height_inches || 0}"</div>
              )}
              {profile.weight_lbs && (
                <div>W: {profile.weight_lbs} lbs</div>
              )}
            </div>
          )}
          {(profile.hair_color || profile.eye_color) && (
            <div className="space-y-0.5">
              {profile.hair_color && <div>Hair: {profile.hair_color}</div>}
              {profile.eye_color && <div>Eyes: {profile.eye_color}</div>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 sm:gap-2">
          <Link href={`/profile/${profile.id}`} className="flex-1">
            <Button variant="outline" className="w-full min-h-[36px] sm:min-h-[40px] lg:min-h-[44px] touch-manipulation text-xs sm:text-sm">
              View Profile
            </Button>
          </Link>
          {profile.reel_url && (
            <Button variant="ghost" size="sm" asChild className="min-h-[36px] sm:min-h-[40px] lg:min-h-[44px] touch-manipulation">
              <a href={profile.reel_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
