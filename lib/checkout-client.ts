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
  receiverInfo?: {
    fullName: string
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
    selectedColor?: string
    selectedFeatures?: string[]
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
      console.log('📋 Submitting order via Vercel API:', {
        orderId: orderData.orderId,
        customerName: orderData.customerInfo.fullName,
        total: orderData.total,
        hasReceipt: !!orderData.receiptFile
      })
      
      console.log('📦 Cart items with options:', orderData.cart.map(item => ({
        name: item.name,
        selectedColor: item.selectedColor,
        selectedFeatures: item.selectedFeatures
      })))
      
      console.log('📦 Full cart data being sent:', JSON.stringify(orderData.cart, null, 2))

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
      
      console.log('✅ Order submitted successfully via Vercel API:', result)
      
      // Send email notification via Netlify function
      try {
        console.log('📧 Sending email notification...')
        const emailResponse = await fetch('/.netlify/functions/send-order-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                  body: JSON.stringify({
          orderId: orderData.orderId,
          orderDbId: result.orderDbId,
          customerInfo: orderData.customerInfo,
          receiverInfo: orderData.receiverInfo,
          cart: orderData.cart,
          total: orderData.total,
          paymentOption: orderData.paymentOption,
          receiptUrl: result.receiptUrl
        }),
        })

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json()
          console.log('✅ Email notification sent successfully:', emailResult)
        } else {
          console.warn('⚠️ Email notification failed:', emailResponse.status)
        }
      } catch (emailError) {
        console.warn('⚠️ Email notification error:', emailError)
      }
      
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
