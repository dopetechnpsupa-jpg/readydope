'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import type { Product } from '@/lib/products-data'
import { getPrimaryImageUrl } from '@/lib/products-data'
import { generateProductUrl } from '@/lib/seo-utils'

interface DopeDailyShowcaseProps {
  products: Product[]
  onAddToCart?: (product: Product) => void
  className?: string
}

export function DopeDailyShowcase({ 
  products, 
  onAddToCart,
  className = ""
}: DopeDailyShowcaseProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [slotProducts, setSlotProducts] = useState<{
    slot1: Product
    slot2: Product
    slot3: Product
  } | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Function to get 3 random discounted products
  const getRandomProducts = () => {
    if (!products || products.length === 0) return null
    
    // Filter out products that should be hidden on home and only show discounted items
    const discountedProducts = products.filter(product => 
      !product.hidden_on_home && 
      (product.discount > 0 || (product.original_price && product.original_price > product.price))
    )
    
    if (discountedProducts.length === 0) return null
    
    // Shuffle the array and pick 3 different products
    const shuffled = [...discountedProducts].sort(() => Math.random() - 0.5)
    const selectedProducts = shuffled.slice(0, 3)
    
    if (selectedProducts.length === 3) {
      return {
        slot1: selectedProducts[0],
        slot2: selectedProducts[1],
        slot3: selectedProducts[2]
      }
    }
    
    // If we don't have 3 discounted products, return what we have
    if (selectedProducts.length > 0) {
      const result: any = {}
      selectedProducts.forEach((product, index) => {
        result[`slot${index + 1}`] = product
      })
      return result
    }
    
    return null
  }

  useEffect(() => {
    const randomProducts = getRandomProducts()
    setSlotProducts(randomProducts)
  }, [products])

  if (!products || products.length === 0) {
    // Show fallback with example products
    const fallbackProducts: Product[] = [
      {
        id: 999,
        name: "OnePlus Nord Buds 3 Pro",
        description: "Experience premium sound quality with active noise cancellation",
        price: 2500,
        original_price: 3200,
        category: "Earphone",
        features: [
          "10 mins for 11 hrs fast charging",
          "Up to 49 dB Smart Noise Cancellation", 
          "6,000 Hz Hi-Res Audio"
        ],
        image_url: "/products/earphones.png",
        discount: 22,
        hidden_on_home: false,
        rating: 4.8,
        reviews: 1250,
        stock_quantity: 50,
        color: "Pearl White",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 998,
        name: "Gaming Mechanical Keyboard",
        description: "RGB backlit mechanical keyboard with Cherry MX switches",
        price: 8500,
        original_price: 10000,
        category: "Keyboard",
        features: [
          "Cherry MX Blue switches",
          "RGB backlight customization",
          "Programmable macro keys"
        ],
        image_url: "/products/keyboard.png",
        discount: 15,
        hidden_on_home: false,
        rating: 4.6,
        reviews: 890,
        stock_quantity: 25,
        color: "Black",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    return (
      <DopeDailyShowcase 
        products={fallbackProducts}
        onAddToCart={onAddToCart}
        className={className}
      />
    )
  }

  const handleShopNow = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleViewProduct = (product: Product) => {
    // Redirect to product detail page
    window.location.href = generateProductUrl(product)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative overflow-hidden rounded-3xl bg-black/10 backdrop-blur-xl shadow-2xl ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] pattern-dots"></div>
      </div>

      {/* Header Section */}
      <div className="relative pt-1 pb-3 px-3 sm:p-6 md:p-8 sm:pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 sm:gap-3 bg-[#F7DD0F] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base md:text-lg font-bold shadow-xl"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          Dope Daily Picks
        </motion.div>
      </div>

             {/* Slots Structure - Discounted Products Only */}
       <div className="relative px-2 sm:px-8 pb-4 sm:pb-6 md:pb-8">
         <div className={`grid gap-2 sm:gap-4 max-w-7xl mx-auto ${
           slotProducts ? 
             (slotProducts.slot3 ? 'grid-cols-3' : 
              slotProducts.slot2 ? 'grid-cols-2' : 'grid-cols-1') 
             : 'grid-cols-3'
         }`}>
           {/* Slot 1 */}
           {slotProducts && slotProducts.slot1 && (
             <SlotProduct
               product={slotProducts.slot1}
               onAddToCart={handleShopNow}
               onViewProduct={handleViewProduct}
             />
           )}
           
           {/* Slot 2 */}
           {slotProducts && slotProducts.slot2 && (
             <SlotProduct
               product={slotProducts.slot2}
               onAddToCart={handleShopNow}
               onViewProduct={handleViewProduct}
             />
           )}
           
           {/* Slot 3 */}
           {slotProducts && slotProducts.slot3 && (
             <SlotProduct
               product={slotProducts.slot3}
               onAddToCart={handleShopNow}
               onViewProduct={handleViewProduct}
             />
           )}
         </div>
       </div>

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-4 right-4 w-12 h-12 bg-black/10 rounded-full blur-xl"
      />
      
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1 
        }}
        className="absolute bottom-8 left-8 w-8 h-8 bg-black/10 rounded-full blur-lg"
      />
    </motion.div>
  )
}

