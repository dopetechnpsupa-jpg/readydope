import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

interface OrderEmailData {
  orderId: string
  orderDbId: number
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
  receiptUrl?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderEmailData = await request.json()
    
    console.log('📧 Sending order emails for order:', body.orderId)

    const emailResults = await emailService.sendOrderEmails(
      {
        orderId: body.orderId,
        customerInfo: body.customerInfo,
        cart: body.cart,
        total: body.total,
        paymentOption: body.paymentOption,
        receiptUrl: body.receiptUrl
      },
      body.orderDbId,
      process.env.ADMIN_EMAIL
    )

    return NextResponse.json({
      success: true,
      results: emailResults,
      message: 'Order emails sent successfully'
    })

  } catch (error) {
    console.error('❌ Error sending order emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
