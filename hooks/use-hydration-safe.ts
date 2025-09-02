import { useState, useEffect } from 'react'

export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

export function useResponsiveClass(baseClass: string, mobileClass?: string, desktopClass?: string) {
  const isHydrated = useHydrationSafe()
  
  if (!isHydrated) {
    // Return base class during SSR to prevent hydration mismatch
    return baseClass
  }
  
  // On client side, return responsive classes
  if (mobileClass && desktopClass) {
    return `${baseClass} ${mobileClass} ${desktopClass}`
  }
  
  return baseClass
}
