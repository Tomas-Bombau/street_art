import { create } from 'zustand'
import api from '@/lib/api'
import type { MuralWithDetails, MuralStatus, AdminMuralsListResponse, MuralSummaryResponse, PaginationMeta } from '@/types'

interface ApproveOptions {
  sendEmail: boolean
  message: string
}

interface RejectOptions {
  reason: string
  sendEmail: boolean
}

interface AdminMuralsState {
  murals: MuralWithDetails[]
  currentStatus: MuralStatus
  isLoading: boolean
  error: string | null
  pagination: PaginationMeta
  summary: { pending: number; approved: number; rejected: number }
  fetchMurals: (status: MuralStatus) => Promise<void>
  fetchSummary: () => Promise<void>
  setPage: (page: number) => void
  approveMural: (id: string, options: ApproveOptions) => Promise<{ success: boolean; message?: string }>
  rejectMural: (id: string, options: RejectOptions) => Promise<{ success: boolean; message?: string }>
}

const defaultPagination: PaginationMeta = {
  page: 1,
  per_page: 10,
  total_pages: 1,
  total_count: 0,
}

export const useAdminMuralsStore = create<AdminMuralsState>()((set, get) => ({
  murals: [],
  currentStatus: 'pending',
  isLoading: false,
  error: null,
  pagination: defaultPagination,
  summary: { pending: 0, approved: 0, rejected: 0 },

  fetchMurals: async (status: MuralStatus) => {
    set({ isLoading: true, error: null, currentStatus: status })

    const { pagination } = get()

    try {
      const params = new URLSearchParams()
      params.append('status', status)
      params.append('page', pagination.page.toString())

      const response = await api.get<AdminMuralsListResponse>(`/admin/murals?${params.toString()}`)

      set({
        murals: response.data.data,
        pagination: response.data.meta,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch admin murals:', error)
      set({
        error: 'Failed to load murals',
        isLoading: false,
      })
    }
  },

  fetchSummary: async () => {
    try {
      const response = await api.get<MuralSummaryResponse>('/admin/murals/summary')
      set({ summary: response.data.data })
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  },

  setPage: (page: number) => {
    const { currentStatus, fetchMurals } = get()
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
    fetchMurals(currentStatus)
  },

  approveMural: async (id: string, options: ApproveOptions) => {
    try {
      await api.put(`/admin/murals/${id}/approve`, {
        send_email: options.sendEmail,
        message: options.message,
      })

      // Refresh the current list and summary
      const { currentStatus, fetchMurals, fetchSummary } = get()
      await Promise.all([fetchMurals(currentStatus), fetchSummary()])

      return { success: true, message: 'Mural approved successfully' }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to approve mural'

      return { success: false, message: errorMessage }
    }
  },

  rejectMural: async (id: string, options: RejectOptions) => {
    try {
      await api.put(`/admin/murals/${id}/reject`, {
        reason: options.reason,
        send_email: options.sendEmail,
      })

      // Refresh the current list and summary
      const { currentStatus, fetchMurals, fetchSummary } = get()
      await Promise.all([fetchMurals(currentStatus), fetchSummary()])

      return { success: true, message: 'Mural rejected successfully' }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to reject mural'

      return { success: false, message: errorMessage }
    }
  },
}))
