import { supabase } from './supabase'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product_name?: string
  product_image?: string
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
  payment_option: 'full' | 'deposit'
  payment_status: string
  order_status: string
  receipt_url?: string
  receipt_file_name?: string
  created_at: string
  updated_at?: string
  order_items?: OrderItem[]
}

export const ordersClient = {
  // Get all orders with items
  async getOrders(): Promise<Order[]> {
    try {
      console.log('🔄 Loading orders with items...')
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError)
        throw new Error(`Failed to fetch orders: ${ordersError.message}`)
      }

      console.log(`✅ Loaded ${ordersData?.length || 0} orders`)

      if (!ordersData || ordersData.length === 0) {
        return []
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          console.log(`📦 Loading items for order: ${order.order_id}`)
          
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products (
                name,
                image_url
              )
            `)
            .eq('order_id', order.id)

          if (itemsError) {
            console.error('❌ Error fetching order items:', itemsError)
            return {
              ...order,
              order_items: []
            }
          }

          console.log(`✅ Loaded ${itemsData?.length || 0} items for order ${order.order_id}`)

          // Map product data to order items
          const orderItems = (itemsData || []).map((item: any) => ({
            ...item,
            product_name: item.products?.name || 'Unknown Product',
            product_image: item.products?.image_url || ''
          }))

          return {
            ...order,
            order_items: orderItems
          }
        })
      )

      console.log('✅ All orders loaded successfully:', ordersWithItems.length)
      return ordersWithItems

    } catch (error) {
      console.error('❌ Error loading orders:', error)
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, orderStatus: string): Promise<Order> {
    try {
      console.log(`🔄 Updating order ${orderId} status to: ${orderStatus}`)
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          order_status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating order status:', error)
        throw new Error(`Failed to update order status: ${error.message}`)
      }
      
      if (!data) {
        throw new Error('Order not found')
      }
      
      console.log('✅ Order status updated successfully')
      return data
      
    } catch (error) {
      console.error('❌ Error updating order status:', error)
      throw error
    }
  }
}
