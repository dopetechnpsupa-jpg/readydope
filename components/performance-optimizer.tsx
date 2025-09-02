"use client"

import React, { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'

// Lazy load heavy components
const LazyHeroSection = lazy(() => import('./hero-section').then(mod => ({ default: mod.default })))
const LazyDopeDailyShowcase = lazy(() => import('./dope-daily-showcase').then(mod => ({ default: mod.DopeDailyShowcase })))
const LazyDraggableMarquee = lazy(() => import('./draggable-marquee').then(mod => ({ default: mod.DraggableMarquee })))

interface PerformanceOptimizerProps {
  children: React.ReactNode
  initialLoad?: boolean
}

interface LoadingState {
  isLoading: boolean
  progress: number
  message: string
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ 
  children, 
  initialLoad = false 
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: initialLoad,
    progress: 0,
    message: 'Optimizing performance...'
  })
  
  const [isVisible, setIsVisible] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [memoryUsage, setMemoryUsage] = useState<number>(0)
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown')
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const router = useRouter()

  // Enhanced intersection observer for better performance
  const setupIntersectionObserver = useCallback(() => {
    if (typeof window === 'undefined') return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Preload nearby components when this one becomes visible
            const nextElement = entry.target.nextElementSibling
            if (nextElement) {
              observerRef.current?.observe(nextElement)
            }
          }
        })
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before element is visible
        threshold: 0.1
      }
    )
  }, [])

  // Enhanced memory management
  const monitorMemoryUsage = useCallback(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        setMemoryUsage(usedMB)
        
        // Warn if memory usage is high
        if (usedMB > 100) {
          console.warn('High memory usage detected:', usedMB, 'MB')
        }
      }
    }

    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Enhanced network speed detection
  const detectNetworkSpeed = useCallback(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      setNetworkSpeed('unknown')
      return
    }

    const connection = (navigator as any).connection
    if (connection) {
      const effectiveType = connection.effectiveType
      const downlink = connection.downlink

      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
        setNetworkSpeed('slow')
      } else {
        setNetworkSpeed('fast')
      }
    } else {
      setNetworkSpeed('unknown')
    }
  }, [])

  // Enhanced loading simulation with better progress tracking
  useEffect(() => {
    if (!initialLoad) return

    const messages = [
      'Optimizing performance...',
      'Loading assets...',
      'Preparing components...',
      'Almost ready...'
    ]

    let currentStep = 0
    const totalSteps = messages.length

    const interval = setInterval(() => {
      currentStep++
      const progress = Math.min((currentStep / totalSteps) * 100, 95)
      
      setLoadingState({
        isLoading: true,
        progress,
        message: messages[currentStep - 1] || messages[messages.length - 1]
      })

      if (currentStep >= totalSteps) {
        clearInterval(interval)
        setTimeout(() => {
          setLoadingState({
            isLoading: false,
            progress: 100,
            message: 'Ready!'
          })
        }, 500)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [initialLoad])

  // Enhanced hydration detection
  useEffect(() => {
    const handleHydration = () => {
      setIsHydrated(true)
      // Remove loading state after hydration
      if (loadingState.isLoading) {
        setLoadingState(prev => ({ ...prev, isLoading: false, progress: 100 }))
      }
    }

    if (document.readyState === 'complete') {
      handleHydration()
    } else {
      window.addEventListener('load', handleHydration)
      return () => window.removeEventListener('load', handleHydration)
    }
  }, [loadingState.isLoading])

  // Setup performance monitoring
  useEffect(() => {
    setupIntersectionObserver()
    const memoryCleanup = monitorMemoryUsage()
    detectNetworkSpeed()

    // Enhanced cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (memoryCleanup) {
        memoryCleanup()
      }
    }
  }, [setupIntersectionObserver, monitorMemoryUsage, detectNetworkSpeed])

  // Enhanced route change optimization
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setLoadingState({
        isLoading: true,
        progress: 0,
        message: 'Loading...'
      })
    }

    const handleRouteChangeComplete = () => {
      setLoadingState({
        isLoading: false,
        progress: 100,
        message: 'Ready!'
      })
    }

    // Listen for route changes
    window.addEventListener('beforeunload', handleRouteChangeStart)
    window.addEventListener('load', handleRouteChangeComplete)

    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart)
      window.removeEventListener('load', handleRouteChangeComplete)
    }
  }, [])

  // Enhanced loading component with better UX
  if (loadingState.isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Enhanced loading animation */}
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-[#F7DD0F]/30 rounded-full animate-ping mx-auto"></div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-[#F7DD0F] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingState.progress}%` }}
            ></div>
          </div>
          
          {/* Loading message */}
          <p className="text-[#F7DD0F] font-semibold text-lg mb-2">{loadingState.message}</p>
          <p className="text-gray-400 text-sm">{Math.round(loadingState.progress)}%</p>
          
          {/* Performance indicators */}
          <div className="mt-6 flex justify-center space-x-4 text-xs text-gray-500">
            {memoryUsage > 0 && (
              <span>Memory: {memoryUsage}MB</span>
            )}
            {networkSpeed !== 'unknown' && (
              <span>Network: {networkSpeed}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="performance-optimizer">
      {/* Enhanced Suspense boundary with better fallback */}
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-[#F7DD0F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        {children}
      </Suspense>
      
      {/* Performance monitoring overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Memory: {memoryUsage}MB</div>
          <div>Network: {networkSpeed}</div>
          <div>Hydrated: {isHydrated ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [loadingMessage, setLoadingMessage] = useState('')

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true)
    setLoadingMessage(message)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
  }, [])

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    message = 'Loading...'
  ): Promise<T> => {
    startLoading(message)
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook for progressive data loading
export function useProgressiveLoading<T>(
  dataFetcher: () => Promise<T[]>,
  options: {
    batchSize?: number
    delay?: number
    initialCount?: number
  } = {}
) {
  const { batchSize = 6, delay = 300, initialCount = 12 } = options
  const [data, setData] = useState<T[]>([])
  const [displayedData, setDisplayedData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        const allData = await dataFetcher()
        setData(allData)
        setDisplayedData(allData.slice(0, initialCount))
        setHasMore(allData.length > initialCount)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [dataFetcher, initialCount])

  // Load more data progressively
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return

    setIsLoading(true)
    
    // Simulate progressive loading
    setTimeout(() => {
      const currentLength = displayedData.length
      const newData = data.slice(currentLength, currentLength + batchSize)
      
      setDisplayedData(prev => [...prev, ...newData])
      setHasMore(currentLength + batchSize < data.length)
      setIsLoading(false)
    }, delay)
  }, [data, displayedData.length, batchSize, delay, hasMore, isLoading])

  return {
    data: displayedData,
    isLoading,
    hasMore,
    loadMore,
    totalCount: data.length
  }
}

// Enhanced lazy loading wrapper
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => 
    new Promise(resolve => {
      // Add a small delay to prevent loading flash
      setTimeout(() => {
        resolve({ default: Component })
      }, 100)
    })
  )

  return (props: P) => (
    <Suspense fallback={fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-[#F7DD0F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Enhanced image optimization hook
export const useOptimizedImage = (src: string, sizes?: string) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setError(true)
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { isLoaded, error }
}

// Enhanced intersection observer hook
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return [setRef, isIntersecting] as const
}

export default PerformanceOptimizer
