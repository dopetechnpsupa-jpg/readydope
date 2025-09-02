'use client'

import { useState, useEffect } from 'react'
import { useHeroImages, HeroImage } from '@/hooks/use-hero-images'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function HeroImageCarousel() {
  const { activeHeroImages, loading, error } = useHeroImages()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || activeHeroImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeHeroImages.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, activeHeroImages.length])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? activeHeroImages.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === activeHeroImages.length - 1 ? 0 : prev + 1
    )
  }

  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
  }

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeHeroImages.length])

  if (loading) {
    return (
      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-gray-400 text-xs">Loading hero images...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <div className="text-red-400 text-xs">Error loading hero images: {error}</div>
      </div>
    )
  }

  if (activeHeroImages.length === 0) {
    return (
      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <div className="text-gray-400 text-xs">No hero images available</div>
      </div>
    )
  }

  const currentImage = activeHeroImages[currentIndex]

  return (
    <div 
      className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm shadow-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="region"
      aria-label="Hero image carousel - use arrow keys or click to navigate"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out"
        style={{ backgroundImage: `url(${currentImage.image_url})` }}
      />

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Navigation Arrows */}
      {activeHeroImages.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-1 sm:p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-200 hover:scale-110 group"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[#F7DD0F] transition-colors" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 p-1 sm:p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-200 hover:scale-110 group"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[#F7DD0F] transition-colors" />
          </button>
        </>
      )}

      {/* Content - Centered both horizontally and vertically */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 sm:px-8 max-w-4xl mx-auto w-full">
          {/* Only show content if show_content is true */}
          {currentImage.show_content !== false && (
            <>
              {/* Title */}
              {currentImage.title && (
                <h1 className="text-sm sm:text-base md:text-lg font-bold drop-shadow-lg animate-fade-in-up stagger-1 text-center mx-auto">
                  {currentImage.title}
                </h1>
              )}

              {/* Subtitle - Only show if no description and no button */}
              {currentImage.subtitle && !currentImage.description && !currentImage.button_text && (
                <h2 className="text-xs sm:text-sm font-semibold drop-shadow-lg text-gray-200 animate-fade-in-up stagger-2 text-center mx-auto">
                  {currentImage.subtitle}
                </h2>
              )}

              {/* Description - Only show if no button */}
              {currentImage.description && !currentImage.button_text && (
                <p className="text-xs drop-shadow-lg text-gray-300 animate-fade-in-up stagger-3 text-center mx-auto">
                  {currentImage.description}
                </p>
              )}

              {/* CTA Button - if there's a button_text and button_link */}
              {currentImage.button_text && currentImage.button_link && (
                <div className="animate-fade-in-up stagger-4 text-center">
                  <Button 
                    asChild
                    className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black font-semibold px-6 py-3 text-base transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <a href={currentImage.button_link} target="_blank" rel="noopener noreferrer">
                      {currentImage.button_text}
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dot Indicators */}
      {activeHeroImages.length > 1 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1">
          {activeHeroImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-[#F7DD0F] scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

             {/* Scroll Hint */}
       {activeHeroImages.length > 1 && (
         <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 text-center">
           <div className="text-xs text-gray-400 opacity-75">
             <span className="hidden sm:inline">← Use arrow keys or click to navigate • </span>
             <span className="sm:hidden">← Swipe to navigate • </span>
             Auto-plays when idle
           </div>
         </div>
       )}
    </div>
  )
}
