export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          bio: string | null
          location: string | null
          secondary_location: string | null
          height_feet: number | null
          height_inches: number | null
          weight_lbs: number | null
          hair_color: string | null
          eye_color: string | null
          ethnicity: string | null
          gender: string | null
          phone: string | null
          email: string
          website: string | null
          imdb_url: string | null
          reel_url: string | null
          resume_url: string | null
          resume_filename: string | null
          resume_file_size: number | null
          resume_uploaded_at: string | null
          union_status: string | null
          loan_out_status: string | null
          availability_status: string | null
          // Universal wardrobe fields
          shirt_neck: number | null
          shirt_sleeve: number | null
          pants_waist: number | null
          pants_inseam: number | null
          shoe_size: number | null
          t_shirt_size: string | null
          hat_size: string | null
          glove_size: string | null
          // Male-specific wardrobe fields
          jacket_size: number | null
          jacket_length: string | null
          // Female-specific wardrobe fields
          dress_size: number | null
          pants_size: number | null
          underbust: number | null
          hips: number | null
          chest: number | null
          waist: number | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          bio?: string | null
          location?: string | null
          secondary_location?: string | null
          height_feet?: number | null
          height_inches?: number | null
          weight_lbs?: number | null
          hair_color?: string | null
          eye_color?: string | null
          ethnicity?: string | null
          gender?: string | null
          phone?: string | null
          email: string
          website?: string | null
          imdb_url?: string | null
          reel_url?: string | null
          resume_url?: string | null
          resume_filename?: string | null
          resume_file_size?: number | null
          resume_uploaded_at?: string | null
          union_status?: string | null
          loan_out_status?: string | null
          availability_status?: string | null
          // Universal wardrobe fields
          shirt_neck?: number | null
          shirt_sleeve?: number | null
          pants_waist?: number | null
          pants_inseam?: number | null
          shoe_size?: number | null
          t_shirt_size?: string | null
          hat_size?: string | null
          glove_size?: string | null
          // Male-specific wardrobe fields
          jacket_size?: number | null
          jacket_length?: string | null
          // Female-specific wardrobe fields
          dress_size?: number | null
          pants_size?: number | null
          underbust?: number | null
          hips?: number | null
          chest?: number | null
          waist?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          bio?: string | null
          location?: string | null
          secondary_location?: string | null
          height_feet?: number | null
          height_inches?: number | null
          weight_lbs?: number | null
          hair_color?: string | null
          eye_color?: string | null
          ethnicity?: string | null
          gender?: string | null
          phone?: string | null
          email?: string
          website?: string | null
          imdb_url?: string | null
          reel_url?: string | null
          resume_url?: string | null
          resume_filename?: string | null
          resume_file_size?: number | null
          resume_uploaded_at?: string | null
          union_status?: string | null
          loan_out_status?: string | null
          availability_status?: string | null
          // Universal wardrobe fields
          shirt_neck?: number | null
          shirt_sleeve?: number | null
          pants_waist?: number | null
          pants_inseam?: number | null
          shoe_size?: number | null
          t_shirt_size?: string | null
          hat_size?: string | null
          glove_size?: string | null
          // Male-specific wardrobe fields
          jacket_size?: number | null
          jacket_length?: string | null
          // Female-specific wardrobe fields
          dress_size?: number | null
          pants_size?: number | null
          underbust?: number | null
          hips?: number | null
          chest?: number | null
          waist?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          created_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          name: string
          issuing_organization: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          issuing_organization: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          issuing_organization?: string
          description?: string | null
          created_at?: string
        }
      }
      profile_skills: {
        Row: {
          id: string
          profile_id: string
          skill_id: string
          proficiency_level: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          skill_id: string
          proficiency_level: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          skill_id?: string
          proficiency_level?: string
          created_at?: string
        }
      }
      profile_certifications: {
        Row: {
          id: string
          profile_id: string
          certification_id: string
          date_obtained: string | null
          expiry_date: string | null
          certification_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          certification_id: string
          date_obtained?: string | null
          expiry_date?: string | null
          certification_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          certification_id?: string
          date_obtained?: string | null
          expiry_date?: string | null
          certification_number?: string | null
          created_at?: string
        }
      }
      profile_photos: {
        Row: {
          id: string
          profile_id: string
          photo_url: string
          caption: string | null
          is_primary: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          photo_url: string
          caption?: string | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          photo_url?: string
          caption?: string | null
          is_primary?: boolean
          display_order?: number
          created_at?: string
        }
      }
      search_logs: {
        Row: {
          id: string
          query: string
          filters: any | null
          results_count: number
          created_at: string
        }
        Insert: {
          id?: string
          query: string
          filters?: any | null
          results_count: number
          created_at?: string
        }
        Update: {
          id?: string
          query?: string
          filters?: any | null
          results_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Skill = Database['public']['Tables']['skills']['Row']
export type SkillInsert = Database['public']['Tables']['skills']['Insert']

export type Certification = Database['public']['Tables']['certifications']['Row']
export type CertificationInsert = Database['public']['Tables']['certifications']['Insert']

export type ProfileSkill = Database['public']['Tables']['profile_skills']['Row']
export type ProfileSkillInsert = Database['public']['Tables']['profile_skills']['Insert']

export type ProfileCertification = Database['public']['Tables']['profile_certifications']['Row']
export type ProfileCertificationInsert = Database['public']['Tables']['profile_certifications']['Insert']

export type ProfilePhoto = Database['public']['Tables']['profile_photos']['Row']
export type ProfilePhotoInsert = Database['public']['Tables']['profile_photos']['Insert']

export type SearchLog = Database['public']['Tables']['search_logs']['Row']
export type SearchLogInsert = Database['public']['Tables']['search_logs']['Insert']
