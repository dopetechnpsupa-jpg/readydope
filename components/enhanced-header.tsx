"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  User, 
  Home,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useLogoUrl } from '@/hooks/use-assets'

interface HeaderProps {
  onSearchToggle?: () => void
  onCategorySelect?: (category: string) => void
  className?: string
}

export function EnhancedHeader({ onSearchToggle, onCategorySelect, className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { getCartCount } = useCart()
  const { logoUrl } = useLogoUrl()
  
  const headerRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle search focus
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isSearchOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const categories = [
    { id: 'keyboards', name: 'Keyboards', icon: Package },
    { id: 'mice', name: 'Mice', icon: Package },
    { id: 'headphones', name: 'Headphones', icon: Package },
    { id: 'speakers', name: 'Speakers', icon: Package },
    { id: 'cameras', name: 'Cameras', icon: Package },
    { id: 'cables', name: 'Cables', icon: Package },
  ]

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    onSearchToggle?.()
  }

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId)
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
  }

  return (
    <>
      {/* Enhanced Header */}
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-dark shadow-xl border-b border-white/10' 
            : 'glass-dark'
        } ${className}`}
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
            
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="DopeTech Nepal" 
                  className="h-6 w-auto sm:h-7 md:h-8 lg:h-10"
                />
              ) : (
                <div className="h-6 w-24 sm:h-7 sm:w-28 md:h-8 md:w-32 lg:h-10 lg:w-40 bg-primary rounded-lg animate-pulse" />
              )}
              <span className="hidden sm:block text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                DopeTech
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 font-medium text-sm lg:text-base"
                onClick={() => handleCategoryClick('all')}
              >
                Home
              </motion.button>
              
              {/* Categories Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 font-medium text-sm lg:text-base"
                  onClick={() => setActiveDropdown(activeDropdown === 'categories' ? null : 'categories')}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 ${
                    activeDropdown === 'categories' ? 'rotate-180' : ''
                  }`} />
                </motion.button>
                
                <AnimatePresence>
                  {activeDropdown === 'categories' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 lg:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2"
                    >
                      {categories.map((category) => (
                        <motion.button
                          key={category.id}
                          whileHover={{ backgroundColor: 'rgba(247, 221, 15, 0.1)' }}
                          className="w-full px-3 lg:px-4 py-2 lg:py-3 text-left text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 flex items-center space-x-2 lg:space-x-3 text-sm lg:text-base"
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          <category.icon className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>{category.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 lg:p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200"
                onClick={toggleSearch}
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-1.5 lg:p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200"
              >
                <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
                {getCartCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-secondary text-xs font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 lg:p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200"
              >
                <User className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <div className="container-responsive py-3 sm:py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-1 sm:space-y-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category.id}
                        whileHover={{ x: 5 }}
                        className="w-full flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 text-left text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm sm:text-base"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <category.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </nav>

                  {/* Contact Info */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Contact</h3>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>+977 1234567890</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>info@dopetech.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Kathmandu, Nepal</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-3 sm:space-x-4">
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                    >
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                    >
                      <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                    >
                      <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.a>
                  </div>
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Cart ({getCartCount()})
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-14 sm:h-16 md:h-18 lg:h-20" />
    </>
  )
}

