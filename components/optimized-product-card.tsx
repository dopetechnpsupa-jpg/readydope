"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getPrimaryImageUrl } from "@/lib/products-data"
import { generateProductUrl } from "@/lib/seo-utils"

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
      img.src = getPrimaryImageUrl(product)
    }
      }, [isInView, product])

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
    router.push(generateProductUrl(product))
  }

  return (
    <div
      ref={cardRef}
      className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 product-card cursor-pointer border border-yellow-500/20 hover:border-yellow-500/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Top Section - Image with White Background */}
      <div className="relative aspect-square overflow-hidden bg-white">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton animate-pulse bg-gray-700" />
        )}
        
        {isInView && (
          <img
            ref={imageRef}
            src={getPrimaryImageUrl(product)}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } group-hover:scale-110`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.svg';
            }}
          />
        )}

        {/* Text Overlay on Image */}
        <div className="absolute top-3 left-3 z-10">
          <div className="text-white font-bold text-sm italic">
            {product.category.toUpperCase()}
          </div>
          <div className="text-white text-xs">
            {product.features && product.features.length > 0 ? product.features[0] : 'PREMIUM QUALITY'}
          </div>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.in_stock 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {product.in_stock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        {/* Wishlist Button */}
        {onWishlist && (
          <button
            onClick={handleWishlist}
            className="absolute bottom-3 right-3 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-black/70"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              className={`w-4 h-4 transition-colors duration-200 ${
                isWishlisted 
                  ? "fill-red-500 text-red-500" 
                  : "text-white hover:text-red-500"
              }`} 
            />
          </button>
        )}

        {/* Add to Cart Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            onClick={handleAddToCart}
            className="bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-200 font-semibold"
            disabled={!product.in_stock}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Bottom Section - Product Info */}
      <div className="p-4 bg-gray-800">
        {/* Product Name */}
        <h3 className="text-kelpt-a2 text-white text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl price-proxima-nova text-yellow-400">
              Rs {product.price.toLocaleString()}
            </span>
            {product.original_price > product.price && (
              <span className="text-sm price-proxima-nova text-gray-400 line-through">
                Rs {product.original_price.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{product.discount}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 