import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product_name?: string
}

export interface Order {
  id: number
  order_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_city: string
  customer_state: string
  customer_zip_code: string
  customer_address: string
  total_amount: number
  payment_option: string
  payment_status: string
  order_status: string
  receipt_url: string | null
  receipt_file_name: string | null
  created_at: string
  order_items?: OrderItem[]
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            order_id,
            product_id,
            quantity,
            price
          )
        `)
        .order('created_at', { ascending: false })

      if (ordersError) {
        throw ordersError
      }

      // Fetch product names for order items
      const ordersWithProductNames = await Promise.all(
        (ordersData || []).map(async (order) => {
          if (order.order_items && order.order_items.length > 0) {
            const productIds = order.order_items.map(item => item.product_id)
            
            const { data: productsData } = await supabase
              .from('products')
              .select('id, name')
              .in('id', productIds)

            const productsMap = new Map(
              (productsData || []).map(product => [product.id, product.name])
            )

            const orderItemsWithNames = order.order_items.map(item => ({
              ...item,
              product_name: productsMap.get(item.product_id) || 'Unknown Product'
            }))

            return {
              ...order,
              order_items: orderItemsWithNames
            }
          }
          return order
        })
      )

      setOrders(ordersWithProductNames)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId)

      if (error) {
        throw error
      }

      // Refresh orders after update
      await fetchOrders()
      return true
    } catch (err) {
      console.error('Error updating order status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order status')
      return false
    }
  }

  const updatePaymentStatus = async (orderId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', orderId)

      if (error) {
        throw error
      }

      // Refresh orders after update
      await fetchOrders()
      return true
    } catch (err) {
      console.error('Error updating payment status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update payment status')
      return false
    }
  }

  const deleteOrder = async (orderId: number) => {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (itemsError) {
        throw itemsError
      }

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (orderError) {
        throw orderError
      }

      // Refresh orders after deletion
      await fetchOrders()
      return true
    } catch (err) {
      console.error('Error deleting order:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete order')
      return false
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
  }
}
