import { create } from 'zustand'
import api from '@/lib/api'

interface FilterOptionsState {
  provinces: string[]
  municipalities: string[]
  neighborhoods: string[]
  isLoading: boolean
  fetchProvinces: () => Promise<void>
  fetchMunicipalities: (province: string) => Promise<void>
  fetchNeighborhoods: (province: string, municipality?: string) => Promise<void>
  clearMunicipalities: () => void
  clearNeighborhoods: () => void
}

interface FilterResponse {
  data: string[]
}

export const useFilterOptionsStore = create<FilterOptionsState>()((set) => ({
  provinces: [],
  municipalities: [],
  neighborhoods: [],
  isLoading: false,

  fetchProvinces: async () => {
    set({ isLoading: true })

    try {
      const response = await api.get<FilterResponse>('/filters/provinces')
      set({ provinces: response.data.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch provinces:', error)
      set({ isLoading: false })
    }
  },

  fetchMunicipalities: async (province: string) => {
    set({ isLoading: true })

    try {
      const response = await api.get<FilterResponse>(`/filters/municipalities?province=${encodeURIComponent(province)}`)
      set({ municipalities: response.data.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch municipalities:', error)
      set({ isLoading: false })
    }
  },

  fetchNeighborhoods: async (province: string, municipality?: string) => {
    set({ isLoading: true })

    try {
      let url = `/filters/neighborhoods?province=${encodeURIComponent(province)}`
      if (municipality) {
        url += `&municipality=${encodeURIComponent(municipality)}`
      }

      const response = await api.get<FilterResponse>(url)
      set({ neighborhoods: response.data.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch neighborhoods:', error)
      set({ isLoading: false })
    }
  },

  clearMunicipalities: () => {
    set({ municipalities: [] })
  },

  clearNeighborhoods: () => {
    set({ neighborhoods: [] })
  },
}))
