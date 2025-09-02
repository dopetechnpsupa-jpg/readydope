"use client"

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Tag,
  ShoppingCart,
  ImageIcon,
  Upload,
  Video,
  QrCode,
  RefreshCw,
  FolderOpen,
  Star
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { Product, ProductImage, getProducts, addProduct, updateProduct, deleteProduct, getProductImages, addProductImage, deleteProductImage, setPrimaryImage, reorderProductImages, toggleDopePick } from '@/lib/products-data'
import { ProductImageManager } from '@/components/product-image-manager'
import { AssetUploader } from '@/components/asset-uploader'
import { HeroImageManager } from '@/components/hero-image-manager'
import { QRCodeManager } from '@/components/qr-code-manager'
import { OrdersManager } from '@/components/orders-manager'
import { ErrorBoundary } from '@/components/error-boundary'
import { CategoryManagerDB } from '@/components/category-manager-db'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface LoginScreenProps {
  password: string
  setPassword: (password: string) => void
  handleLogin: () => void
}

function LoginScreen({ password, setPassword, handleLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F7DD0F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#F7DD0F]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">DopeTech Admin</h1>
          <p className="text-gray-400">Enter your password to continue</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('products')
  
  // Product form states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [newProductImages, setNewProductImages] = useState<ProductImage[]>([])
  
  // Dynamic categories from localStorage
  const [categories, setCategories] = useState<string[]>([])
  
  // Load categories from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('adminCategories')
        if (stored) {
          const parsed = JSON.parse(stored)
          const categoryIds = parsed.map((cat: { id: string; name: string }) => cat.id).filter((id: string) => id !== 'all')
          setCategories(categoryIds)
        } else {
          // Set default categories if none exist
          setCategories(['keyboard', 'mouse', 'audio', 'monitor', 'speaker', 'camera', 'cable', 'laptop', 'smartphone', 'gamepad', 'headphones', 'microphone', 'webcam', 'accessories'])
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories(['keyboard', 'mouse', 'audio', 'monitor', 'speaker', 'camera', 'cable', 'laptop', 'smartphone', 'gamepad', 'headphones', 'microphone', 'webcam', 'accessories'])
      }
    }
  }, [])

  // Listen for category updates
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('adminCategories')
          if (stored) {
            const parsed = JSON.parse(stored)
            const categoryIds = parsed.map((cat: { id: string; name: string }) => cat.id).filter((id: string) => id !== 'all')
            setCategories(categoryIds)
          }
        } catch (error) {
          console.error('Error updating categories:', error)
        }
      }
    }

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate)
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdate)
  }, [])

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    original_price: '',
    price: '',
    category: '',
    color: '',
    features: '',
    in_stock: true,
    discount: 0,
    image_url: '',
    is_dope_pick: false
  })

  const ADMIN_PASSWORD = 'dopetech2024'

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
      fetchAssets()
    }
  }, [isAuthenticated])

  // Real-time subscription to product changes in admin panel
  useEffect(() => {
    if (!isAuthenticated) return

    const subscription = supabaseAdmin
      .channel('admin-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          // Refresh products when any change occurs
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    try {
      setRefreshing(true)
      const productsData = await getProducts()
      setProducts(productsData)
      toast({
        title: "Refreshed!",
        description: `Loaded ${productsData.length} products`,
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "Failed to refresh products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchAssets = async () => {
    try {
      console.log('📁 Fetching assets via API...')
      
      const response = await fetch('/api/assets')
      
      if (!response.ok) {
        console.error('❌ Error fetching assets via API:', response.status)
        return
      }
      
      const data = await response.json()
      
      const assetsList = data?.map((file: any) => ({
        name: file.name,
        type: file.name.includes('logo') ? 'logo' : file.name.includes('video') ? 'video' : 'image',
        id: file.id
      })) || []
      
      console.log(`✅ Fetched ${assetsList.length} assets via API`)
      setAssets(assetsList)
    } catch (error) {
      console.error('❌ Error fetching assets:', error)
    }
  }

  const handleAddProduct = async () => {
    try {
      // Get the primary image URL for the main product record
      const primaryImage = newProductImages.find(img => img.is_primary)
      const imageUrl = primaryImage ? primaryImage.image_url : ''

      // Convert features string to array and filter out empty values
      const featuresArray = formData.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0)

      const newProduct = await addProduct({
        ...formData,
        original_price: parseFloat(formData.original_price || formData.price),
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount.toString()),
        features: featuresArray,
        color: formData.color.trim() || undefined, // Only include if not empty
        image_url: imageUrl, // Add the primary image URL
        is_dope_pick: formData.is_dope_pick
      })

      if (newProduct) {
        // Add images for the new product
        if (newProductImages.length > 0) {
          for (const image of newProductImages) {
            try {
              await addProductImage(newProduct.id, image.image_url, image.file_name, image.is_primary)
            } catch (imageError) {
              console.error('Error adding image:', imageError)
              // Continue with other images even if one fails
            }
          }
        }

        // Update local products array
        setProducts([...products, newProduct])
        
        // Also refresh from database to ensure consistency
        await fetchProducts()
        
        setShowAddModal(false)
        resetForm()
        setNewProductImages([])
        
        toast({
          title: "Success!",
          description: `Product added successfully${newProductImages.length > 0 ? ` with ${newProductImages.length} image${newProductImages.length > 1 ? 's' : ''}` : ''}`,
        })
      } else {
        throw new Error('Failed to create product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return

    try {
      // Get the primary image URL for the main product record
      const primaryImage = productImages.find(img => img.is_primary)
      const imageUrl = primaryImage ? primaryImage.image_url : editingProduct.image_url

      // Convert features string to array and filter out empty values
      const featuresArray = formData.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0)

      const updatedProduct = await updateProduct(editingProduct.id, {
        ...formData,
        original_price: parseFloat(formData.original_price || formData.price),
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount.toString()),
        features: featuresArray,
        color: formData.color.trim() || undefined, // Only include if not empty
        image_url: imageUrl, // Add the primary image URL
        is_dope_pick: formData.is_dope_pick
      })

      if (updatedProduct) {
        // Update the local products array
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))
        
        // Also refresh from database to ensure consistency
        await fetchProducts()
        
        setShowEditModal(false)
        setEditingProduct(null)
        resetForm()
        setProductImages([])
        
        toast({
          title: "Success!",
          description: `Product updated successfully${productImages.length > 0 ? ` with ${productImages.length} image${productImages.length > 1 ? 's' : ''}` : ''}`,
        })
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const success = await deleteProduct(productId)
      if (success) {
        // Update local products array
        setProducts(products.filter(p => p.id !== productId))
        
        // Also refresh from database to ensure consistency
        await fetchProducts()
        
        toast({
          title: "Success!",
          description: "Product deleted successfully",
        })
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = async (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      original_price: product.original_price.toString(),
      price: product.price.toString(),
      category: product.category,
      color: product.color || '',
      features: Array.isArray(product.features) ? product.features.join(', ') : '',
      in_stock: product.in_stock,
      discount: product.discount,
      image_url: product.image_url,
      is_dope_pick: product.is_dope_pick || false
    })

    // Fetch existing images for this product
    try {
      const images = await getProductImages(product.id)
      setProductImages(images)
    } catch (error) {
      console.error('Error fetching product images:', error)
      setProductImages([])
    }

    setShowEditModal(true)
  }

  const handleToggleDopePick = async (product: Product) => {
    try {
      // Check if we're trying to add a product and already have 10 dope picks
      if (!product.is_dope_pick) {
        const currentDopePicksCount = products.filter(p => p.is_dope_pick).length
        if (currentDopePicksCount >= 10) {
          toast({
            title: "Maximum Limit Reached",
            description: "You can only have up to 10 products in dope picks. Remove some existing picks first.",
            variant: "destructive",
          })
          return
        }
      }

      const updatedProduct = await toggleDopePick(product.id)
      
      if (updatedProduct) {
        // Update the local products state
        setProducts(products.map(p => 
          p.id === product.id ? { ...p, is_dope_pick: updatedProduct.is_dope_pick } : p
        ))
        
        const newCount = products.filter(p => p.is_dope_pick).length + (updatedProduct.is_dope_pick ? 1 : -1)
        
        toast({
          title: "Success",
          description: `Product ${updatedProduct.is_dope_pick ? 'added to' : 'removed from'} dope picks (${newCount}/10)`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update dope pick status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error toggling dope pick status:', error)
      toast({
        title: "Error",
        description: "Failed to update dope pick status",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    resetForm()
    setProductImages([])
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      original_price: '',
      price: '',
      category: '',
      color: '',
      features: '',
      in_stock: true,
      discount: 0,
      image_url: '',
      is_dope_pick: false
    })
  }

  const deleteAsset = async (assetName: string) => {
    try {
      console.log('🗑️ Deleting asset:', assetName)
      
      const response = await fetch(`/api/assets?fileName=${encodeURIComponent(assetName)}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('❌ Error deleting asset:', result.error)
        toast({
          title: "Error",
          description: result.error || 'Failed to delete asset',
          variant: "destructive",
        })
        return
      }
      
      // Update local state to remove the deleted asset
      setAssets(assets.filter(asset => asset.name !== assetName))
      
      console.log('✅ Asset deleted successfully')
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      })
      
    } catch (error) {
      console.error('❌ Error deleting asset:', error)
      toast({
        title: "Error",
        description: 'Failed to delete asset',
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'inStock' && product.in_stock) ||
                         (filter === 'outOfStock' && !product.in_stock) ||
                         (filter === 'onDiscount' && product.discount > 0)
    
    return matchesSearch && matchesFilter
  })

  const stats = React.useMemo(() => ({
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
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F7DD0F]/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#F7DD0F]" />
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
                  <div className="w-2 h-2 bg-[#F7DD0F] rounded-full"></div>
                  <span className="text-gray-300">{stats.inStock} In Stock</span>
                </div>
              </div>
            
              <button
                onClick={fetchProducts}
                disabled={refreshing}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
                  refreshing 
                    ? 'bg-blue-500/30 text-blue-200 cursor-not-allowed' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200'
                }`}
                title="Refresh products"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
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
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#F7DD0F]/20 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-[#F7DD0F]" />
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
                  ? "bg-[#F7DD0F] text-black shadow-lg"
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
                  ? "bg-[#F7DD0F] text-black shadow-lg"
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
                  ? "bg-[#F7DD0F] text-black shadow-lg"
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
                  ? "bg-[#F7DD0F] text-black shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Assets</span>
            </button>
            <button
              onClick={() => setActiveTab("qr-codes")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "qr-codes"
                  ? "bg-[#F7DD0F] text-black shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Codes</span>
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium whitespace-nowrap text-sm sm:text-base ${
                activeTab === "categories"
                  ? "bg-[#F7DD0F] text-black shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Categories</span>
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Search and Filter */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="text-gray-400 w-4 h-4" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]"
                  >
                    <option value="all">All Products</option>
                    <option value="inStock">In Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                    <option value="onDiscount">On Discount</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Dope Picks Counter */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">Dope Picks Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Currently Selected:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    products.filter(p => p.is_dope_pick).length >= 10 
                      ? 'bg-red-500/20 text-red-400' 
                      : products.filter(p => p.is_dope_pick).length >= 8
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {products.filter(p => p.is_dope_pick).length}/10
                  </span>
                </div>
              </div>
              {products.filter(p => p.is_dope_pick).length >= 10 && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">
                    ⚠️ Maximum limit reached! Remove some products from dope picks before adding new ones.
                  </p>
                </div>
              )}
              {products.filter(p => p.is_dope_pick).length >= 8 && products.filter(p => p.is_dope_pick).length < 10 && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Almost at limit! You have {10 - products.filter(p => p.is_dope_pick).length} spots remaining.
                  </p>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{product.category}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-green-400 price-proxima-nova">Rs {product.price}</span>
                            {product.discount > 0 && (
                              <span className="text-orange-400">-{product.discount}%</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.in_stock 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleDopePick(product)}
                            disabled={!product.is_dope_pick && products.filter(p => p.is_dope_pick).length >= 10}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              product.is_dope_pick === true
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                                : !product.is_dope_pick && products.filter(p => p.is_dope_pick).length >= 10
                                ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            }`}
                            title={
                              product.is_dope_pick === true 
                                ? 'Remove from dope picks' 
                                : !product.is_dope_pick && products.filter(p => p.is_dope_pick).length >= 10
                                ? 'Maximum limit reached (10/10)'
                                : 'Add to dope picks'
                            }
                          >
                            <Star className={`w-4 h-4 ${product.is_dope_pick === true ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors duration-200 text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">{product.description}</p>
                      
                      {/* Color and Features Display */}
                      {(product.color || (product.features && product.features.length > 0)) && (
                        <div className="space-y-1">
                          {product.color && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">Color:</span>
                              <span className="text-xs text-blue-300">{product.color}</span>
                            </div>
                          )}
                          {product.features && product.features.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <span className="text-xs text-gray-400 mt-0.5">Features:</span>
                              <div className="flex flex-wrap gap-1">
                                {product.features.slice(0, 3).map((feature, index) => (
                                  <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                                    {feature}
                                  </span>
                                ))}
                                {product.features.length > 3 && (
                                  <span className="text-xs text-gray-400">+{product.features.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Category Management</h3>
              </div>
              <CategoryManagerDB />
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">Add New Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-gray-800 text-white">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color (Optional)</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Black, White, Red (separate multiple colors with commas)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Features (Optional)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter features separated by commas (e.g., Wireless, RGB, Bluetooth)"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({...formData, in_stock: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label htmlFor="inStock" className="text-sm text-gray-300">In Stock</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDopePick"
                  checked={formData.is_dope_pick}
                  onChange={(e) => setFormData({...formData, is_dope_pick: e.target.checked})}
                  className="w-4 h-4 text-yellow-600 bg-white/10 border-white/20 rounded focus:ring-yellow-500"
                />
                <label htmlFor="isDopePick" className="text-sm text-gray-300">Add to Dope Picks</label>
              </div>

              {/* Product Images Manager */}
              <ProductImageManager
                productId={0}
                onImagesChange={setNewProductImages}
                initialImages={newProductImages}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                  setNewProductImages([])
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">Edit Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {(() => {
                    try {
                      const stored = localStorage.getItem('adminCategories')
                      if (stored) {
                        const parsed = JSON.parse(stored)
                        return parsed
                          .filter((cat: { id: string; name: string }) => cat.id !== 'all')
                          .map((cat: { id: string; name: string }) => (
                            <option key={cat.id} value={cat.id} className="bg-gray-800 text-white">
                              {cat.name}
                            </option>
                          ))
                      }
                    } catch (error) {
                      console.error('Error loading category names:', error)
                    }
                    return categories.map((category) => (
                      <option key={category} value={category} className="bg-gray-800 text-white">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))
                  })()}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color (Optional)</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Black, White, Red (separate multiple colors with commas)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Features (Optional)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter features separated by commas (e.g., Wireless, RGB, Bluetooth)"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editInStock"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({...formData, in_stock: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <label htmlFor="editInStock" className="text-sm text-gray-300">In Stock</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsDopePick"
                  checked={formData.is_dope_pick}
                  onChange={(e) => setFormData({...formData, is_dope_pick: e.target.checked})}
                  className="w-4 h-4 text-yellow-600 bg-white/10 border-white/20 rounded focus:ring-yellow-500"
                />
                <label htmlFor="editIsDopePick" className="text-sm text-gray-300">Add to Dope Picks</label>
              </div>

              {/* Product Images Manager */}
              <ProductImageManager
                productId={editingProduct.id}
                onImagesChange={setProductImages}
                initialImages={productImages}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  )
}
