// Mural types
export interface Mural {
  id: string
  name: string
  image_url: string
  latitude: number
  longitude: number
  province: string
  municipality: string | null
  neighborhood: string | null
  formatted_address: string | null
  created_at: string
}

export interface MuralWithDetails extends Mural {
  cloudinary_public_id: string | null
  status: MuralStatus
  rejection_reason: string | null
  contributor_email: string
  reviewed_at: string | null
  reviewed_by_id: string | null
  updated_at: string
}

export type MuralStatus = 'pending' | 'approved' | 'rejected'

// API response types
export interface PaginationMeta {
  page: number
  per_page: number
  total_pages: number
  total_count: number
}

export interface MuralsListResponse {
  data: Mural[]
  meta: PaginationMeta
}

export interface AdminMuralsListResponse {
  data: MuralWithDetails[]
  meta: PaginationMeta
}

export interface MuralResponse {
  data: Mural
}

export interface CreateMuralResponse {
  data: Mural
  message: string
}

export interface MuralSummaryResponse {
  data: {
    pending: number
    approved: number
    rejected: number
  }
}

// Filter types
export interface MuralFilters {
  name: string
  province: string
  municipality: string
  neighborhood: string
}

// Form types
export interface CreateMuralFormData {
  name?: string
  image_url: string
  cloudinary_public_id: string
  latitude: number
  longitude: number
  province: string
  municipality: string | null
  neighborhood: string | null
  formatted_address: string | null
  contributor_email: string
}

// Geocoding types
export interface GeocodedAddress {
  province: string
  municipality: string | null
  neighborhood: string | null
  formatted_address: string
}

// Auth types
export interface AdminUser {
  id: string
  email: string
  role: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginResponse {
  data: {
    user: AdminUser
    access_token: string
    refresh_token: string
    token_type: string
  }
}

export interface RefreshResponse {
  data: AuthTokens
}

// Error types
export interface ApiError {
  error?: string
  errors?: Record<string, string[]>
}
