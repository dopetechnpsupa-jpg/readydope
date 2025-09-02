"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Eye,
  Star,
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
  RefreshCw,
  Video,
  Settings,
  Grid3X3,
  FileImage,
  Menu,
  Users,
  ShoppingCart,
  CreditCard,
  Activity,
  Calendar,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  AlertCircle,
  Info,
  QrCode
} from 'lucide-react'
import { getProducts, type Product } from "@/lib/products-data"
import { useAssets } from '@/hooks/use-assets'
import { useHeroImages } from '@/hooks/use-hero-images'
import { AssetUploader } from '@/components/asset-uploader'
import { HeroImageManager } from '@/components/hero-image-manager'
import { QRCodeManager } from '@/components/qr-code-manager'
import { supabase } from "@/lib/supabase"

interface AdminProduct extends Product {
  isNew?: boolean
  isEditing?: boolean
}

export function EnhancedAdminPanel() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Product management state
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

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

  // Hero images state
  const { 
    heroImages, 
    loading: heroImagesLoading, 
    error: heroImagesError, 
    uploadHeroImage, 
    deleteHeroImage, 
    refreshHeroImages 
  } = useHeroImages()

  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: []
  })

  useEffect(() => {
    // Load products on component mount
    loadProducts()
    loadStats()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const productsData = await getProducts()
      setProducts(productsData.map(p => ({ ...p, isNew: false, isEditing: false })))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    // Mock stats for now - replace with real data
    setStats({
      totalProducts: products.length,
      totalSales: 125000,
      totalOrders: 45,
      totalCustomers: 23,
      recentOrders: [],
      topProducts: []
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - replace with proper authentication
    if (password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "products", name: "Products", icon: Package },
    { id: "assets", name: "Assets", icon: FileImage },
    { id: "hero", name: "Hero Images", icon: ImageIcon },
    { id: "carousel", name: "Carousel Editor", icon: Grid3X3 },
    { id: "qr-codes", name: "QR Codes", icon: QrCode },
    { id: "settings", name: "Settings", icon: Settings },
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card-admin p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-admin"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Demo password: admin123
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(isMobileMenuOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:block"
            >
              <div className="flex flex-col h-full">
                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-secondary shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </motion.button>
                  ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">admin@dopetech.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadStats}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-500" },
                      { title: "Total Sales", value: `$${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: "bg-green-500" },
                      { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-purple-500" },
                      { title: "Total Customers", value: stats.totalCustomers, icon: Users, color: "bg-orange-500" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card-admin p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-full ${stat.color}`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-admin p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">New product added</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card-admin p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("products")}
                          className="w-full btn-primary"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Product
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("carousel")}
                          className="w-full btn-primary"
                        >
                          <Grid3X3 className="w-4 h-4 mr-2" />
                          Carousel Editor
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab("assets")}
                          className="w-full btn-secondary"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Assets
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "products" && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddingProduct(true)}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </motion.button>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-admin pl-10"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-admin"
                    >
                      <option value="all">All Categories</option>
                      <option value="keyboard">Keyboards</option>
                      <option value="mouse">Mice</option>
                      <option value="headphone">Headphones</option>
                      <option value="speaker">Speakers</option>
                      <option value="camera">Cameras</option>
                      <option value="cable">Cables</option>
                    </select>
                  </div>

                  {/* Products Grid */}
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="card-admin p-6">
                          <div className="loading-skeleton h-32 mb-4"></div>
                          <div className="loading-skeleton h-4 mb-2"></div>
                          <div className="loading-skeleton h-4 w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="card-admin p-6"
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg price-proxima-nova text-primary">Rs {product.price}</span>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "assets" && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Management</h2>
                  <AssetUploader />
                </motion.div>
              )}

              {activeTab === "hero" && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Image Management</h2>
                  <HeroImageManager />
                </motion.div>
              )}

              {activeTab === "carousel" && (
                <motion.div
                  key="carousel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Carousel Editor</h2>
                  <div className="card-admin p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hero Carousel Management</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Manage the hero carousel images and their content visibility. Upload images and control whether titles, subtitles, and descriptions are displayed.
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <HeroImageManager />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "qr-codes" && (
                <motion.div
                  key="qr-codes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Management</h2>
                  <QRCodeManager />
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <div className="card-admin p-6">
                    <p className="text-gray-600 dark:text-gray-400">Settings panel coming soon...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
