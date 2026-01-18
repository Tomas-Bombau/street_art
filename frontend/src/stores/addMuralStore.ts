import { create } from 'zustand'
import api from '@/lib/api'
import type { CreateMuralFormData, CreateMuralResponse, GeocodedAddress } from '@/types'

interface AddMuralState {
  isModalOpen: boolean
  isSubmitting: boolean
  error: string | null
  selectedLocation: { lat: number; lng: number } | null
  geocodedAddress: GeocodedAddress | null
  uploadedImage: { url: string; publicId: string } | null
  openModal: () => void
  closeModal: () => void
  setLocation: (lat: number, lng: number) => void
  setGeocodedAddress: (address: GeocodedAddress) => void
  setUploadedImage: (url: string, publicId: string) => void
  clearImage: () => void
  submitMural: (data: CreateMuralFormData) => Promise<{ success: boolean; message?: string }>
  reset: () => void
}

export const useAddMuralStore = create<AddMuralState>()((set, get) => ({
  isModalOpen: false,
  isSubmitting: false,
  error: null,
  selectedLocation: null,
  geocodedAddress: null,
  uploadedImage: null,

  openModal: () => {
    set({ isModalOpen: true, error: null })
  },

  closeModal: () => {
    const { reset } = get()
    reset()
    set({ isModalOpen: false })
  },

  setLocation: (lat: number, lng: number) => {
    set({ selectedLocation: { lat, lng } })
  },

  setGeocodedAddress: (address: GeocodedAddress) => {
    set({ geocodedAddress: address })
  },

  setUploadedImage: (url: string, publicId: string) => {
    set({ uploadedImage: { url, publicId } })
  },

  clearImage: () => {
    set({ uploadedImage: null })
  },

  submitMural: async (data: CreateMuralFormData) => {
    set({ isSubmitting: true, error: null })

    try {
      const response = await api.post<CreateMuralResponse>('/murals', { mural: data })

      set({ isSubmitting: false })

      return { success: true, message: response.data.message }
    } catch (error: unknown) {
      const errorData = (error as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } })?.response?.data

      let errorMessage = 'Failed to submit mural'
      if (errorData?.error) {
        errorMessage = errorData.error
      } else if (errorData?.errors) {
        // Format validation errors
        const errors = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ')
        errorMessage = errors
      }

      set({ isSubmitting: false, error: errorMessage })

      return { success: false, message: errorMessage }
    }
  },

  reset: () => {
    set({
      isSubmitting: false,
      error: null,
      selectedLocation: null,
      geocodedAddress: null,
      uploadedImage: null,
    })
  },
}))