// Slot Product Component
interface SlotProductProps {
  product: Product
  onAddToCart: (product: Product) => void
  onViewProduct: (product: Product) => void
}

function SlotProduct({ product, onAddToCart, onViewProduct }: SlotProductProps) {
  if (!product) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-[#feda00]/30 min-h-[120px] sm:min-h-[140px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F7DD0F]/20 rounded-full mx-auto mb-2 flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F7DD0F]" />
          </div>
          <p className="text-xs sm:text-sm text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
         <motion.div
       key={`${product.id}`}
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.5 }}
       className="bg-black/80 backdrop-blur-sm rounded-2xl p-2 sm:p-3 md:p-2 lg:p-2 border border-[#feda00]/30 hover:bg-black/90 transition-all duration-300 shadow-lg cursor-pointer"
       onClick={() => onViewProduct(product)}
     >


             {/* Product Image with Overlay Buttons */}
       <div className="w-full aspect-[3/2] sm:aspect-[3/2] md:aspect-[5/3] lg:aspect-[5/3] relative rounded-xl overflow-hidden mb-2 sm:mb-3 md:mb-2 lg:mb-2 group">
         <img
           src={getPrimaryImageUrl(product)}
           alt={product.name}
           className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
           onError={(e) => {
             const target = e.target as HTMLImageElement;
             target.src = '/placeholder-product.svg';
           }}
         />
         
         {/* Discount Badge */}
         {product.discount > 0 && (
           <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
             -{product.discount}%
           </div>
         )}

         {/* Overlay Buttons - Hidden by default, shown on hover */}
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
           <div className="flex gap-2">
             {/* Buy button - hidden on mobile */}
             <button
               onClick={(e) => {
                 e.stopPropagation()
                 onViewProduct(product)
               }}
               className="hidden sm:inline-flex group/btn bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90 transition-all duration-200 font-semibold px-3 py-2 rounded-full text-xs shadow-lg hover:scale-105"
             >
               Buy
               <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform inline ml-1" />
             </button>
             
             <button
               onClick={(e) => {
                 e.stopPropagation()
                 onAddToCart(product)
               }}
               className="group/btn border border-white text-white hover:bg-[#feda00] hover:text-black transition-all duration-200 font-semibold px-3 py-2 rounded-full text-xs shadow-lg hover:scale-105"
             >
               Cart
               <ShoppingBag className="w-3 h-3 group-hover/btn:scale-110 transition-transform inline ml-1" />
             </button>
           </div>
         </div>
       </div>

                {/* Product Info */}
         <div className="space-y-1 sm:space-y-2 md:space-y-1 lg:space-y-1">
           {/* Category */}
           <p className="text-white/70 text-sm sm:text-base font-semibold uppercase tracking-wider">
             {product.category}
           </p>

           {/* Title */}
           <h3 className="text-xs sm:text-sm md:text-sm lg:text-sm font-bold text-white leading-tight line-clamp-2">
             {product.name}
           </h3>

           {/* Price */}
           <div className="dope-daily-price-desktop">
             <span className="text-sm sm:text-base md:text-base lg:text-base font-bold text-[#F7DD0F]">
               Rs {product.price?.toLocaleString()}
             </span>
             {product.original_price && product.original_price > product.price && (
               <span className="text-xs sm:text-sm text-white/50 line-through">
                 Rs {product.original_price.toLocaleString()}
               </span>
             )}
           </div>


       </div>

      
    </motion.div>
  )
}

export default DopeDailyShowcase
