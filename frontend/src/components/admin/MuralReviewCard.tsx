import type { MuralWithDetails } from '@/types'
import { getThumbnailUrl } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import { MapPin, Mail, Calendar, Check, X, ExternalLink } from 'lucide-react'

interface MuralReviewCardProps {
  mural: MuralWithDetails
  onApprove?: () => void
  onReject?: () => void
}

export default function MuralReviewCard({ mural, onApprove, onReject }: MuralReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColors = {
    pending: 'bg-kobra-orange text-white',
    approved: 'bg-kobra-green text-white',
    rejected: 'bg-kobra-red text-white',
  }

  return (
    <div className="bg-white border-3 border-kobra-teal flex flex-col md:flex-row overflow-hidden">
      {/* Image */}
      <div className="md:w-64 flex-shrink-0">
        <a href={mural.image_url} target="_blank" rel="noopener noreferrer">
          <img
            src={getThumbnailUrl(mural.image_url, 300, 225)}
            alt={mural.name}
            className="w-full h-48 md:h-full object-cover hover:opacity-90 transition-opacity"
          />
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold mb-1">{mural.name}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-bold uppercase ${statusColors[mural.status]}`}>
              {mural.status}
            </span>
          </div>
          <a
            href={mural.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-kobra-teal"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-kobra-pink flex-shrink-0" />
            <span>
              {mural.neighborhood && `${mural.neighborhood}, `}
              {mural.municipality && `${mural.municipality}, `}
              {mural.province}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-kobra-blue" />
            <a href={`mailto:${mural.contributor_email}`} className="text-kobra-blue hover:underline">
              {mural.contributor_email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Submitted {formatDate(mural.created_at)}</span>
          </div>
        </div>

        {/* Rejection reason (if rejected) */}
        {mural.status === 'rejected' && mural.rejection_reason && (
          <div className="bg-kobra-red/10 border-l-4 border-kobra-red p-3 text-sm mb-4">
            <p className="font-bold text-kobra-red mb-1">Rejection Reason:</p>
            <p>{mural.rejection_reason}</p>
          </div>
        )}

        {/* Review info (if reviewed) */}
        {mural.reviewed_at && (
          <div className="text-xs text-muted-foreground mb-4">
            Reviewed on {formatDate(mural.reviewed_at)}
          </div>
        )}

        {/* Action buttons (only for pending) */}
        {onApprove && onReject && (
          <div className="flex gap-3 pt-2 border-t-2 border-gray-100">
            <Button
              onClick={onApprove}
              className="bg-kobra-green text-white hover:bg-kobra-green/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={onReject}
              variant="outline"
              className="border-2 border-kobra-red text-kobra-red hover:bg-kobra-red hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
