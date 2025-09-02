'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'
    
    // Add scroll progress indicator
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.body.offsetHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      
      const indicator = document.querySelector('.scroll-indicator') as HTMLElement
      if (indicator) {
        indicator.style.transform = `scaleX(${scrollPercent / 100})`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Add scroll progress indicator to DOM
  useEffect(() => {
    const indicator = document.createElement('div')
    indicator.className = 'scroll-indicator'
    document.body.appendChild(indicator)
    
    return () => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator)
      }
    }
  }, [])

  return (
    <div className={`page-transition ${isTransitioning ? 'transitioning' : ''}`}>
      {children}
    </div>
  )
}

// Enhanced navigation hook for fluid transitions
export function useFluidNavigation() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithTransition = (href: string, delay: number = 300) => {
    setIsNavigating(true)
    
    // Add exit animation
    document.body.style.overflow = 'hidden'
    
    setTimeout(() => {
      router.push(href)
      setIsNavigating(false)
      document.body.style.overflow = 'unset'
    }, delay)
  }

  return { navigateWithTransition, isNavigating }
}

// Scroll animation hook
export function useScrollAnimation() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll('.scroll-animate')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

// Smooth scroll to element
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return { scrollToElement, scrollToTop }
}
