import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { MuralWithDetails } from '@/types'
import { X, AlertTriangle, Loader2, Mail } from 'lucide-react'

interface RejectModalProps {
  mural: MuralWithDetails
  onConfirm: (options: { reason: string; sendEmail: boolean }) => Promise<void>
  onCancel: () => void
}

export default function RejectModal({ mural, onConfirm, onCancel }: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onConfirm({ reason: reason.trim(), sendEmail })
    } catch {
      setError('Failed to reject mural. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-md kobra-border-soft">
        {/* Header */}
        <div className="bg-kobra-teal p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold geometric">REJECT MURAL</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white p-2 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-4">
            You are about to reject: <strong>{mural.name}</strong>
          </p>

          {/* Send email checkbox */}
          <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 border border-gray-200">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked === true)}
            />
            <Label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer">
              <Mail className="w-4 h-4 text-kobra-blue" />
              Send rejection email to contributor
            </Label>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Please be clear and constructive with the rejection reason.
          </p>

          {/* Reason textarea */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="reason" className="text-sm font-bold uppercase">
              Rejection Reason *
            </Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this submission is being rejected..."
              rows={4}
              className="w-full border border-kobra-teal/60 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-kobra-teal/50"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/1000 characters
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-kobra-red/10 border-2 border-kobra-red text-kobra-red p-3 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Suggested reasons */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Quick reasons:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Image quality is too low',
                'Location is incorrect',
                'Not a mural / street art',
                'Duplicate submission',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setReason(suggestion)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 border border-kobra-teal/60"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  REJECTING...
                </>
              ) : (
                'REJECT'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
