import { createBrowserRouter, Navigate } from 'react-router-dom'

// Lazy load pages for better performance
import { lazy, Suspense } from 'react'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-yellow-400 text-2xl font-bold animate-pulse">
      Loading...
    </div>
  </div>
)

// Lazy loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const MuralsListPage = lazy(() => import('@/pages/MuralsListPage'))
const MuralsMapPage = lazy(() => import('@/pages/MuralsMapPage'))
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminMuralsList = lazy(() => import('@/pages/admin/AdminMuralsList'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Wrapper for lazy loaded components
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: withSuspense(LandingPage),
  },
  {
    path: '/murals',
    element: withSuspense(MuralsListPage),
  },
  {
    path: '/murals/map',
    element: withSuspense(MuralsMapPage),
  },

  // Admin routes
  {
    path: '/admin/login',
    element: withSuspense(AdminLoginPage),
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/dashboard',
    element: withSuspense(AdminDashboardPage),
  },
  {
    path: '/admin/murals/:status',
    element: withSuspense(AdminMuralsList),
  },

  // 404
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
])
