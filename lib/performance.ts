// Performance optimization utilities

// Debounce function for search and scroll events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

// Preload images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject()
    img.src = src
  })
}

// Preload critical images
export function preloadCriticalImages(imageUrls: string[]): Promise<void[]> {
  return Promise.all(imageUrls.map(preloadImage))
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

// Memory usage monitoring
export function logMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    console.log('Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    })
  }
}

// Optimize images for different screen sizes
export function getOptimizedImageSrc(
  src: string,
  width: number,
  quality: number = 80
): string {
  // For static export, return original src
  // In a real app, you'd use a CDN or image optimization service
  return src
}

// Cache management
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private maxAge: number

  constructor(maxAge: number = 5 * 60 * 1000) { // 5 minutes default
    this.maxAge = maxAge
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear(): void {
    this.cache.clear()
  }
}

// Network status monitoring
export function getNetworkStatus(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'slow'
    }
    return 'fast'
  }
  return 'unknown'
}

// Optimize based on network status
export function shouldUseLowQualityImages(): boolean {
  return getNetworkStatus() === 'slow'
} 