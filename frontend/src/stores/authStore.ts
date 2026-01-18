import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import type { AdminUser, LoginResponse } from '@/types'

interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await api.post<LoginResponse>('/admin/auth/login', {
            email,
            password,
          })

          const { user, access_token, refresh_token } = response.data.data

          // Store tokens in localStorage (handled by api interceptor)
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error: unknown) {
          const errorMessage =
            (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Login failed'

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })

          return false
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      checkAuth: () => {
        const token = localStorage.getItem('access_token')
        const { user } = get()

        if (token && user) {
          set({ isAuthenticated: true })
        } else {
          set({ isAuthenticated: false, user: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
