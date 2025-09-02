"use client"

import React, { useState, useEffect } from "react"
import { 
  ShoppingCart, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Package,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  X,
  CreditCard,
  Truck,
  CheckCircle2
} from "lucide-react"
import { getOrders, type Order, type OrderItem } from "@/lib/orders-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Load orders from data function
  const loadOrders = async () => {
    try {
      setLoading(true)
      console.log('🔄 OrdersManager: Starting to load orders...')
      
      // Fetch orders with order items using the data function
      const ordersWithItems = await getOrders()

      console.log('🔄 OrdersManager: getOrders() completed')
      console.log('✅ All orders loaded successfully:', ordersWithItems.length)
      console.log('📊 Sample order data:', ordersWithItems[0])
      console.log('📦 Sample order items:', ordersWithItems[0]?.order_items)
      
      // Ensure all orders have valid payment_option values
      const validatedOrders = ordersWithItems.map(order => ({
        ...order,
        payment_option: order.payment_option || 'full',
        payment_status: order.payment_status || 'pending'
      }))
      
      setOrders(validatedOrders)
    } catch (error) {
      console.error('❌ Error loading orders:', error)
      // Show error to user
      alert('Failed to load orders. Please check the console for details.')
      setOrders([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🚀 OrdersManager component mounted, loading orders...')
    // Add a longer delay to ensure API is ready
    const timer = setTimeout(() => {
      loadOrders()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatPaymentStatus = (paymentStatus: string, paymentOption: string) => {
    try {
      if (!paymentStatus || !paymentOption) {
        return paymentStatus || 'Unknown'
      }
      
      if (paymentStatus === 'paid') {
        return paymentOption === 'full' ? 'Paid in Full' : '10% Deposit Paid'
      }
      return paymentStatus
    } catch (error) {
      console.error('Error formatting payment status:', error)
      return paymentStatus || 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setOrderDetailsOpen(true)
  }

  const handleDownloadReceipt = (receiptUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = receiptUrl
    link.download = fileName || 'receipt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true)
      console.log(`🔄 Updating order ${orderId} status to: ${newStatus}`)
      
      // Use client-side service instead of API route
      const { ordersClient } = await import('@/lib/orders-client')
      const updatedOrder = await ordersClient.updateOrderStatus(orderId, newStatus)
      
      console.log('✅ Order status updated successfully')
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_status: newStatus }
            : order
        )
      )
      
      // Update the selected order if it's the same one
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : null)
      }
      
      // Show success message
      alert(`Order status updated to: ${newStatus}`)
    } catch (error) {
      console.error('❌ Error updating order status:', error)
      alert(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Stats calculation
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length,
    paid: orders.filter(o => o.payment_status === 'paid').length
  }

  console.log('🔄 OrdersManager render - loading:', loading, 'orders count:', orders.length)
  
  if (loading) {
    return (
      <div className="w-full space-y-4 sm:space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                  Orders Management
                </CardTitle>
                <p className="text-xs sm:text-sm lg:text-base text-gray-300 mt-1 leading-relaxed">
                  View and manage all customer orders
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-gray-400 text-sm sm:text-base">Loading orders...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Debug: Log the current state
  console.log('📊 OrdersManager state:', {
    ordersCount: orders.length,
    filteredCount: filteredOrders.length,
    searchTerm,
    statusFilter,
    loading
  })

  return (
    <div className="orders-container">
      {/* Debug indicator - removed since issue is fixed */}
      
      {/* Header Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl orders-card">
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center justify-between overflow-fix">
            <div className="flex items-center gap-2 sm:gap-3 flex-fix">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                  Orders Management
                </CardTitle>
                <p className="text-xs sm:text-sm lg:text-base text-gray-300 mt-1 leading-relaxed">
                  View and manage all customer orders
                </p>
              </div>
            </div>
            <Button
              onClick={loadOrders}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 h-10 px-3 sm:px-4 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Total</p>
                <p className="text-lg sm:text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Processing</p>
                <p className="text-lg sm:text-xl font-bold text-blue-400">{stats.processing}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Completed</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Pending</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Cancelled</p>
                <p className="text-lg sm:text-xl font-bold text-red-400">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Paid</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">{stats.paid}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-white">
                Search & Filter
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Find orders by ID, customer name, email, or phone
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by ID, name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm h-12"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="processing" className="bg-slate-800">Processing</option>
                <option value="completed" className="bg-slate-800">Completed</option>
                <option value="pending" className="bg-slate-800">Pending</option>
                <option value="cancelled" className="bg-slate-800">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-center p-4 bg-white/5 rounded-xl border border-white/20">
            <Package className="w-5 h-5 text-blue-400 mr-3" />
            <span className="text-sm text-gray-300 font-semibold">
              {filteredOrders.length} Orders Found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl orders-card">
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-fix">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="flex-fix">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-white">
                Orders List
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Click on any order to view details
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No orders found</p>
              <p className="text-xs sm:text-sm mt-1">Try adjusting your search or status filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleViewOrder(order)}
                >
                  <CardContent className="p-0">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="p-3">
                        {/* Header Row */}
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-semibold text-white break-all leading-tight mb-1">
                              {order.order_id}
                            </h3>
                            <p className="text-xs text-gray-400 mb-1">{order.customer_name}</p>
                            
                            {/* Status badges */}
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                {order.order_status}
                              </span>
                                                             <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                 {formatPaymentStatus(order.payment_status || '', order.payment_option || '')}
                               </span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-300 break-all">{order.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-300 break-all">{order.customer_phone}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                            </div>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{order.order_items?.length || 0} items</span>
                          </div>
                                                     <div className="flex items-center gap-1.5">
                             <span className="text-xs font-semibold text-blue-400">Rs {order.total_amount}</span>
                             <select
                               value={order.order_status}
                               onChange={(e) => {
                                 e.stopPropagation()
                                 handleStatusUpdate(order.id, e.target.value)
                               }}
                               disabled={updatingStatus}
                               className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs disabled:opacity-50"
                               onClick={(e) => e.stopPropagation()}
                             >
                               <option value="processing" className="bg-slate-800">Processing</option>
                               <option value="pending" className="bg-slate-800">Pending</option>
                               <option value="completed" className="bg-slate-800">Completed</option>
                               <option value="cancelled" className="bg-slate-800">Cancelled</option>
                             </select>
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation()
                                 handleViewOrder(order)
                               }}
                               variant="outline"
                               size="sm"
                               className="h-6 px-1.5 border-white/20 text-white hover:bg-white/10"
                             >
                               <Eye className="w-3 h-3" />
                             </Button>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          {/* Left Section */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Icon */}
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-5 h-5 text-blue-400" />
                            </div>

                            {/* Order Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-base font-semibold text-white truncate">
                                  {order.order_id}
                                </h3>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-400">{order.customer_name}</span>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-300 truncate max-w-[200px]">{order.customer_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-300">{order.customer_phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Section */}
                          <div className="flex items-center gap-6 flex-shrink-0">
                            {/* Status */}
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                                {order.order_status}
                              </span>
                                                             <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                 {formatPaymentStatus(order.payment_status || '', order.payment_option || '')}
                               </span>
                            </div>

                            {/* Items Count */}
                            <div className="text-center">
                              <div className="text-sm text-gray-400">Items</div>
                              <div className="text-lg font-semibold text-white">{order.order_items?.length || 0}</div>
                            </div>

                            {/* Price */}
                            <div className="text-center">
                              <div className="text-sm text-gray-400">Total</div>
                              <div className="text-lg font-bold text-blue-400">Rs {order.total_amount}</div>
                            </div>

                                                         {/* Status Update Dropdown */}
                             <select
                               value={order.order_status}
                               onChange={(e) => {
                                 e.stopPropagation()
                                 handleStatusUpdate(order.id, e.target.value)
                               }}
                               disabled={updatingStatus}
                               className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50"
                               onClick={(e) => e.stopPropagation()}
                             >
                               <option value="processing" className="bg-slate-800">Processing</option>
                               <option value="pending" className="bg-slate-800">Pending</option>
                               <option value="completed" className="bg-slate-800">Completed</option>
                               <option value="cancelled" className="bg-slate-800">Cancelled</option>
                             </select>
                             
                             {/* View Button */}
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation()
                                 handleViewOrder(order)
                               }}
                               variant="outline"
                               size="sm"
                               className="h-10 px-4 border-white/20 text-white hover:bg-white/10 group-hover:border-white/40"
                             >
                               <Eye className="w-4 h-4 mr-2" />
                               <span>View</span>
                             </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {orderDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-2xl sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white order-id-text leading-tight">Order Details</h2>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 order-id-text">Order ID: {selectedOrder.order_id}</p>
                </div>
              </div>
              <Button
                onClick={() => setOrderDetailsOpen(false)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 h-10 px-3 sm:px-4 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Order Header */}
              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:gap-6">
                <Card className="bg-white/5 border border-white/20">
                  <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4">
                    <CardTitle className="text-sm sm:text-base font-semibold text-white">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-400">Order ID:</span>
                      <span className="text-xs sm:text-sm text-white font-mono order-id-text">{selectedOrder.order_id}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-400">Date:</span>
                      <span className="text-xs sm:text-sm text-white">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-400">Total Amount:</span>
                      <span className="text-sm sm:text-base text-blue-400 font-bold">Rs {selectedOrder.total_amount}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-400">Payment Option:</span>
                      <span className="text-xs sm:text-sm text-white capitalize">{selectedOrder.payment_option}</span>
                    </div>
                  </CardContent>
                </Card>

                                 <Card className="bg-white/5 border border-white/20">
                   <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4">
                     <CardTitle className="text-sm sm:text-base font-semibold text-white">Status</CardTitle>
                   </CardHeader>
                   <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                       <span className="text-xs sm:text-sm text-gray-400">Order Status:</span>
                       <div className="flex items-center gap-2">
                         <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(selectedOrder.order_status)}`}>
                           {selectedOrder.order_status}
                         </span>
                         <select
                           value={selectedOrder.order_status}
                           onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                           disabled={updatingStatus}
                           className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm disabled:opacity-50"
                         >
                           <option value="processing" className="bg-slate-800">Processing</option>
                           <option value="pending" className="bg-slate-800">Pending</option>
                           <option value="completed" className="bg-slate-800">Completed</option>
                           <option value="cancelled" className="bg-slate-800">Cancelled</option>
                         </select>
                         {updatingStatus && (
                           <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-400" />
                         )}
                       </div>
                     </div>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                       <span className="text-xs sm:text-sm text-gray-400">Payment Status:</span>
                                               <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                          {formatPaymentStatus(selectedOrder.payment_status || '', selectedOrder.payment_option || '')}
                        </span>
                     </div>
                   </CardContent>
                 </Card>
              </div>

              {/* Customer Information */}
              <Card className="bg-white/5 border border-white/20">
                <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base font-semibold text-white">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white modal-text-safe">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white email-text">{selectedOrder.customer_email}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-white phone-text">{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="text-sm sm:text-base text-white min-w-0 flex-1">
                      <p className="address-text">{selectedOrder.customer_address}</p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1 address-text">
                        {selectedOrder.customer_city}, {selectedOrder.customer_state} {selectedOrder.customer_zip_code}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="bg-white/5 border border-white/20">
                <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4">
                  <CardTitle className="text-sm sm:text-base font-semibold text-white">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3">
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      selectedOrder.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <img
                            src={item.product_image || '/placeholder-product.svg'}
                            alt={item.product_name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-product.svg'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base text-white font-medium modal-text-safe leading-tight">{item.product_name}</h4>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm sm:text-base text-blue-400 font-semibold whitespace-nowrap">Rs {item.price}</p>
                            <p className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">Total: Rs {item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                        <p className="text-sm sm:text-base text-gray-400">No order items found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Receipt Section */}
              {(selectedOrder.receipt_url || selectedOrder.receipt_file_name) && (
                <Card className="bg-white/5 border border-white/20">
                  <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4">
                    <CardTitle className="text-sm sm:text-base font-semibold text-white">Payment Receipt</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="bg-white/5 rounded-lg border border-white/10 p-3 sm:p-4">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-white font-medium modal-text-safe leading-tight">
                            {selectedOrder.receipt_file_name || 'Receipt'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">Payment proof uploaded by customer</p>
                          {selectedOrder.receipt_url && (
                            <p className="text-xs text-gray-500 mt-1 order-id-text">URL: {selectedOrder.receipt_url}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedOrder.receipt_url ? (
                            <>
                              <Button
                                onClick={() => window.open(selectedOrder.receipt_url!, '_blank')}
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 h-8 sm:h-10 px-2 sm:px-3"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDownloadReceipt(selectedOrder.receipt_url!, selectedOrder.receipt_file_name || 'receipt')}
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 h-8 sm:h-10 px-2 sm:px-3"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="text-xs text-gray-400 px-2 py-1 bg-gray-700/50 rounded whitespace-nowrap">
                              File uploaded but URL not available
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Receipt Image Display */}
                      <div className="flex justify-center">
                        {selectedOrder.receipt_url ? (
                          <img
                            src={selectedOrder.receipt_url}
                            alt="Payment Receipt"
                            className="max-w-full max-h-64 sm:max-h-96 rounded-lg border border-white/20"
                            onLoad={() => console.log('✅ Receipt image loaded successfully:', selectedOrder.receipt_url)}
                            onError={(e) => {
                              console.error('❌ Receipt image failed to load:', selectedOrder.receipt_url)
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              // Show fallback message
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-center py-6 sm:py-8">
                                    <FileText class="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                    <p class="text-sm sm:text-base text-gray-400">Receipt uploaded but not accessible</p>
                                    <p class="text-xs sm:text-sm text-gray-500 mt-2 order-id-text">File: ${selectedOrder.receipt_file_name}</p>
                                    <p class="text-xs sm:text-sm text-gray-500 mt-2">The receipt file was uploaded but the URL is not available</p>
                                  </div>
                                `
                              }
                            }}
                          />
                        ) : (
                          <div className="text-center py-6 sm:py-8">
                            <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                            <p className="text-sm sm:text-base text-gray-400">Receipt uploaded but not accessible</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2 order-id-text">File: {selectedOrder.receipt_file_name}</p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2">The receipt file was uploaded but the URL is not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-4 sm:pt-6 border-t border-white/10">
                <Button
                  onClick={() => setOrderDetailsOpen(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
