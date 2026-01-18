import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useAdminMuralsStore } from '@/stores/adminMuralsStore'
import AdminLayout from '@/components/admin/AdminLayout'
import MuralReviewCard from '@/components/admin/MuralReviewCard'
import ApproveModal from '@/components/admin/ApproveModal'
import RejectModal from '@/components/admin/RejectModal'
import MuralPagination from '@/components/murals/MuralPagination'
import { toast } from 'sonner'
import type { MuralStatus, MuralWithDetails } from '@/types'
import { Loader2, ArrowLeft } from 'lucide-react'

const statusLabels: Record<MuralStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved Murals',
  rejected: 'Rejected Murals',
}

const statusColors: Record<MuralStatus, string> = {
  pending: 'bg-kobra-orange',
  approved: 'bg-kobra-green',
  rejected: 'bg-kobra-red',
}

export default function AdminMuralsList() {
  const { status } = useParams<{ status: MuralStatus }>()
  const navigate = useNavigate()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { murals, isLoading, pagination, fetchMurals, setPage, approveMural, rejectMural } = useAdminMuralsStore()

  const [approvingMural, setApprovingMural] = useState<MuralWithDetails | null>(null)
  const [rejectingMural, setRejectingMural] = useState<MuralWithDetails | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login')
      return
    }

    // Validate status parameter
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      navigate('/admin/murals/pending')
      return
    }

    fetchMurals(status as MuralStatus)
  }, [isAuthenticated, status, navigate, fetchMurals])

  const handleApprove = async (options: { sendEmail: boolean; message: string }) => {
    if (!approvingMural) return

    const result = await approveMural(approvingMural.id, options)
    setApprovingMural(null)

    if (result.success) {
      const emailNote = options.sendEmail ? 'An approval email has been sent to the contributor.' : 'No email was sent.'
      toast.success('Mural approved', { description: emailNote })
    } else {
      toast.error('Failed to approve', { description: result.message })
    }
  }

  const handleReject = async (options: { reason: string; sendEmail: boolean }) => {
    if (!rejectingMural) return

    const result = await rejectMural(rejectingMural.id, options)
    setRejectingMural(null)

    if (result.success) {
      const emailNote = options.sendEmail ? 'A rejection email has been sent to the contributor.' : 'No email was sent.'
      toast.success('Mural rejected', { description: emailNote })
    } else {
      toast.error('Failed to reject', { description: result.message })
    }
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  if (!isAuthenticated) {
    return null
  }

  const currentStatus = (status as MuralStatus) || 'pending'

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 ${statusColors[currentStatus]}`}></div>
              <h1 className="text-3xl geometric">{statusLabels[currentStatus]}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {pagination.total_count} mural{pagination.total_count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected'] as MuralStatus[]).map((s) => (
            <Link key={s} to={`/admin/murals/${s}`}>
              <Button
                variant={currentStatus === s ? 'default' : 'outline'}
                className={currentStatus === s ? statusColors[s] + ' text-white' : 'border-kobra-teal'}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            </Link>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-kobra-pink" />
            <span className="ml-3 text-lg">Loading...</span>
          </div>
        ) : murals.length === 0 ? (
          <div className="text-center py-20 bg-kobra-teal/5 border-2 border-dashed border-kobra-teal">
            {/* Geometric hexagon decoration */}
            <div className="flex justify-center mb-4">
              <svg width="56" height="56" viewBox="0 0 56 56" className="text-kobra-pink">
                <polygon points="28,4 50,16 50,40 28,52 6,40 6,16" fill="none" stroke="currentColor" strokeWidth="2"/>
                <polygon points="28,14 40,22 40,34 28,42 16,34 16,22" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="text-xl mb-2 geometric">No {currentStatus} murals</h2>
            <p className="text-muted-foreground">
              {currentStatus === 'pending' && 'All caught up! No murals waiting for review.'}
              {currentStatus === 'approved' && 'No murals have been approved yet.'}
              {currentStatus === 'rejected' && 'No murals have been rejected.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {murals.map((mural) => (
                <MuralReviewCard
                  key={mural.id}
                  mural={mural}
                  onApprove={currentStatus === 'pending' ? () => setApprovingMural(mural) : undefined}
                  onReject={currentStatus === 'pending' ? () => setRejectingMural(mural) : undefined}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center">
                <MuralPagination
                  page={pagination.page}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve modal */}
      {approvingMural && (
        <ApproveModal
          mural={approvingMural}
          onConfirm={handleApprove}
          onCancel={() => setApprovingMural(null)}
        />
      )}

      {/* Reject modal */}
      {rejectingMural && (
        <RejectModal
          mural={rejectingMural}
          onConfirm={handleReject}
          onCancel={() => setRejectingMural(null)}
        />
      )}
    </AdminLayout>
  )
}
