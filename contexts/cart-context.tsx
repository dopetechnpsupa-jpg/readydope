"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type Product } from '@/lib/products-data'

// Cart item type definition
interface CartItem extends Product {
  quantity: number
  selectedColor?: string
  selectedFeatures?: string[]
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedFeatures?: string[]) => void
  updateQuantity: (productId: number, newQuantity: number) => void
  removeFromCart: (productId: number) => void
  updateCartItemSelections: (productId: number, selectedColor?: string, selectedFeatures?: string[]) => void
  getCartCount: () => number
  getCartTotal: () => number
  clearCart: () => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  checkoutModalOpen: boolean
  setCheckoutModalOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)

  // Load cart from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          console.log('🛒 Loading cart from localStorage:', parsedCart)
          setCart(parsedCart)
        } catch (e) {
          console.error('Error parsing cart:', e)
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🛒 Saving cart to localStorage:', cart)
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart])

  const addToCart = (product: Product, quantity: number = 1, selectedColor?: string, selectedFeatures?: string[]) => {
    console.log('🛒 Adding to cart:', {
      productId: product.id,
      productName: product.name,
      quantity,
      selectedColor,
      selectedFeatures
    })
    
    setCart(prevCart => {
      // If no selections are provided, check if there's already an item with this product ID
      // that has no selections (can be updated later)
      if (!selectedColor && (!selectedFeatures || selectedFeatures.length === 0)) {
        const existingItemWithoutSelections = prevCart.find(item => 
          item.id === product.id && 
          !item.selectedColor && 
          (!item.selectedFeatures || item.selectedFeatures.length === 0)
        )
        
        if (existingItemWithoutSelections) {
          return prevCart.map(item =>
            item.id === product.id && 
            !item.selectedColor && 
            (!item.selectedFeatures || item.selectedFeatures.length === 0)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
      }
      
      // Check for exact match (same product with same selections)
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        item.selectedColor === selectedColor && 
        JSON.stringify(item.selectedFeatures) === JSON.stringify(selectedFeatures)
      )
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && 
          item.selectedColor === selectedColor && 
          JSON.stringify(item.selectedFeatures) === JSON.stringify(selectedFeatures)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const newItem = { 
          ...product, 
          quantity,
          selectedColor,
          selectedFeatures: selectedFeatures || []
        }
        console.log('🛒 New cart item:', newItem)
        return [...prevCart, newItem]
      }
    })
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateCartItemSelections = (productId: number, selectedColor?: string, selectedFeatures?: string[]) => {
    console.log('🛒 Updating cart item selections:', {
      productId,
      selectedColor,
      selectedFeatures
    })
    
    setCart(prevCart => {
      // Find the item to update
      const itemIndex = prevCart.findIndex(item => item.id === productId)
      if (itemIndex === -1) return prevCart
      
      const updatedCart = [...prevCart]
      updatedCart[itemIndex] = {
        ...updatedCart[itemIndex],
        selectedColor,
        selectedFeatures: selectedFeatures || []
      }
      
      console.log('🛒 Updated cart item:', updatedCart[itemIndex])
      return updatedCart
    })
  }

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const clearCart = () => {
    setCart([])
  }

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateCartItemSelections,
    getCartCount,
    getCartTotal,
    clearCart,
    cartOpen,
    setCartOpen,
    checkoutModalOpen,
    setCheckoutModalOpen
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
