import { supabase } from './supabase'

interface CheckoutData {
  orderId: string
  customerInfo: {
    fullName: string
    email: string
    phone: string
    city: string
    state: string
    zipCode: string
    fullAddress: string
  }
  cart: Array<{
    id: number
    name: string
    price: number
    quantity: number
    image_url: string
  }>
  total: number
  paymentOption: 'full' | 'deposit'
  receiptFile?: string // base64 encoded file
  receiptFileName?: string | null
}

export const checkoutClient = {
  async submitOrder(orderData: CheckoutData): Promise<{
    success: boolean
    orderId: string
    orderDbId?: number
    receiptUrl?: string
    message: string
  }> {
    try {
      console.log('📋 Submitting order via Netlify Function:', {
        orderId: orderData.orderId,
        customerName: orderData.customerInfo.fullName,
        total: orderData.total,
        hasReceipt: !!orderData.receiptFile
      })

      // Validate required fields
      if (!orderData.orderId || !orderData.customerInfo.fullName || !orderData.customerInfo.email) {
        throw new Error('Missing required fields')
      }

      // Submit order to Vercel API route
      const response = await fetch('/api/supabase-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      console.log('✅ Order submitted successfully via Netlify Function:', result)
      
      return {
        success: true,
        orderId: orderData.orderId,
        orderDbId: result.orderDbId,
        receiptUrl: result.receiptUrl,
        message: result.message || 'Order submitted successfully'
      }

    } catch (error) {
      console.error('❌ Checkout submission error:', error)
      return {
        success: false,
        orderId: orderData.orderId,
        message: error instanceof Error ? error.message : 'Internal server error'
      }
    }
  }
}
