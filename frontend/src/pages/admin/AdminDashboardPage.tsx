import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useAdminMuralsStore } from '@/stores/adminMuralsStore'
import AdminLayout from '@/components/admin/AdminLayout'
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { summary, fetchSummary } = useAdminMuralsStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }
    fetchSummary()
  }, [isAuthenticated, navigate, fetchSummary])

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 geometric">DASHBOARD</h1>
          <p className="text-muted-foreground">Manage mural submissions</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending */}
          <div className="bg-kobra-orange/10 border-4 border-kobra-orange p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-kobra-orange" />
              <span className="text-5xl font-bold">{summary.pending}</span>
            </div>
            <h3 className="text-xl mb-2 geometric">PENDING</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Awaiting review
            </p>
            <Link to="/admin/murals/pending">
              <Button variant="outline" className="w-full border-kobra-orange text-kobra-orange hover:bg-kobra-orange hover:text-white">
                Review <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Approved */}
          <div className="bg-kobra-green/10 border-4 border-kobra-green p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-kobra-green" />
              <span className="text-5xl font-bold">{summary.approved}</span>
            </div>
            <h3 className="text-xl mb-2 geometric">APPROVED</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Published murals
            </p>
            <Link to="/admin/murals/approved">
              <Button variant="outline" className="w-full border-kobra-green text-kobra-green hover:bg-kobra-green hover:text-white">
                View <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Rejected */}
          <div className="bg-kobra-red/10 border-4 border-kobra-red p-6">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-kobra-red" />
              <span className="text-5xl font-bold">{summary.rejected}</span>
            </div>
            <h3 className="text-xl mb-2 geometric">REJECTED</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Declined submissions
            </p>
            <Link to="/admin/murals/rejected">
              <Button variant="outline" className="w-full border-kobra-red text-kobra-red hover:bg-kobra-red hover:text-white">
                View <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        {summary.pending > 0 && (
          <div className="bg-kobra-teal text-white p-6 kobra-border-thick">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl text-kobra-pink geometric">
                  {summary.pending} mural{summary.pending !== 1 ? 's' : ''} pending review
                </h3>
                <p className="text-white/70">
                  Review submissions to keep the gallery up to date
                </p>
              </div>
              <Link to="/admin/murals/pending">
                <Button className="bg-kobra-pink text-white hover:bg-kobra-pink/90">
                  START REVIEWING
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
