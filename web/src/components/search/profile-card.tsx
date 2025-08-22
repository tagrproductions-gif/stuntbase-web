import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, ExternalLink } from 'lucide-react'

interface ProfileCardProps {
  profile: any // Profile with related data
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const primaryPhoto = profile.profile_photos?.find((p: any) => p.is_primary) || profile.profile_photos?.[0]
  
  // Normalize ethnicity for display
  const formatEthnicity = (ethnicity: string) => {
    if (!ethnicity) return ''
    return ethnicity.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 touch-manipulation flex flex-col h-full">
      <div className="aspect-[4/5] relative bg-muted">
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
      </div>

      <CardContent className="p-2 sm:p-3 lg:p-4 flex flex-col h-full">
        {/* Name */}
        <div className="mb-2">
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-1">
            {profile.full_name}
          </h3>
        </div>

        {/* Physical Stats - Fixed layout for uniformity */}
        <div className="flex-1 space-y-1 mb-4 text-xs sm:text-sm text-muted-foreground">
          {/* Height and Ethnicity - Same row */}
          <div className="min-h-[1.25rem] flex justify-between items-center">
            <span>
              {(profile.height_feet || profile.height_inches) ? (
                `H: ${profile.height_feet || 0}'${profile.height_inches || 0}"`
              ) : (
                <span className="text-transparent">H: 0'0"</span>
              )}
            </span>
            <span>
              {profile.ethnicity ? (
                `Ethnicity: ${formatEthnicity(profile.ethnicity)}`
              ) : (
                <span className="text-transparent">Ethnicity: Unknown</span>
              )}
            </span>
          </div>
          
          {/* Weight - Always show this row */}
          <div className="min-h-[1.25rem]">
            {profile.weight_lbs ? (
              <span>W: {profile.weight_lbs} lbs</span>
            ) : (
              <span className="text-transparent">W: 0 lbs</span>
            )}
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-1 sm:gap-2 mt-auto">
          <Link href={`/profile/${profile.id}`} className="flex-1">
            <Button 
              className="w-full min-h-[36px] sm:min-h-[40px] lg:min-h-[44px] touch-manipulation text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
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
