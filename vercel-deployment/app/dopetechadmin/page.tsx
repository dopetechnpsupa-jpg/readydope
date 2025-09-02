"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Eye,
  DollarSign,
  Package,
  LogOut,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Lock,
  ArrowLeft,
  Video,
  FileImage,
  RefreshCw,
  Loader2,
  Smartphone,
  Monitor,
  Settings,
  Users,
  ShoppingCart,
  Activity,
  Grid3X3,
  List,
  MoreHorizontal,
  EyeOff,
  Tag,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  QrCode
} from "lucide-react"
import { getProducts, type Product } from "@/lib/products-data"
import { supabase } from "@/lib/supabase"
import { useAssets } from '@/hooks/use-assets'
import { AssetUploader } from '@/components/asset-uploader'
import { HeroImageManager } from '@/components/hero-image-manager'
import { OrdersManager } from '@/components/orders-manager'
import { ErrorBoundary } from '@/components/error-boundary'
import { QRCodeManager } from '@/components/qr-code-manager'

interface AdminProduct extends Product {
  isNew?: boolean
  isEditing?: boolean
}

// Modern Product Card Component
const ProductCard = React.memo(({ 
  product, 
  onEdit, 
  onDelete, 
  isEditing 
}: { 
  product: AdminProduct
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  isEditing: boolean
}) => (
  <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
    {/* Product Image */}
    <div className="relative aspect-square overflow-hidden">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      
      {/* Overlay with actions - Always visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(product)
              }}
              disabled={isEditing}
              className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-lg transition-all duration-200 text-gray-800 disabled:opacity-50 hover:scale-105 flex items-center space-x-2 cursor-pointer font-semibold shadow-lg"
            >
              <Edit className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-medium">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(product.id)
              }}
              disabled={isEditing}
              className="p-3 sm:p-4 bg-red-500/80 backdrop-blur-sm hover:bg-red-500/90 rounded-lg transition-all duration-200 text-white disabled:opacity-50 hover:scale-105 flex items-center space-x-2 cursor-pointer font-semibold shadow-lg"
            >
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-medium">Delete</span>
            </button>
          </div>
        </div>
        </div>
        
      {/* Status badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        {product.in_stock ? (
          <span className="px-2 py-1 bg-green-500/20 backdrop-blur-sm text-green-300 text-xs font-medium rounded-full border border-green-500/30">
            In Stock
          </span>
        ) : (
          <span className="px-2 py-1 bg-red-500/20 backdrop-blur-sm text-red-300 text-xs font-medium rounded-full border border-red-500/30">
            Out of Stock
          </span>
        )}
        
        {product.discount > 0 && (
          <span className="px-2 py-1 bg-orange-500/20 backdrop-blur-sm text-orange-300 text-xs font-medium rounded-full border border-orange-500/30">
            {product.discount}% OFF
          </span>
        )}
          </div>
    </div>

    {/* Product Info */}
    <div className="p-4">
      <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">
        {product.name}
      </h3>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-300">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <span className="text-xs text-gray-400 capitalize bg-white/5 px-2 py-1 rounded-full">
          {product.category}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white">Rs {product.price.toLocaleString()}</span>
          {product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">
              Rs {product.original_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
))

ProductCard.displayName = 'ProductCard'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="flex items-center space-x-3">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span className="text-gray-400">Loading...</span>
    </div>
  </div>
)

// Modern Login Component
const LoginScreen = ({ password, setPassword, handleLogin }: {
  password: string
  setPassword: (value: string) => void
  handleLogin: () => void
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">DopeTech Admin</h1>
          <p className="text-sm sm:text-base text-gray-300">Secure access to your dashboard</p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2 sm:mb-3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-sm sm:text-base"
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
            Sign In
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default function DopeTechAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Asset management state
  const { 
    logoUrl, 
    videoUrl, 
    assets, 
    loading: assetsLoading, 
    error: assetsError, 
    deleteAsset, 
    refreshAssets 
  } = useAssets()

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    original_price: 0,
    description: "",
    category: "keyboard",
    image_url: "",
    rating: 0,
    reviews: 0,
    features: [""],
    in_stock: true,
    discount: 0
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Check for existing admin session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const isAdmin = localStorage.getItem("adminAuthenticated") === "true"
        const loginTime = localStorage.getItem("adminLoginTime")
        
        if (isAdmin && loginTime) {
          const loginDate = new Date(loginTime)
          const now = new Date()
          const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceLogin < 8) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("adminAuthenticated")
            localStorage.removeItem("adminLoginTime")
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking admin session:", error)
        setIsAuthenticated(false)
      }
    }
  }, [])

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const supabaseProducts = await getProducts()
        setProducts(supabaseProducts as AdminProduct[])
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadProducts()
    }
  }, [isAuthenticated])

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setIsUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      setNewProduct(prev => ({ ...prev, image_url: publicUrl }))
      setImageFile(null)
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price')
      return
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()

      if (error) {
        console.error('Error adding product:', error)
        alert('Failed to add product')
        return
      }

      const updatedProducts = await getProducts()
      setProducts(updatedProducts as AdminProduct[])

      setNewProduct({
        name: "",
        price: 0,
        original_price: 0,
        description: "",
        category: "keyboard",
        image_url: "",
        rating: 0,
        reviews: 0,
        features: [""],
        in_stock: true,
        discount: 0
      })
      setIsAddingProduct(false)
      
      alert('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
  }

  const handleSaveProduct = async (productId: number, updatedData: Partial<Product>) => {
    try {
      // Validate required fields
      if (!updatedData.name || !updatedData.name.trim()) {
        alert('Product name is required')
        return
      }

      if (!updatedData.price || updatedData.price <= 0) {
        alert('Product price must be greater than 0')
        return
      }

      const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', productId)

      if (error) {
        console.error('Error updating product:', error)
        alert(`Failed to update product: ${error.message}`)
        return
      }

      const updatedProducts = await getProducts()
      setProducts(updatedProducts as AdminProduct[])
      setEditingProduct(null)
      alert('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product. Please try again.')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        // First, check if product has related order items
        const { data: orderItems, error: checkError } = await supabase
          .from('order_items')
          .select('id')
          .eq('product_id', productId)

        if (checkError) {
          console.error('Error checking order items:', checkError)
        }

        if (orderItems && orderItems.length > 0) {
          alert(`Cannot delete product: It has ${orderItems.length} related order(s). Please remove the orders first.`)
          return
        }

        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)

        if (error) {
          console.error('Error deleting product:', error)
          if (error.code === '23503') {
            alert('Cannot delete product: It has related records in other tables. Please remove related data first.')
          } else {
            alert(`Failed to delete product: ${error.message}`)
          }
          return
        }

        const updatedProducts = await getProducts()
        setProducts(updatedProducts as AdminProduct[])
        alert('Product deleted successfully!')
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  const handleLogin = () => {
    if (password === "dopetech2024") {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuthenticated", "true")
      localStorage.setItem("adminLoginTime", new Date().toISOString())
    } else {
      alert("Incorrect password!")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminLoginTime")
  }

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))]
    return ["all", ...uniqueCategories]
  }, [products])

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.in_stock).length,
    outOfStock: products.filter(p => !p.in_stock).length,
    onDiscount: products.filter(p => p.discount > 0).length
  }), [products])

  if (!isAuthenticated) {
    return <LoginScreen password={password} setPassword={setPassword} handleLogin={handleLogin} />
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Modern Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">DopeTech Admin</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Dashboard</p>
            </div>
          </div>
          
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Stats */}
              <div className="flex items-center space-x-2 sm:hidden">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-300">{stats.total}</span>
              </div>
              
              {/* Desktop Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{stats.total} Products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">{stats.inStock} In Stock</span>
                </div>
            </div>
            
            <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 text-red-300 hover:text-red-200"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total Products</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{stats.total}</p>
                </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              </div>
            </div>
            
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">In Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">{stats.inStock}</p>
            </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
          </div>
        </div>
      </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Out of Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-red-400">{stats.outOfStock}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">On Discount</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-400">{stats.onDiscount}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Tag className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-2 mb-6 sm:mb-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "products"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab("carousel")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "carousel"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Carousel</span>
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "assets"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileImage className="w-4 h-4" />
              <span>Assets</span>
            </button>
            <button
              onClick={() => setActiveTab("qr-codes")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "qr-codes"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Codes</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {assetsError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{assetsError}</p>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col space-y-4">
                {/* Top Row - Add Button and Product Count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsAddingProduct(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2 text-sm sm:text-base"
                  >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add Product</span>
                  </button>
                  
                    <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/10 rounded-lg">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span className="text-xs sm:text-sm text-gray-300">{filteredProducts.length} Products</span>
                  </div>
                </div>
                
                  {/* View Mode Toggle - Mobile Only */}
                  <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1 sm:hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "grid" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "list" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Bottom Row - Search, Filter, and View Mode */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-slate-800">
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle - Desktop Only */}
                  <div className="hidden sm:flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "grid" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === "list" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                  </div>
                  </div>
                  
            {/* Products Grid/List */}
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-3 sm:space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    isEditing={!!editingProduct}
                  />
                ))}
                          </div>
                        )}

            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No products found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      )}
          </>
        )}

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Add New Product</h2>
                </div>
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    >
                      <option value="keyboard">Keyboard</option>
                      <option value="mouse">Mouse</option>
                      <option value="headphone">Headphone</option>
                      <option value="monitor">Monitor</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Price (Rs)</label>
                    <input
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        setNewProduct({...newProduct, price: isNaN(value) ? 0 : value})
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Original Price (Rs)</label>
                    <input
                      type="number"
                      value={newProduct.original_price || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        setNewProduct({...newProduct, original_price: isNaN(value) ? 0 : value})
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter product description"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-200 mb-2">Product Image</label>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setImageFile(file)
                              handleImageUpload(file)
                            }
                          }}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                        {isUploadingImage && (
                          <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                      
                      {newProduct.image_url && (
                        <div className="flex items-center space-x-3">
                          <img 
                            src={newProduct.image_url} 
                            alt="Product preview" 
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-white/20"
                          />
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm text-gray-400">Image uploaded successfully</p>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                  
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-white/10">
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                  >
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Product</h2>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    >
                      <option value="keyboard">Keyboard</option>
                      <option value="mouse">Mouse</option>
                      <option value="headphone">Headphone</option>
                      <option value="monitor">Monitor</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Price (Rs)</label>
                    <input
                      type="number"
                      value={editingProduct.price || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        setEditingProduct({...editingProduct, price: isNaN(value) ? 0 : value})
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Original Price (Rs)</label>
                    <input
                      type="number"
                      value={editingProduct.original_price || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        setEditingProduct({...editingProduct, original_price: isNaN(value) ? 0 : value})
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="0"
                    />
                  </div>
                  </div>
                  
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter product description"
                    />
                  </div>
                  
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.in_stock}
                        onChange={(e) => setEditingProduct({...editingProduct, in_stock: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    <span className="text-sm text-gray-200">In Stock</span>
                    </label>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-200">Discount (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingProduct.discount || 0}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        setEditingProduct({...editingProduct, discount: isNaN(value) ? 0 : value})
                      }}
                      className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  </div>
                </div>
                
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-white/10">
                  <button
                    onClick={handleCancelEdit}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                <button
                  onClick={() => handleSaveProduct(editingProduct.id, editingProduct)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
                  </div>
                )}

        {/* Assets Tab */}
        {activeTab === "assets" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Upload New Assets</h3>
              </div>
              <AssetUploader />
            </div>

            {assets.length > 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-white">Uploaded Assets</h3>
                <div className="space-y-3">
                  {assets.map((asset, index) => (
                    <div
                      key={asset.id || `${asset.name}-${asset.type}-${index}`}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {asset.type === 'logo' ? (
                          <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                          </div>
                        ) : asset.type === 'video' ? (
                          <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                            <Video className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          </div>
                        ) : (
                          <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{asset.name}</p>
                          <p className="text-xs text-gray-300 capitalize">{asset.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAsset(asset.name)}
                        className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 text-red-400 hover:scale-105 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Carousel Editor Tab */}
        {activeTab === "carousel" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Carousel Editor</h3>
              </div>
              <HeroImageManager />
            </div>
          </div>
        )}

        {/* QR Codes Tab */}
        {activeTab === "qr-codes" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">QR Code Management</h3>
              </div>
              <QRCodeManager />
            </div>
          </div>
        )}

        {/* Orders & Receipts Tab */}
        {activeTab === "orders" && (
          <ErrorBoundary>
            <OrdersManager />
          </ErrorBoundary>
        )}
      </main>
    </div>
  )
}
