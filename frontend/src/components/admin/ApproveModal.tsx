import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { MuralWithDetails } from '@/types'
import { X, Check, Loader2, Mail } from 'lucide-react'

interface ApproveModalProps {
  mural: MuralWithDetails
  onConfirm: (options: { sendEmail: boolean; message: string }) => Promise<void>
  onCancel: () => void
}

export default function ApproveModal({ mural, onConfirm, onCancel }: ApproveModalProps) {
  const [message, setMessage] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await onConfirm({ sendEmail, message: message.trim() })
    } catch {
      setError('Failed to approve mural. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-md kobra-border-soft">
        {/* Header */}
        <div className="bg-kobra-green p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Check className="w-6 h-6" />
            <h2 className="text-xl font-bold geometric">APPROVE MURAL</h2>
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
            You are about to approve: <strong>{mural.name}</strong>
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
              Send confirmation email to contributor
            </Label>
          </div>

          {/* Message textarea (only shown if send email is checked) */}
          {sendEmail && (
            <div className="space-y-2 mb-4">
              <Label htmlFor="message" className="text-sm font-bold uppercase">
                Message (optional)
              </Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to the contributor..."
                rows={3}
                className="w-full border border-kobra-teal/60 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-kobra-teal/50"
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/500 characters
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-kobra-red/10 border-2 border-kobra-red text-kobra-red p-3 text-sm mb-4">
              {error}
            </div>
          )}

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
              disabled={isSubmitting}
              className="flex-1 bg-kobra-green text-white hover:bg-kobra-green/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  APPROVING...
                </>
              ) : (
                'APPROVE'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
