import { supabase } from './supabase'

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  created_at: string
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
  payment_option: string
  payment_status: string
  order_status: string
  receipt_url: string | null
  receipt_file_name: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export async function getOrders(): Promise<Order[]> {
  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Loading orders with items via client service (attempt ${attempt}/${maxRetries})...`)
      
      // Use client-side service instead of API route
      const { ordersClient } = await import('./orders-client')
      const orders = await ordersClient.getOrders()

      console.log(`✅ Loaded ${orders.length} orders via client service (attempt ${attempt})`)
      console.log('📊 Sample order with items:', orders[0] ? {
        id: orders[0].id,
        order_id: orders[0].order_id,
        order_items_count: orders[0].order_items?.length || 0
      } : 'No orders')
      
      return orders
      
    } catch (error) {
      console.error(`❌ Error loading orders (attempt ${attempt}):`, error)
      lastError = error
      
      if (attempt === maxRetries) {
        console.error('❌ All retry attempts failed. Last error:', lastError)
        return []
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  return []
}
