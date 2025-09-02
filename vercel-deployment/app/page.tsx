"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useLogoUrl } from "@/hooks/use-assets"

import { useRouter } from "next/navigation"
import { SlidingCardCarousel } from "@/components/sliding-card-carousel"
import { EnhancedHeader } from "@/components/enhanced-header"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { useHeroCarousel } from "@/hooks/use-hero-carousel"
import { PageTransition, useFluidNavigation, useScrollAnimation, useSmoothScroll } from "@/components/page-transition"
import { DraggableMarquee } from "@/components/draggable-marquee"
import {
  Headphones,
  Keyboard,
  Mouse,
  Speaker,
  Search,
  ShoppingBag,
  Camera,
  Cable,
  Plus,
  Minus,
  X,
  Grid,
  Menu,
  Instagram,
  Gamepad2,
  Laptop,
  Smartphone,
  Monitor,
} from "lucide-react"
// Removed CursorTracker (opt-in effect)
import LazyAIChat from "@/components/lazy-ai-chat"
import SupabaseCheckout from "@/components/supabase-checkout"
import { getProducts, getDopePicks, getWeeklyPicks, type Product } from "@/lib/products-data"
import { useCart } from "@/contexts/cart-context"

// Client-side only component to prevent hydration mismatches
const ClientOnly = ({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Product type is now imported from lib/products-data

export default function DopeTechEcommerce() {
  const router = useRouter()
  const { logoUrl, loading: logoLoading } = useLogoUrl()
  const [scrollY, setScrollY] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [dopePicks, setDopePicks] = useState<Product[]>([])
  const [weeklyPicks, setWeeklyPicks] = useState<Product[]>([])
  
  // Fluid navigation hooks
  const { navigateWithTransition, isNavigating } = useFluidNavigation()
  const { scrollToElement, scrollToTop } = useSmoothScroll()
  useScrollAnimation()
  
  // Hero carousel hook
  const { slides: heroSlides, loading: heroLoading } = useHeroCarousel()
  

  
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
    setCheckoutModalOpen,
    clearCart
  } = useCart()

  // Get products from Supabase (no local storage fallback)
  const getLocalProducts = (): Product[] => {
    return products
  }
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchDraft, setSearchDraft] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchModalReady, setSearchModalReady] = useState(false)
  const [currentProducts, setCurrentProducts] = useState<Product[]>([])
  

  
  const [showBackToCategories, setShowBackToCategories] = useState(false)
  const [showJumpButton, setShowJumpButton] = useState(false)
  const [isCategoryInView, setIsCategoryInView] = useState(true)
  const [categoryIconIndex, setCategoryIconIndex] = useState(0)
  const [headerOffset, setHeaderOffset] = useState<number>(72)
  const [isAdmin, setIsAdmin] = useState(false)
  const [promoOrder, setPromoOrder] = useState<number[]>([])
  const [draggedPromoIndex, setDraggedPromoIndex] = useState<number | null>(null)

  const [userBehavior, setUserBehavior] = useState({
    viewedProducts: [] as number[],
    cartItems: [] as number[],
    searchHistory: [] as string[]
  })

  const [animationKey, setAnimationKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [posterIndex, setPosterIndex] = useState(0)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const categorySectionRef = useRef<HTMLDivElement>(null)
  


  // Optimized scroll handler with passive listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => setScrollY(window.scrollY)
      window.addEventListener("scroll", handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Product fetching with timeout to prevent infinite loading
  useEffect(() => {
    let isMounted = true
    let fallbackTimeout: NodeJS.Timeout | null = null

    const fetchProducts = async () => {
      try {
        // Fetching products from Supabase
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
        })
        
        const productsPromise = getProducts()
        const supabaseProducts = await Promise.race([productsPromise, timeoutPromise]) as Product[]
        
        if (isMounted) {
          // Products fetched successfully
          
          if (supabaseProducts && supabaseProducts.length > 0) {
            setProducts(supabaseProducts)
            setCurrentProducts(supabaseProducts)
          } else {
            setProducts([])
            setCurrentProducts([])
          }
          
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error)
        if (isMounted) {
          setProducts([])
          setCurrentProducts([])
          setIsLoading(false)
        }
      }
    }

    // Add a fallback timeout to ensure loading state is always cleared
    fallbackTimeout = setTimeout(() => {
      console.warn('⚠️ Fallback timeout reached - clearing loading state')
      if (isMounted) {
        setIsLoading(false)
      }
    }, 15000) // 15 second fallback

    fetchProducts()

    return () => {
      isMounted = false
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout)
      }
    }
  }, [])

  // Fetch dope picks (random selection of max 6 products)
  useEffect(() => {
    let isMounted = true

    const fetchDopePicks = async () => {
      try {
        // Fetching dope picks from Supabase
        
        const dopePicksData = await getDopePicks(6)
        
        if (isMounted) {
          // Dope picks fetched successfully
          setDopePicks(dopePicksData)
        }
      } catch (error) {
        console.error('❌ Error fetching dope picks:', error)
        if (isMounted) {
          setDopePicks([])
        }
      }
    }

    fetchDopePicks()

    return () => {
      isMounted = false
    }
  }, [])

  // Fetch weekly picks (random selection of max 4 products)
  useEffect(() => {
    let isMounted = true

    const fetchWeeklyPicks = async () => {
      try {
        // Fetching weekly picks from Supabase
        
        const weeklyPicksData = await getWeeklyPicks(4)
        
        if (isMounted) {
          // Weekly picks fetched successfully
          setWeeklyPicks(weeklyPicksData)
        }
      } catch (error) {
        console.error('❌ Error fetching weekly picks:', error)
        if (isMounted) {
          setWeeklyPicks([])
        }
      }
    }

    fetchWeeklyPicks()

    return () => {
      isMounted = false
    }
  }, [])

  // Optimized header height measurement
  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === 'undefined') return
      
      const header = document.querySelector('header.dopetech-nav') as HTMLElement | null
      const h = header ? header.getBoundingClientRect().height : 56
      const extra = window.innerWidth >= 1024 ? 8 : 16
      setHeaderOffset(Math.round(h + extra))
    }

    // Delay the initial update to ensure DOM is ready
    const timer = setTimeout(updateOffset, 0)

    const onResize = () => updateOffset()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize, { passive: true })
    }

    let ro: ResizeObserver | null = null
    if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined') {
      const header = document.querySelector('header.dopetech-nav')
      if (header) {
        ro = new ResizeObserver(updateOffset)
        ro.observe(header)
      }
    }

    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize)
      }
      if (ro) ro.disconnect()
    }
  }, [isMobileMenuOpen, isSearchOpen])

  // Optimized search debouncing
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchDraft), 200)
    return () => clearTimeout(t)
  }, [searchDraft])

  // Update currentProducts when products state changes
  useEffect(() => {
    setCurrentProducts(products)
  }, [products])

  // Initialize admin mode and promo order preferences
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const flag = localStorage.getItem('adminAuthenticated') === 'true'
      setIsAdmin(!!flag)
      const stored = localStorage.getItem('promoOrderV1')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setPromoOrder(parsed.filter((id: any) => Number.isFinite(id)))
        }
      }
    } catch (e) {
      console.error('Error reading admin/promo order:', e)
    }
  }, [])

  // Optimized event listeners
  useEffect(() => {
    const handleGifChange = () => {
      setAnimationKey(prev => prev + 1)
    }

    window.addEventListener('gifUpdated', handleGifChange)
    
    return () => {
      window.removeEventListener('gifUpdated', handleGifChange)
    }
  }, [])

  // Optimized search modal handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchQuery("")
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (searchModalRef.current && !searchModalRef.current.contains(e.target as Node) && searchModalReady) {
        setIsSearchOpen(false)
        setSearchQuery("")
      }
    }

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isSearchOpen, searchModalReady])

  // Optimized modal ready state
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        setSearchModalReady(true)
      }, 100)
      return () => {
        clearTimeout(timer)
        setSearchModalReady(false)
      }
    } else {
      setSearchModalReady(false)
    }
  }, [isSearchOpen])

  // Optimized mobile menu handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileMenuOpen])

  // Optimized theme setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } catch (error) {
        console.error('Error setting theme:', error)
      }
    }
  }, [])

  // Optimized animation restart
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1)
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  // Optimized category section visibility with fallback
  useEffect(() => {
    const el = categorySectionRef.current
    if (!el || typeof window === 'undefined') return
    
    // Primary: Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection observer triggered:', entry.isIntersecting)
        setIsCategoryInView(entry.isIntersecting)
      },
      { root: null, threshold: 0.2 }
    )
    observer.observe(el)
    
    // Fallback: Scroll position check
    const handleScroll = () => {
      if (el) {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        console.log('Scroll check:', { rectTop: rect.top, windowHeight: window.innerHeight, rectBottom: rect.bottom, isVisible })
        setIsCategoryInView(isVisible)
      }
    }
    
    // Initial check with delay to ensure DOM is ready
    setTimeout(handleScroll, 100)
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setShowBackToCategories(!isCategoryInView)
  }, [isCategoryInView])

  // Show jump button when categories are not in view
  useEffect(() => {
    setShowJumpButton(showBackToCategories)
  }, [showBackToCategories])

  // Optimized poster auto-scroll
  useEffect(() => {
    if (products.length === 0) return
    
    const interval = setInterval(() => {
      const container = document.querySelector('.flex.overflow-x-auto.scrollbar-hide') as HTMLElement;
      if (container && !container.classList.contains('user-interacting')) {
        const productsToShow = products.filter((p: any) => !p.hidden_on_home).slice(0, 5);
        if (productsToShow.length === 0) return
        
        const currentIndex = posterIndex;
        const nextIndex = (currentIndex + 1) % productsToShow.length;
        
        const slideWidth = container.clientWidth;
        const newScrollLeft = nextIndex * slideWidth;
        
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        setPosterIndex(nextIndex);
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [posterIndex, products])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Clear search when switching categories
    setSearchQuery("")
    
    // Fluid scroll to products section with enhanced animation
    setTimeout(() => {
      const productsSection = document.querySelector('[data-products-section]')
      if (productsSection) {
        const header = document.querySelector('header.dopetech-nav') as HTMLElement | null
        const headerHeight = header ? header.offsetHeight + 12 : 72
        const rect = productsSection.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetPosition = scrollTop + rect.top - headerHeight
        
        // Enhanced smooth scroll with easing
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  const scrollToCategoryFilters = () => {
    setTimeout(() => {
      const header = document.querySelector('header.dopetech-nav') as HTMLElement | null
      const headerHeight = header ? header.offsetHeight + 12 : 72
      const elem = categorySectionRef.current
      if (elem) {
        const rect = elem.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetPosition = scrollTop + rect.top - headerHeight
        window.scrollTo({ top: targetPosition, behavior: 'smooth' })
      }
    }, 50)
  }

  const handleAddToCartWithTracking = (product: Product) => {
    addToCart(product, 1)
    
    // Track user behavior for AI recommendations
    setUserBehavior(prev => ({
      ...prev,
      cartItems: [...prev.cartItems, product.id]
    }))
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!")
      return
    }
    
    setCheckoutModalOpen(true)
  }

  const handleCartReset = () => {
    clearCart()
    setCheckoutModalOpen(false)
  }

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(product => {
      // Hide products explicitly flagged to be hidden on home
      if (product.hidden_on_home) return false
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // If there's a search query, prioritize search results over category filtering
      if (searchQuery.trim()) {
        return matchesSearch
      }
      
      // If no search query, filter by category
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesCategory
    })
  }, [currentProducts, searchQuery, selectedCategory])

  // Lightweight set of promo products for the top cards (hidden_on_home excluded)
  // Always fill to a max of 6 items deterministically (no Math.random for SSR safety)
  // Apply admin-defined ordering if available
  const promoProducts = useMemo(() => {
    const PROMO_CARD_MAX = 6
    const visible = currentProducts.filter((p) => !p.hidden_on_home)
    // Reorder by admin preference
    const orderSet = new Set(promoOrder)
    const orderedByAdmin = [
      ...promoOrder
        .map((id) => visible.find((p) => p.id === id))
        .filter((p): p is Product => !!p),
      ...visible.filter((p) => !orderSet.has(p.id)),
    ]
    const base = orderedByAdmin.slice(0, PROMO_CARD_MAX)
    if (base.length === PROMO_CARD_MAX) return base
    const remaining = PROMO_CARD_MAX - base.length
    const restPool = orderedByAdmin.slice(base.length)
    const extras: Product[] = []
    // Prefer unused visible items first
    for (let i = 0; i < remaining && i < restPool.length; i++) {
      extras.push(restPool[i])
    }
    // If still short, repeat from base with a deterministic offset
    if (extras.length < remaining && base.length > 0) {
      const start = currentProducts.length % base.length
      for (let i = 0; extras.length < remaining; i++) {
        const idx = (start + i) % base.length
        extras.push(base[idx])
      }
    }
    return [...base, ...extras]
  }, [currentProducts, promoOrder])

  // Desktop-only extra promo grid (up to 6 additional squares, avoid duplicates when possible)
  const promoProductsDesktopExtra = useMemo(() => {
    const EXTRA_MAX = 6
    const visible = currentProducts.filter((p) => !p.hidden_on_home)
    const orderSet = new Set(promoOrder)
    const orderedByAdmin = [
      ...promoOrder
        .map((id) => visible.find((p) => p.id === id))
        .filter((p): p is Product => !!p),
      ...visible.filter((p) => !orderSet.has(p.id)),
    ]
    // Skip the first 6 used in the main grid
    const start = 6
    const extra = orderedByAdmin.slice(start, start + EXTRA_MAX)
    return extra
  }, [currentProducts, promoOrder])

  // Debug logging removed for performance

  // Get categories from localStorage or use defaults
  // SVG Icon Component
  const SvgIcon = ({ svgContent, className }: { svgContent: string, className?: string }) => (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'currentColor'
      }}
    />
  )

  // Type for category icons
  type CategoryIcon = React.ComponentType<{ className?: string }> | { type: 'svg', content: string }

  // Helper function to render category icons
  const renderCategoryIcon = (icon: CategoryIcon, className: string) => {
    if (typeof icon === 'object' && 'type' in icon && icon.type === 'svg') {
      return <SvgIcon svgContent={icon.content} className={className} />
    }
    const IconComp = icon as React.ComponentType<{ className?: string }>
    return <IconComp className={className} />
  }

  // Promo card shape options and deterministic picker
  // Use a consistent radius across all promo cards to avoid visual unevenness
  const promoShapeOptions = [
    "rounded-2xl",
  ] as const

  // Deterministic shape picker to avoid hydration mismatches (SSR = Client)
  // Still gives variety across items by using id + index salt.
  const getPromoShape = (id: number, index: number) => {
    const seed = Number.isFinite(id) ? id + index * 7 : index
    const idx = Math.abs(seed) % promoShapeOptions.length
    return promoShapeOptions[idx]
  }

  // Mosaic layout for exactly up to 6 items (desktop-friendly, no gaps)
  // xs: all squares; sm+: hero + vertical + horizontals arranged to fill 3 columns
  const getPromoLayout = (index: number, total: number) => {
    // Always squares on xs
    const xs = "col-span-1 row-span-1"
    if (total <= 4) {
      return { wrapper: xs, ratio: "" }
    }
    if (total === 5) {
      // Layout for 5: hero(2x2), one vertical, two squares
      const map = [
        `${xs} sm:col-span-2 sm:row-span-2`, // 0 hero
        `${xs} sm:col-span-1 sm:row-span-2`, // 1 vertical
        xs,                                   // 2 square
        xs,                                   // 3 square
        xs,                                   // 4 square
      ]
      return { wrapper: map[index % 5], ratio: "" }
    }
    // total >= 6 (we cap at 6)
    // Layout for 6: hero(2x2), vertical(1x2), horizontal(2x1), square, horizontal(2x1), square
    // This produces two fully-filled rows after the top block (no gaps)
    const map6 = [
      `${xs} sm:col-span-2 sm:row-span-2`, // 0 hero
      `${xs} sm:col-span-1 sm:row-span-2`, // 1 vertical
      `${xs} sm:col-span-2 sm:row-span-1`, // 2 horizontal
      xs,                                   // 3 square
      `${xs} sm:col-span-2 sm:row-span-1`, // 4 horizontal
      xs,                                   // 5 square
    ]
    return { wrapper: map6[index % 6], ratio: "" }
  }

  // Admin drag helpers
  const handlePromoDragStart = (index: number) => {
    if (!isAdmin) return
    setDraggedPromoIndex(index)
  }

  const handlePromoDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return
    e.preventDefault()
  }

  const handlePromoDrop = (dropIndex: number) => {
    if (!isAdmin) return
    if (draggedPromoIndex === null || draggedPromoIndex === dropIndex) return
    // Combine both grids for unified ordering on desktop
    const currentIds = [...promoProducts, ...promoProductsDesktopExtra].map((p) => p.id)
    const moved = [...currentIds]
    const [m] = moved.splice(draggedPromoIndex, 1)
    if (m === undefined) return
    moved.splice(Math.min(dropIndex, moved.length), 0, m)
    // Merge moved order to the front of existing preference
    const merged = [...moved, ...promoOrder.filter((id) => !moved.includes(id))]
    setPromoOrder(merged)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('promoOrderV1', JSON.stringify(merged))
        window.dispatchEvent(new Event('promoOrderUpdated'))
      }
    } catch {}
    setDraggedPromoIndex(null)
  }

  const getCategories = () => {
    if (typeof window !== 'undefined') {
      try {
        const adminCategories = localStorage.getItem('adminCategories')
        if (adminCategories) {
          try {
            const parsed = JSON.parse(adminCategories)
            // Add icons to categories
            const result = parsed.map((cat: any) => {
              // If category has a custom icon, use it
              if (cat.icon && cat.icon !== "Grid") {
                if (cat.icon.startsWith('<svg')) {
                  // Return SVG content as a special object that will be handled by SvgIcon
                  return {
                    ...cat,
                    icon: { type: 'svg', content: cat.icon }
                  }
                } else {
                  // Map common Lucide icon names to components
                  const iconComponent = 
                    cat.icon === "Gamepad2" ? Gamepad2 :
                    cat.icon === "Laptop" ? Laptop :
                    cat.icon === "Smartphone" ? Smartphone :
                    cat.icon === "Headphones" ? Headphones :
                    cat.icon === "Speaker" ? Speaker :
                    cat.icon === "Monitor" ? Monitor :
                    cat.icon === "Cable" ? Cable :
                    cat.icon === "Keyboard" ? Keyboard :
                    cat.icon === "Mouse" ? Mouse :
                    cat.icon === "Camera" ? Camera :
                    Grid // Default fallback
                  
                  return {
                    ...cat,
                    icon: iconComponent as React.ComponentType<{ className?: string }>
                  }
                }
              }
              
              // Use default icon mapping for existing categories
              return {
                ...cat,
                icon: (cat.id === "all" ? Grid :
                      cat.id === "keyboard" ? Keyboard :
                      cat.id === "mouse" ? Mouse :
                      cat.id === "audio" ? Headphones :
                      cat.id === "speaker" ? Speaker :
                      cat.id === "monitor" ? Camera :
                      cat.id === "accessory" ? Cable : Grid) as React.ComponentType<{ className?: string }>
              }
            })
            return result
          } catch (e) {
            console.error('Error parsing admin categories:', e)
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
      }
    }
    return [
      { id: "all", name: "All Products", icon: Grid },
      { id: "keyboard", name: "Keyboards", icon: Keyboard },
      { id: "mouse", name: "Mouse", icon: Mouse },
      { id: "audio", name: "Audio", icon: Headphones },
      { id: "speaker", name: "Speakers", icon: Speaker },
      { id: "monitor", name: "Monitors", icon: Camera },
      { id: "accessory", name: "Accessories", icon: Cable },
    ]
  }

  const [categories, setCategories] = useState<{ id: string; name: string; icon: CategoryIcon }[]>([
    { id: "all", name: "All Products", icon: Grid },
    { id: "keyboard", name: "Keyboards", icon: Keyboard },
    { id: "mouse", name: "Mouse", icon: Mouse },
    { id: "audio", name: "Audio", icon: Headphones },
    { id: "speaker", name: "Speakers", icon: Speaker },
    { id: "monitor", name: "Monitors", icon: Camera },
    { id: "accessory", name: "Accessories", icon: Cable },
  ])

  // Initialize categories from localStorage or use defaults
  useEffect(() => {
    const adminCategories = getCategories()
    setCategories(adminCategories)
  }, [])

  // Optimized category icon cycling
  useEffect(() => {
    if (!showBackToCategories || categories.length === 0) return
    const id = setInterval(() => {
      setCategoryIconIndex((prev) => (prev + 1) % categories.length)
    }, 900)
    return () => clearInterval(id)
  }, [showBackToCategories, categories])

  return (
    <PageTransition>
      <div className="text-white min-h-screen transition-colors duration-100 tap-feedback scrollbar-hide gradient-bg">
        {/* SEO handled by layout.tsx metadata */}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#F7DD0F] font-semibold mb-2">Loading DopeTech...</p>
            <p className="text-gray-400 text-sm mb-4">Curating dope picks for you</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#F7DD0F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Frosted Glass Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 dopetech-nav animate-fade-in-down">
        <div className="container-max py-4">
          <nav className="flex items-center justify-between h-auto min-h-20">
            {/* Left Side - Mobile Menu Toggle (mobile only) */}
            <div className="flex items-center md:hidden pt-1">
              <ClientOnly fallback={<button className="p-2 touch-target flex items-center justify-center" aria-label="Menu"><Menu className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" /></button>}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 touch-target flex items-center justify-center"
                  aria-label="Menu"
                  data-mobile-menu
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 hover:text-[#F7DD0F] transition-colors animate-scale-in" />
                  ) : (
                    <Menu className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
                  )}
                </button>
              </ClientOnly>
            </div>

            {/* Center - Logo and Tagline */}
            <div className="flex items-center justify-center space-x-3 min-w-0 flex-1 pt-1">
              <img 
                src={logoLoading ? "/logo/simple-logo.svg" : logoUrl} 
                alt="DopeTech" 
                className="w-12 h-12 logo-adaptive flex-shrink-0 origin-left scale-[1.3]" 
              />
              
              {/* Tagline */}
              <div className="ml-3">
                <p className="text-sm text-gray-300 font-medium leading-tight">
                  Your Setup, <span className="text-[#F7DD0F]">Perfected</span>
                </p>
                <ClientOnly fallback={<p className="text-xs text-gray-400 leading-tight">Premium Tech Gear from <span className="text-[#F7DD0F]">DopeTech</span> Nepal</p>}>
                  <p className="hidden md:block text-xs text-gray-400 leading-tight">
                    Premium Tech Gear from <span className="text-[#F7DD0F]">DopeTech</span> Nepal
                  </p>
                </ClientOnly>
              </div>
            </div>

            {/* Right Side - Controls */}
            <div className="flex items-center justify-end space-x-4 flex-shrink-0 pt-1">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 touch-target flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
              </button>

              {/* Shopping Cart with Badge */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 touch-target flex items-center justify-center" 
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
                <ClientOnly fallback={null}>
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#F7DD0F] text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
                      {getCartCount()}
                    </span>
                  )}
                </ClientOnly>
              </button>

              {/* Instagram Button */}
              <a
                href="https://www.instagram.com/dopetech_np/?hl=ne"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 touch-target flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
              </a>

              {/* Desktop Menu Toggle (hidden on mobile) */}
              <div className="hidden md:block">
                <ClientOnly fallback={<button className="p-2 touch-target flex items-center justify-center" aria-label="Menu"><Menu className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" /></button>}>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 touch-target flex items-center justify-center"
                    aria-label="Menu"
                    data-mobile-menu
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6 hover:text-[#F7DD0F] transition-colors animate-scale-in" />
                    ) : (
                      <Menu className="w-6 h-6 hover:text-[#F7DD0F] transition-colors" />
                    )}
                  </button>
                </ClientOnly>
              </div>
            </div>
          </nav>



          {/* Desktop Search Modal */}
          {isSearchOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4"
            >
              <div 
                ref={searchModalRef}
                className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-4 animate-scale-in mt-16 sm:mt-20"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Search Products</h3>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery("")
                    }}
                    className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors touch-target"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search for keyboards, mice, headphones, speakers..."
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg bg-white/10 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent text-white placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 animate-slide-in-down bg-black/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-700 shadow-2xl md:hidden mobile-menu-enhanced z-50" data-mobile-menu>

              {/* Mobile Tagline */}
              <div className="text-center mb-3 pb-3 border-b border-gray-700">
                <p className="text-sm text-gray-300 font-medium">
                  Your Setup, <span className="text-[#F7DD0F]">Perfected</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Premium Tech Gear from <span className="text-[#F7DD0F]">DopeTech</span> Nepal
                </p>
              </div>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategoryClick(category.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-[#F7DD0F] text-black shadow-lg"
                        : "text-white bg-white/5 border border-white/20 hover:bg-white/10 shadow-lg"
                    }`}
                    style={{ minHeight: '48px', minWidth: '44px' }}
                  >
                    {/* Category Icon */}
                    <div className={`flex-shrink-0 ${
                      selectedCategory === category.id ? "text-black" : "text-[#F7DD0F]"
                    }`}>
                      {renderCategoryIcon(category.icon, "w-5 h-5")}
                    </div>
                    
                    {/* Category Name */}
                    <span className="font-medium text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

             {/* Welcome Section - Enhanced Spacing */}
       <section className="safe-top section-padding relative mobile-hero section-fade-in" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a0a 50%, #000000 100%)', paddingTop: headerOffset }}>
        <div className="container-max">
          {/* Page Header */}
          <div className="text-center mb-8">
            {/* Hero heading removed - now in navigation */}
            {/* Tagline removed - now in navigation */}
            
            {/* Hero Sliding Card Carousel */}
            <div className="w-full mx-auto mt-8 mb-8 animate-fade-in-up stagger-3">
              {heroLoading ? (
                <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#F7DD0F] font-semibold">Loading Carousel...</p>
                  </div>
                </div>
              ) : (
                <SlidingCardCarousel slides={heroSlides} />
              )}
            </div>

            {/* Dope Picks Section - Enhanced Typography */}
            <div className="w-full mx-auto mt-12 mb-12 animate-fade-in-up stagger-4">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 text-shadow">
                  Dope <span className="text-gradient">Picks</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium">
                  Handpicked for you
                </p>
              </div>
              
              {/* Draggable Marquee */}
              <DraggableMarquee
                products={dopePicks}
                onAddToCart={handleAddToCartWithTracking}
                className="cv-auto"
                autoScroll={true}
                scrollSpeed={25}
                pauseOnHover={true}
                showScrollHint={true}
              />
            </div>
            
            {/* Dope Categories Header */}
            <div className="text-center mb-4 sm:mb-12 animate-fade-in-up stagger-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 text-shadow">
                Dope <span className="text-gradient">Categories</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium">
                Filter by your favorite tech categories
              </p>
            </div>

            {/* Category Filter - Simplified Design */}
            <div ref={categorySectionRef} className="mb-12 px-4 animate-fade-in-up stagger-5">
              {/* Unified Category Layout */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
                {categories.map((category, index) => (
                  <div key={category.id} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-3 rounded-full transition-all duration-300 cursor-pointer text-xs sm:text-sm min-h-[32px] sm:min-h-[48px] shadow-lg ${
                        selectedCategory === category.id
                          ? "bg-[#F7DD0F] text-black font-bold"
                          : "bg-white/10 hover:bg-white/15 font-medium border border-white/10"
                      }`}
                      aria-label={`Filter by ${category.name}`}
                    >
                      {/* Category Icon */}
                      <div className={`flex-shrink-0 ${
                        selectedCategory === category.id ? "text-black" : "text-[#F7DD0F]"
                      }`}>
                        {renderCategoryIcon(category.icon, "w-3 h-3 sm:w-5 sm:h-5")}
                      </div>
                      
                      {/* Category Name */}
                      <span className="font-medium">{category.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid - Mobile Optimized 2x2 */}
          <div 
            data-products-section
            className={`grid gap-4 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12 cv-auto ${
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            }`}>
            {filteredProducts.map((product, index) => (
              <div key={product.id} data-product-id={product.id} className="group animate-fade-in-up hover-lift product-card-fluid scroll-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                <div 
                  className="relative overflow-hidden rounded-2xl card-elevated cursor-pointer"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  {/* Product Image with Enhanced Hover Effects */}
                  <div className="relative image-container overflow-hidden rounded-2xl aspect-square">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    {/* Dark Tint Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100" />
                    
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Mobile In-Stock badge at top-right */}
                    {product.in_stock && (
                      <div className="absolute top-2 right-2 sm:hidden px-2 py-1 rounded-full text-[10px] font-medium bg-green-500/20 backdrop-blur-md text-green-100 border border-green-500/30 shadow-lg">
                        In Stock
                      </div>
                    )}

                    {/* Product overlay content - Mobile Optimized */}
                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2 md:p-3 lg:p-4 pointer-events-auto">
                      <h3 className="text-white font-semibold text-sm sm:text-xs md:text-sm lg:text-base line-clamp-2 mb-1 sm:mb-1 leading-tight">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col leading-tight">
                          <span className="text-[#F7DD0F] font-bold text-sm sm:text-xs md:text-sm lg:text-base">Rs {product.price}</span>
                          {product.original_price > product.price && (
                            <span className="text-xs sm:text-[10px] md:text-xs lg:text-sm text-gray-300 line-through">Rs {product.original_price}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product)
                            }}
                            disabled={!product.in_stock}
                            aria-label="Add to cart"
                            className={`inline-flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full shadow transition-transform active:scale-95 cursor-pointer z-10 relative ${
                              product.in_stock
                                ? "bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90"
                                : "bg-gray-500/40 text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Badge */}
                    {!product.in_stock && (
                      <div className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 bg-red-500/20 backdrop-blur-md text-red-100 border border-red-500/30 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-full text-[8px] sm:text-xs md:text-sm font-medium shadow-lg">
                        Out of Stock
                      </div>
                    )}
                    
                    {/* Quick View Overlay */}
                    <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/80 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-full text-sm font-medium">
                        Quick View
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

             {/* Dope Weekly Picks Section - Enhanced Typography */}
       <section className="pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-16 sm:pb-20 md:pb-24 lg:pb-32 overflow-hidden relative section-slide-in" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a0a 50%, #000000 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16 mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-fade-in-up stagger-5">
            <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 text-shadow">
                Dope <span className="text-gradient">Weekly Picks</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium">
                This week's featured selections
              </p>
            </div>
            
            {/* Responsive Grid Layout - Enhanced Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 max-w-7xl mx-auto">
              {weeklyPicks.map((product, index) => (
                <div key={`weekly-pick-${product.id}`} className="group relative animate-fade-in-up product-card-fluid scroll-animate w-full max-w-xs mx-auto" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div 
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border-0 sm:border sm:border-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-rotate-1 cursor-pointer"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    {/* Responsive Image Container */}
                    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] mx-auto">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {/* Product Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 lg:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCartWithTracking(product)
                          }}
                          className="bg-[#F7DD0F] text-black px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-xl font-bold hover:bg-[#F7DD0F]/90 transition-all duration-300 hover:shadow-2xl w-full text-xs sm:text-sm md:text-base shadow-lg z-10 relative cursor-pointer btn-fluid"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#F7DD0F] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

             {/* GIF Section - Moved from hero area */}
       <section className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 pb-12 sm:pb-16 md:pb-20 lg:pb-24 overflow-hidden relative section-fade-in" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a0a 50%, #000000 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-fade-in-up">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 text-shadow">
              Dope <span className="text-gradient">Recommendations</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
              Grab these and more on our Instagram
            </p>
          </div>

          {/* Featured Product Image Container */}
          <div className="w-full mx-auto animate-fade-in-up borderless-glow cv-auto rounded-2xl overflow-hidden ring-1 ring-white/10">
            <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 shadow-xl relative overflow-hidden">
              {dopePicks.length > 0 ? (
                // Show featured product image
                <div 
                  className="relative w-full h-full group cursor-pointer"
                  onClick={() => {
                    if (dopePicks[0]) {
                      router.push(`/product/${dopePicks[0].id}`)
                    }
                  }}
                >
                  <img
                    src={getPrimaryImageUrl(dopePicks[0])}
                    alt={dopePicks[0].name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.svg';
                    }}
                  />
                  {/* Overlay with product info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                    <div className="p-4 sm:p-6 w-full">
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                        {dopePicks[0].name}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-[#F7DD0F] font-semibold drop-shadow-lg">
                        Rs {dopePicks[0].price}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 drop-shadow-lg">
                        Featured Pick
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-[#F7DD0F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl px-4 py-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium">View Product</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback placeholder
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto mb-4 bg-gradient-to-br from-[#F7DD0F] to-[#F7DD0F]/80 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                      Dope Picks
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-gray-300">
                      Check out our latest recommendations
                    </p>
                  </div>
                  
                  {/* Optional: Add a subtle animated background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#F7DD0F]/20 via-transparent to-[#F7DD0F]/20 animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
                            src={getPrimaryImageUrl(item)}
                            alt={item.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.svg';
                            }}
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
                    onClick={handleCheckout}
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

      {/* Footer - Enhanced Spacing */}
      <footer className="bg-black py-6 sm:py-8 md:py-10 lg:py-12 border-t-2 border-[#F7DD0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 mb-6 sm:mb-8 md:mb-0">
              <img 
                src={logoLoading ? "/logo/simple-logo.svg" : logoUrl} 
                alt="DopeTech" 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 logo-adaptive" 
              />
              <span className="text-xs sm:text-sm md:text-base text-white jakarta-light font-medium">© 2025 DopeTech Nepal. All rights reserved.</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <a href="/terms" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-[#F7DD0F] transition-colors cursor-hover jakarta-light font-medium">
                Terms & Conditions
              </a>
              <a href="/support" className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-[#F7DD0F] transition-colors cursor-hover jakarta-light font-medium">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>



      {/* Jump to Categories floating button - Circular like AI chat */}
      {!cartOpen && !checkoutModalOpen && !isCategoryInView && categories.length > 0 && (
        <button
          onClick={scrollToCategoryFilters}
          className="fixed bottom-6 right-4 md:bottom-8 md:right-6 z-[9999] frosted-glass-yellow frosted-glass-yellow-hover text-black p-4 rounded-full touch-manipulation flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg"
          style={{ minHeight: '56px', minWidth: '56px', maxWidth: '56px', maxHeight: '56px' }}
          aria-label="Jump to categories"
          title={`Debug: showBackToCategories=${showBackToCategories}, showJumpButton=${showJumpButton}, isCategoryInView=${isCategoryInView}`}
        >
          {(() => {
            const item = categories[categoryIconIndex]
            if (!item) return null
            const key = `${item.id}-${categoryIconIndex}`
            const commonClasses = "w-5 h-5 block text-[#F7DD0F] animate-fade-in animate-scale-in will-change-opacity will-change-transform"
            if (typeof item.icon === 'object' && 'type' in item.icon && (item.icon as any).type === 'svg') {
              return (
                <span key={key} className="inline-flex items-center justify-center">
                  <SvgIcon svgContent={(item.icon as { type: 'svg', content: string }).content} className={commonClasses} />
                </span>
              )
            }
            const IconComp = item.icon as React.ComponentType<{ className?: string }>
            return (
              <span key={key} className="inline-flex items-center justify-center">
                <IconComp className={commonClasses} />
              </span>
            )
          })()}
        </button>
      )}

      {/* AI Chat Assistant (lazy) - hidden during checkout or cart open */}
      {!checkoutModalOpen && !cartOpen && (
        <LazyAIChat products={products} onAddToCart={addToCart} />
      )}

      {/* Checkout Modal */}
      <SupabaseCheckout
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        total={getCartTotal()}
        onCartReset={handleCartReset}
      />
    </div>
  </PageTransition>
  )
}
