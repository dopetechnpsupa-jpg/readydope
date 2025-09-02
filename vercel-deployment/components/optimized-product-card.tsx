"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  original_price: number
  image_url: string
  category: string
  rating: number
  reviews: number
  description: string
  features: string[]
  in_stock: boolean
  discount: number
}

interface OptimizedProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onWishlist?: (product: Product) => void
  isWishlisted?: boolean
}

export default function OptimizedProductCard({ 
  product, 
  onAddToCart, 
  onWishlist, 
  isWishlisted = false 
}: OptimizedProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const router = useRouter()

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Preload image when in view
  useEffect(() => {
    if (isInView && imageRef.current) {
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.src = product.image_url
    }
      }, [isInView, product.image_url])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart(product)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onWishlist?.(product)
  }

  const handleCardClick = () => {
    router.push(`/product/${product.id}`)
  }

  return (
    <div
      ref={cardRef}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 product-card cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
          -{product.discount}%
        </div>
      )}

      {/* Wishlist Button */}
      {onWishlist && (
        <button
          onClick={handleWishlist}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1.5 sm:p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200 ${
              isWishlisted 
                ? "fill-red-500 text-red-500" 
                : "text-gray-600 dark:text-gray-400 hover:text-red-500"
            }`} 
          />
        </button>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton animate-pulse" />
        )}
        
        {isInView && (
          <img
            ref={imageRef}
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-110`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/products/placeholder.svg';
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Category (hidden on mobile) */}
        <div className="hidden sm:flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 text-center">
          {product.name}
        </h3>
        {/* Description (hidden on mobile) */}
        <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 line-clamp-2 text-center">
          {product.description}
        </p>

        {/* Price + Discount (mobile-friendly) */}
        <div>
          <div className="flex items-start justify-center space-x-2 sm:space-x-4">
            <div className="flex flex-col leading-tight text-center">
              <span className="text-sm sm:text-lg font-bold text-[#F7DD0F]">
                Rs {product.price.toLocaleString()}
              </span>
              {product.original_price > product.price && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  Rs {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
            <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] font-medium ${
              product.in_stock 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </div>
          </div>
          {/* Mobile discount removed as requested */}
        </div>

        {/* Features (hidden on mobile) */}
        <div className="hidden sm:flex flex-wrap gap-1 justify-center">
          {product.features.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90 transition-all duration-200 btn-primary text-xs sm:text-sm"
          disabled={!product.in_stock}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          {product.in_stock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
} 