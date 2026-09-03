import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 0}
        className="btn-secondary px-3 py-2 disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let pageNum
        if (totalPages <= 7) {
          pageNum = i
        } else if (page < 3) {
          pageNum = i
        } else if (page >= totalPages - 4) {
          pageNum = totalPages - 7 + i
        } else {
          pageNum = page - 3 + i
        }
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              pageNum === page
                ? 'bg-brand-500 text-white'
                : 'bg-stone-100 text-apple-text hover:bg-stone-200'
            }`}
          >
            {pageNum + 1}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="btn-secondary px-3 py-2 disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
