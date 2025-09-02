"use client"

import Image from 'next/image'
import { Search, ShoppingBag, Menu, Instagram } from 'lucide-react'
import { useState } from 'react'
import { useLogoUrl } from "@/hooks/use-assets"
import { HeroImageCarousel } from "@/components/hero-image-carousel"

interface HeroSectionProps {
  cartCount: number
  onCartClick: () => void
}

export default function HeroSection({ cartCount, onCartClick }: HeroSectionProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { logoUrl, loading: logoLoading } = useLogoUrl()

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#F7DD0F]/10 rounded-full blur-3xl animate-pulse animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F7DD0F]/5 rounded-full blur-3xl animate-pulse delay-1000 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
                     <div className="flex items-center space-x-2 md:space-x-3">
            <Image
              src={logoLoading ? "/logo/dopelogo.svg" : logoUrl}
              alt="DopeTech"
              width={320}
              height={320}
              className="w-64 h-64 md:w-80 md:h-80 logo-adaptive hover-scale"
              style={{ minWidth: '256px', minHeight: '256px' }}
            />
           </div>

          {/* Desktop Search and Cart */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] transition-all premium-transition"
              />
            </div>

                         <button
               onClick={onCartClick}
               className="relative p-3 hover:bg-white/10 rounded-lg transition-colors touch-manipulation hover-scale hover-glow"
               style={{ minHeight: '44px', minWidth: '44px' }}
             >
               <ShoppingBag className="w-6 h-6 text-white" />
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#F7DD0F] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in">
                   {cartCount}
                 </span>
               )}
             </button>

             {/* Instagram Button */}
             <a
               href="https://www.instagram.com/dopetech_np/?hl=ne"
               target="_blank"
               rel="noopener noreferrer"
               className="relative p-3 hover:bg-white/10 rounded-lg transition-colors touch-manipulation hover-scale hover-glow"
               style={{ minHeight: '44px', minWidth: '44px' }}
             >
               <Instagram className="w-6 h-6 text-white" />
             </a>
          </div>

          {/* Mobile Search and Cart */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Search className="w-5 h-5 text-white" />
            </button>

            {/* Mobile Cart */}
                         <button
               onClick={onCartClick}
               className="relative p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
               style={{ minHeight: '44px', minWidth: '44px' }}
             >
               <ShoppingBag className="w-5 h-5 text-white" />
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#F7DD0F] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in">
                   {cartCount}
                 </span>
               )}
             </button>

             {/* Instagram Button */}
             <a
               href="https://www.instagram.com/dopetech_np/?hl=ne"
               target="_blank"
               rel="noopener noreferrer"
               className="relative p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
               style={{ minHeight: '44px', minWidth: '44px' }}
             >
               <Instagram className="w-5 h-5 text-white" />
             </a>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="mt-4 animate-slide-in-down">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] transition-all premium-transition"
                style={{ minHeight: '48px' }}
                autoFocus
              />
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 jakarta-light animate-fade-in-up stagger-1 leading-tight">
          Premium Tech Gear
          <span className="text-[#F7DD0F] block animate-fade-in-up stagger-2">from DopeTech Nepal</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-10 max-w-3xl mx-auto jakarta-light px-4 animate-fade-in-up stagger-3 leading-relaxed">
          Discover our premium collection of mechanical keyboards, gaming mice, wireless headphones, and more.
        </p>
        
        {/* Hero Image Carousel */}
        <div className="mb-8 md:mb-10 animate-fade-in-up stagger-4">
          <HeroImageCarousel />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up stagger-5">
          <button 
            className="w-full sm:w-auto bg-[#F7DD0F] text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#F7DD0F]/90 transition-colors jakarta-light touch-manipulation premium-button hover-lift"
            style={{ minHeight: '56px' }}
          >
            Shop Now
          </button>
          <button 
            className="w-full sm:w-auto border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors jakarta-light touch-manipulation"
            style={{ minHeight: '56px' }}
          >
            View Categories
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce animate-fade-in-up stagger-5">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
} 