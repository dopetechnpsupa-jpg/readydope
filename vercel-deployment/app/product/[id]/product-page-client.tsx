"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Heart, Star, Truck, Shield, RotateCcw, ShoppingBag, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import SupabaseCheckout from "@/components/supabase-checkout"
import { type Product } from "@/lib/products-data"

interface ProductPageClientProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    getCartCount, 
    getCartTotal, 
    cartOpen, 
    setCartOpen,
    checkoutModalOpen,
    setCheckoutModalOpen
  } = useCart()

  const handleAddToCart = () => {
    addToCart(product, quantity)
    // Show success feedback
    console.log('Added to cart:', product, 'Quantity:', quantity)
  }

  const handleBuyNow = () => {
    // Buy now logic here
    console.log('Buy now:', product)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }



  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black backdrop-blur-md border-b border-[#F7DD0F]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
                         <Button
               variant="ghost"
               onClick={() => {
                 // Navigate with a parameter to skip loading screen
                 router.push('/?fromProduct=true', { scroll: false })
               }}
               className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-white hover:bg-[#F7DD0F]/20"
             >
               <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
               <span className="hidden sm:inline">Back</span>
             </Button>
             <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-white truncate max-w-[200px] sm:max-w-none">
               {product.name}
             </h1>
             <Button
               variant="ghost"
               onClick={() => setCartOpen(true)}
               className="relative flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-white hover:bg-[#F7DD0F]/20"
             >
               <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
               <span className="hidden sm:inline">Cart</span>
               {getCartCount() > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#F7DD0F] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                   {getCartCount()}
                 </span>
               )}
             </Button>
          </div>
        </div>
      </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto xl:mx-0">
                         {/* Main Image */}
             <div className="aspect-square max-w-md mx-auto xl:max-w-lg bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-[#F7DD0F]/30 group">
               <div className="relative w-full h-full">
                 <img
                   src={product.image_url}
                   alt={product.name}
                   className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               </div>
             </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 max-w-md mx-auto xl:mx-0">
              {[product.image_url, product.image_url, product.image_url, product.image_url, product.image_url, product.image_url].map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]/50 ${
                    selectedImage === index 
                      ? 'border-[#F7DD0F] shadow-lg ring-2 ring-[#F7DD0F]/30' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-[#F7DD0F]/50 hover:shadow-md'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F7DD0F]">
                  Rs {product.price.toLocaleString()}
                </span>
                {product.original_price > product.price && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm sm:text-base text-gray-400 line-through">
                      Rs {product.original_price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-black/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-[#F7DD0F]/20">
              <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Description</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {product.description || "Experience premium quality with our latest product. Designed for performance and durability, this item offers exceptional value and modern aesthetics."}
              </p>
            </div>









                         {/* Quantity */}
             <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
               <label className="text-sm sm:text-base font-medium text-white block">
                 Quantity
               </label>
               <div className="w-full">
                 <div className="flex items-center border border-[#F7DD0F]/40 rounded-md bg-black focus-within:border-[#F7DD0F]/60 focus-within:ring-2 focus-within:ring-[#F7DD0F]/20 transition-all duration-200 p-1">
                   <button
                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
                     className="px-4 sm:px-6 py-3 sm:py-2 text-white hover:text-[#F7DD0F] hover:bg-[#F7DD0F]/20 active:bg-[#F7DD0F]/30 transition-all duration-200 text-base sm:text-base font-medium rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]/50 flex-1"
                     disabled={quantity <= 1}
                   >
                     -
                   </button>
                   <input
                     type="number"
                     value={quantity}
                     onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                     className="flex-1 text-center border-none bg-transparent focus:outline-none text-base sm:text-base font-medium text-white px-2"
                     min="1"
                   />
                   <button
                     onClick={() => setQuantity(quantity + 1)}
                     className="px-4 sm:px-6 py-3 sm:py-2 text-white hover:text-[#F7DD0F] hover:bg-[#F7DD0F]/20 active:bg-[#F7DD0F]/30 transition-all duration-200 text-base sm:text-base font-medium rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]/50 flex-1"
                   >
                     +
                   </button>
                 </div>
               </div>
             </div>

                         {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
               <Button
                 onClick={handleBuyNow}
                 className="w-full sm:flex-1 bg-gradient-to-r from-[#F7DD0F] to-[#F7DD0F]/80 hover:from-[#F7DD0F]/90 hover:to-[#F7DD0F] text-black py-5 sm:py-4 text-lg sm:text-base font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Buy now
               </Button>
               <Button
                 onClick={handleAddToCart}
                 className="w-full sm:flex-1 bg-gradient-to-r from-[#F7DD0F] to-[#F7DD0F]/80 hover:from-[#F7DD0F]/90 hover:to-[#F7DD0F] text-black py-5 sm:py-4 text-lg sm:text-base font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Add to cart
               </Button>
             </div>

             {/* Service Info */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
               <div className="bg-black p-2 sm:p-3 rounded-md sm:rounded-lg border border-[#F7DD0F]/30">
                 <div className="flex items-center gap-1 mb-1">
                   <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-[#F7DD0F]" />
                   <span className="font-medium text-xs text-white">Return & refund policy</span>
                 </div>
                 <p className="text-xs text-gray-300">
                   Safe payments and secure personal details
                 </p>
               </div>
               <div className="bg-black p-2 sm:p-3 rounded-md sm:rounded-lg border border-[#F7DD0F]/30">
                 <div className="flex items-center gap-1 mb-1">
                   <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#F7DD0F]" />
                   <span className="font-medium text-xs text-white">Security & Privacy</span>
                </div>
                 <p className="text-xs text-gray-300">
                   Safe payments and secure personal details
                 </p>
               </div>
             </div>


          </div>
        </div>

                 {/* Related Items */}
         <div className="mt-8 sm:mt-12">
           <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center">
             Related items
           </h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
             {relatedProducts.map((relatedProduct) => (
               <div
                 key={relatedProduct.id}
                 onClick={() => router.push(`/product/${relatedProduct.id}`)}
                 className="bg-black rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-[#F7DD0F]/30 hover:border-[#F7DD0F]/60 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]/50 active:scale-[0.98]"
                 tabIndex={0}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     router.push(`/product/${relatedProduct.id}`)
                   }
                 }}
               >
                 <div className="aspect-square overflow-hidden">
                   <img
                     src={relatedProduct.image_url}
                     alt={relatedProduct.name}
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                     loading="lazy"
                   />
                 </div>
                 <div className="p-1 sm:p-2">
                   <h3 className="text-xs font-medium text-white line-clamp-2 mb-1 leading-tight group-hover:text-[#F7DD0F] transition-colors duration-200">
                     {relatedProduct.name}
                   </h3>
                   <p className="text-xs sm:text-sm font-bold text-[#F7DD0F] group-hover:scale-105 transition-transform duration-200">
                     Rs {relatedProduct.price.toLocaleString()}
                   </p>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </div>

      {/* Shopping Cart Sidebar - Mobile Optimized */}
      {/* Enhanced Shopping Cart Sidebar - Mobile Optimized */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          
          <div className="relative ml-auto w-full max-w-[85vw] sm:max-w-sm md:max-w-md bg-black shadow-2xl rounded-l-3xl border-l border-[#F7DD0F]/20">
            <div className="flex flex-col h-full">
              {/* Enhanced Cart Header - Mobile Optimized */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#F7DD0F]/20">
                <h2 className="text-lg sm:text-xl font-bold text-white">Shopping Cart</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-3 sm:p-3 hover:bg-[#F7DD0F]/10 rounded-full transition-colors touch-target"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>

              {/* Enhanced Cart Items - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scrollbar-hide">
                {cart.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-400 text-base sm:text-lg">Your cart is empty</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Add some products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-black border border-[#F7DD0F]/20 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 leading-tight text-white mb-1">{item.name}</h3>
                            <p className="text-[#F7DD0F] font-bold text-base sm:text-lg mb-2">Rs {item.price}</p>
                            
                            {/* Quantity Controls - Mobile Optimized */}
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 sm:p-2.5 hover:bg-[#F7DD0F]/20 rounded-lg transition-colors touch-target"
                                style={{ minHeight: '40px', minWidth: '40px' }}
                              >
                                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </button>
                              <span className="w-8 sm:w-10 text-center font-bold text-white text-base sm:text-lg">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 sm:p-2.5 hover:bg-[#F7DD0F]/20 rounded-lg transition-colors touch-target"
                                style={{ minHeight: '40px', minWidth: '40px' }}
                              >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Mobile Optimized */}
                          <div className="flex flex-col space-y-2 flex-shrink-0">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 sm:p-2.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors touch-target"
                              style={{ minHeight: '40px', minWidth: '40px' }}
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Cart Footer - Mobile Optimized */}
              {cart.length > 0 && (
                <div className="border-t border-[#F7DD0F]/20 p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-4">
                    <span className="text-base sm:text-lg font-semibold text-white">Total:</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#F7DD0F]">
                      Rs {getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setCartOpen(false)
                      setCheckoutModalOpen(true)
                    }}
                    className="w-full bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black py-4 sm:py-4 px-4 sm:px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-base sm:text-base touch-target"
                    style={{ minHeight: '48px' }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Supabase Checkout Modal */}
      <SupabaseCheckout
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        total={getCartTotal()}
        onCartReset={() => {
          // Cart will be cleared by the SupabaseCheckout component
        }}
      />
    </div>
  )
}
