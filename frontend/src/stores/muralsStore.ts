import { create } from 'zustand'
import api from '@/lib/api'
import type { Mural, MuralFilters, MuralsListResponse, PaginationMeta } from '@/types'

interface MuralsState {
  murals: Mural[]
  isLoading: boolean
  error: string | null
  pagination: PaginationMeta
  filters: MuralFilters
  fetchMurals: () => Promise<void>
  setPage: (page: number) => void
  setFilter: (key: keyof MuralFilters, value: string) => void
  clearFilters: () => void
}

const defaultPagination: PaginationMeta = {
  page: 1,
  per_page: 10,
  total_pages: 1,
  total_count: 0,
}

const defaultFilters: MuralFilters = {
  name: '',
  province: '',
  municipality: '',
  neighborhood: '',
}

export const useMuralsStore = create<MuralsState>()((set, get) => ({
  murals: [],
  isLoading: false,
  error: null,
  pagination: defaultPagination,
  filters: defaultFilters,

  fetchMurals: async () => {
    set({ isLoading: true, error: null })

    const { pagination, filters } = get()

    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())

      if (filters.name) params.append('name', filters.name)
      if (filters.province) params.append('province', filters.province)
      if (filters.municipality) params.append('municipality', filters.municipality)
      if (filters.neighborhood) params.append('neighborhood', filters.neighborhood)

      const response = await api.get<MuralsListResponse>(`/murals?${params.toString()}`)

      set({
        murals: response.data.data,
        pagination: response.data.meta,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch murals:', error)
      set({
        error: 'Failed to load murals',
        isLoading: false,
      })
    }
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
    get().fetchMurals()
  },

  setFilter: (key: keyof MuralFilters, value: string) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    }))

    // If province changes and it's CABA, clear municipality
    if (key === 'province') {
      const newValue = value.toLowerCase()
      if (newValue.includes('ciudad') || newValue.includes('caba')) {
        set((state) => ({
          filters: { ...state.filters, municipality: '' },
        }))
      }
    }

    get().fetchMurals()
  },

  clearFilters: () => {
    set({
      filters: defaultFilters,
      pagination: { ...get().pagination, page: 1 },
    })
    get().fetchMurals()
  },
}))
