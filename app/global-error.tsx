'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-[#F7DD0F]">
          Something went wrong!
        </h2>
        <p className="text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="bg-[#F7DD0F] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#F7DD0F]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
