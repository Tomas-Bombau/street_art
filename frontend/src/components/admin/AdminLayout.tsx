import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/murals/pending', label: 'Pending', icon: Clock },
    { path: '/admin/murals/approved', label: 'Approved', icon: CheckCircle },
    { path: '/admin/murals/rejected', label: 'Rejected', icon: XCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-kobra-teal text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Geometric logo */}
            <svg width="40" height="40" viewBox="0 0 40 40">
              <polygon points="20,2 38,20 20,38 2,20" fill="#E63946" />
              <polygon points="20,8 32,20 20,32 8,20" fill="#F4A261" />
              <polygon points="20,14 26,20 20,26 14,20" fill="#E9C46A" />
            </svg>
            <div>
              <h1 className="text-xl font-bold">ADMIN PANEL</h1>
              <p className="text-xs text-white/70">Buenos Aires Street Art</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-kobra-pink text-kobra-pink hover:bg-kobra-pink hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Rainbow stripe */}
      <div className="h-1 flex">
        <div className="flex-1 bg-kobra-red"></div>
        <div className="flex-1 bg-kobra-orange"></div>
        <div className="flex-1 bg-kobra-yellow"></div>
        <div className="flex-1 bg-kobra-green"></div>
        <div className="flex-1 bg-kobra-blue"></div>
        <div className="flex-1 bg-kobra-purple"></div>
        <div className="flex-1 bg-kobra-pink"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r-3 border-kobra-teal min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path.includes('murals') && location.pathname.includes(item.path.split('/').pop()!))
              const Icon = item.icon

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive
                        ? 'bg-kobra-gradient text-white hover:opacity-90'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Back to site link */}
          <div className="p-4 border-t-2 border-gray-200">
            <Link to="/">
              <Button variant="outline" className="w-full border-2 border-kobra-teal text-kobra-teal hover:bg-kobra-teal hover:text-white">
                ← Back to Site
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
