'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: number
  image: string
  header: string
  subtitle?: string
  description: string
  link?: string
  showContent: boolean
}

interface SlidingCardCarouselProps {
  slides: Slide[]
  autoPlayInterval?: number
  className?: string
}

export function SlidingCardCarousel({ 
  slides, 
  autoPlayInterval = 5000,
  className = ""
}: SlidingCardCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Reset currentSlide if it goes out of bounds
  useEffect(() => {
    if (slides && slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0)
    }
  }, [slides, currentSlide])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length, autoPlayInterval])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleSlideClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on navigation elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }
    
    const currentSlideData = slides[safeCurrentSlide]
    if (currentSlideData?.link) {
      window.open(currentSlideData.link, '_blank')
    }
  }

  // Add error handling and debugging
  console.log('SlidingCardCarousel - slides:', slides, 'currentSlide:', currentSlide)
  
  if (!slides || slides.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 sm:h-48 bg-gradient-to-br from-black via-[#F7DD0F]/20 to-black rounded-2xl ${className}`}>
        <div className="text-center">
          <p className="text-[#F7DD0F] font-semibold">No Hero Images Available</p>
          <p className="text-gray-400 text-sm">Please upload some images in the admin panel</p>
        </div>
      </div>
    )
  }

  // Ensure currentSlide is within bounds
  const safeCurrentSlide = Math.min(Math.max(0, currentSlide), slides.length - 1)
  const currentSlideData = slides[safeCurrentSlide]

  return (
         <div 
               className={`relative overflow-hidden rounded-2xl bg-black shadow-2xl ${className} ${currentSlideData?.link ? 'cursor-pointer' : ''}`}
       onMouseEnter={handleMouseEnter}
       onMouseLeave={handleMouseLeave}
       onTouchStart={onTouchStart}
       onTouchMove={onTouchMove}
       onTouchEnd={onTouchEnd}
       onClick={(e) => handleSlideClick(e)}
       role="region"
       aria-label="Product showcase carousel"
       tabIndex={0}
     >
      {/* Main Carousel Container */}
             <div className="relative h-full min-h-[150px] sm:min-h-[300px] md:min-h-[360px]">
        <AnimatePresence mode="wait">
                    <motion.div
            key={safeCurrentSlide}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94],
              staggerChildren: 0.1
            }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: currentSlideData?.image ? `url(${currentSlideData.image})` : 'none' }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            </div>

            {/* Content Display */}
            {currentSlideData?.showContent && currentSlideData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute inset-0 flex items-center justify-center z-10 px-4 sm:px-6 md:px-8"
              >
                <div className="max-w-md sm:max-w-lg md:max-w-xl text-center space-y-4 sm:space-y-6">
                  {/* Title */}
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                  >
                    {currentSlideData.header}
                  </motion.h2>
                  
                  {/* Subtitle */}
                  {currentSlideData.subtitle && (
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-lg sm:text-xl md:text-2xl text-[#F7DD0F] font-semibold"
                    >
                      {currentSlideData.subtitle}
                    </motion.p>
                  )}
                  
                  {/* Description */}
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed"
                  >
                    {currentSlideData.description}
                  </motion.p>
                  
                  {/* Call to Action Button */}
                  {currentSlideData.link && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(currentSlideData.link, '_blank')
                      }}
                      className="bg-[#F7DD0F] text-black px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold hover:bg-[#F7DD0F]/90 transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      Learn More
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}




          </motion.div>
        </AnimatePresence>



        {/* Navigation Arrows - Desktop Only */}
        {slides.length > 1 && (
          <>
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-black/50 hover:border-white/40 transition-all duration-300 group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-[#F7DD0F] transition-colors" />
            </motion.button>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-black/50 hover:border-white/40 transition-all duration-300 group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-[#F7DD0F] transition-colors" />
            </motion.button>
          </>
        )}


      </div>
    </div>
  )
}

// Default slides for demonstration
export const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/products/keyboard.png',
    header: 'Premium Gaming Keyboards',
    subtitle: 'Ultimate Precision & Performance',
    description: 'Experience ultimate precision and performance with our collection of high-end mechanical keyboards designed for gamers and professionals.',
    link: '/product/1',
    showContent: true
  },
  {
    id: 2,
    image: '/products/mouse.png',
    header: 'Ergonomic Gaming Mice',
    subtitle: 'Advanced Sensors & RGB Lighting',
    description: 'Dominate your games with precision-engineered mice featuring advanced sensors and customizable RGB lighting.',
    link: '/product/2',
    showContent: true
  },
  {
    id: 3,
    image: '/products/headphones.png',
    header: 'Immersive Audio Experience',
    subtitle: 'Crystal Clear Sound',
    description: 'Crystal clear sound and premium comfort with our selection of gaming headsets and professional audio equipment.',
    link: '/product/3',
    showContent: true
  },
  {
    id: 4,
    image: '/products/speaker.png',
    header: 'Studio-Quality Speakers',
    subtitle: 'Rich, Detailed Sound',
    description: 'Transform your setup with powerful speakers that deliver rich, detailed sound for music, gaming, and entertainment.',
    link: '/product/4',
    showContent: true
  }
]
