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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-[4/3] relative bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.file_path}
            alt={profile.full_name || 'Profile photo'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Availability Status */}
        {profile.availability_status && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant={profile.availability_status === 'available' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {profile.availability_status}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Name and Title */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg leading-tight">
            {profile.full_name}
          </h3>
        </div>

        {/* Key Info */}
        <div className="space-y-2 mb-4">
          {profile.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{profile.location}</span>
            </div>
          )}
          
          {profile.experience_years && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{profile.experience_years} years experience</span>
            </div>
          )}

          {(profile.day_rate_min || profile.day_rate_max) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>
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
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {skills.map((skill: any, index: number) => (
                <Badge
                  key={`${skill.skills?.name || skill.skill_id}-${index}`}
                  variant="outline"
                  className={`text-xs ${getProficiencyColor(skill.proficiency_level)}`}
                >
                  {skill.skills?.name || skill.skill_id}
                </Badge>
              ))}
              {profile.profile_skills?.length > 3 && (
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                  +{profile.profile_skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}



        {/* Physical Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
          {(profile.height_feet || profile.height_inches || profile.weight_lbs) && (
            <div>
              {(profile.height_feet || profile.height_inches) && (
                <div>Height: {profile.height_feet || 0}'{profile.height_inches || 0}"</div>
              )}
              {profile.weight_lbs && (
                <div>Weight: {profile.weight_lbs} lbs</div>
              )}
            </div>
          )}
          {(profile.hair_color || profile.eye_color) && (
            <div>
              {profile.hair_color && <div>Hair: {profile.hair_color}</div>}
              {profile.eye_color && <div>Eyes: {profile.eye_color}</div>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/profile/${profile.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
          {profile.reel_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={profile.reel_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
