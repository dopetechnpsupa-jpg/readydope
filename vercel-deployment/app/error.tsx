'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
    
    // Prevent multiple error logs
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (e) => {
        e.preventDefault()
        console.warn('Prevented error from bubbling:', e.error)
      })
      
      window.addEventListener('unhandledrejection', (e) => {
        e.preventDefault()
        console.warn('Prevented unhandled promise rejection:', e.reason)
      })
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#F7DD0F]">Something went wrong!</h1>
          <p className="text-gray-400">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={reset}
            className="w-full bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90"
          >
            Try again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Go to homepage
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
