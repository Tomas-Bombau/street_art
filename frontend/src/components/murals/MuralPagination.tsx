import { Button } from '@/components/ui/button'
import { useMuralsStore } from '@/stores/muralsStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MuralPaginationProps {
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export default function MuralPagination({ page, totalPages, onPageChange }: MuralPaginationProps) {
  const muralsStore = useMuralsStore()

  // Use props if provided, otherwise use store
  const currentPage = page ?? muralsStore.pagination.page
  const total = totalPages ?? muralsStore.pagination.total_pages
  const handlePageChange = onPageChange ?? muralsStore.setPage

  if (total <= 1) return null

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // Maximum pages to show

    if (total <= showPages) {
      // Show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Show first, last, and pages around current
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      } else if (currentPage >= total - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = total - 3; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-2 border-black disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page numbers */}
      {getPageNumbers().map((pageNum, index) => (
        <Button
          key={index}
          variant={pageNum === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
          disabled={typeof pageNum === 'string'}
          className={
            pageNum === currentPage
              ? 'bg-basquiat-yellow text-black hover:bg-basquiat-yellow/90 border-2 border-black'
              : 'border-2 border-black'
          }
        >
          {pageNum}
        </Button>
      ))}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === total}
        className="border-2 border-black disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
