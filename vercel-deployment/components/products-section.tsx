"use client"

import { useState, useMemo } from 'react'
import { Headphones, Keyboard, Mouse, Speaker, Search, Filter } from 'lucide-react'
import OptimizedProductCard from './optimized-product-card'

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

interface ProductsSectionProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

const categories = [
  { id: 'all', name: 'All', icon: null },
  { id: 'keyboard', name: 'Keyboards', icon: Keyboard },
  { id: 'mouse', name: 'Mice', icon: Mouse },
  { id: 'audio', name: 'Audio', icon: Headphones },
  { id: 'speaker', name: 'Speakers', icon: Speaker },
]

export default function ProductsSection({ products, onAddToCart }: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchTerm])

  return (
    <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 jakarta-light">
            Featured Products
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 jakarta-light">
            Discover our premium collection of tech gear
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="mb-4 sm:mb-6 md:hidden animate-fade-in-up stagger-1">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full px-10 sm:px-12 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#F7DD0F] focus:ring-4 focus:ring-[#F7DD0F]/20 touch-manipulation premium-transition text-sm sm:text-base"
              style={{ minHeight: '48px', minWidth: '44px' }}
            />
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block mb-6 sm:mb-8 animate-fade-in-up stagger-1">
          <div className="max-w-sm sm:max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 sm:px-12 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#F7DD0F] focus:ring-4 focus:ring-[#F7DD0F]/20 touch-manipulation premium-transition text-sm sm:text-base"
                style={{ minHeight: '44px', minWidth: '44px' }}
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6 sm:mb-8 md:mb-10 animate-fade-in-up stagger-2">
          {/* Mobile Category Scroll */}
          <div className="md:hidden">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide -mx-4 px-4">
              {categories.map((category, index) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl whitespace-nowrap transition-all touch-manipulation premium-transition flex-shrink-0 ${
                      selectedCategory === category.id
                        ? 'bg-[#F7DD0F] text-black shadow-lg shadow-[#F7DD0F]/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ 
                      minHeight: '44px',
                      minWidth: '44px',
                      animationDelay: `${(index + 1) * 0.1}s`
                    }}
                  >
                    {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="text-sm sm:text-base font-medium">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Desktop Category Grid */}
          <div className="hidden md:grid md:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all touch-manipulation premium-transition hover-scale ${
                    selectedCategory === category.id
                      ? 'bg-[#F7DD0F] text-black shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                  style={{ 
                    minHeight: '48px',
                    minWidth: '44px',
                    animationDelay: `${(index + 1) * 0.1}s`
                  }}
                >
                  {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="text-sm sm:text-base font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <OptimizedProductCard
                product={product}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16 animate-fade-in-up">
            <div className="max-w-sm sm:max-w-md mx-auto">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="bg-[#F7DD0F] text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-[#F7DD0F]/90 transition-colors touch-manipulation text-sm sm:text-base"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 