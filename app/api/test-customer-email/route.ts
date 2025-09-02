import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    // Sample order data for testing
    const sampleOrderData = {
      orderId: 'DOPE-TEST-123',
      customerInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+977123456789',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        fullAddress: '123 Main Street, Kathmandu, Nepal'
      },
      receiverInfo: {
        fullName: 'Jane Smith',
        phone: '+977987654321',
        city: 'Pokhara',
        state: 'Gandaki',
        zipCode: '33700',
        fullAddress: '456 Lake Road, Pokhara, Nepal'
      },
      cart: [
        {
          id: 1,
          name: 'DopeTech Gaming Keyboard',
          price: 5000,
          quantity: 1,
          image_url: 'keyboard.jpg',
          selectedColor: 'RGB',
          selectedFeatures: ['Mechanical', 'Wireless']
        }
      ],
      total: 5000,
      paymentOption: 'deposit' as const
    }

    // Generate customer copy email HTML
    const customerEmailHTML = emailService.generateCustomerCopyEmail(sampleOrderData, 123)
    
    return new NextResponse(customerEmailHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
    
  } catch (error) {
    console.error('❌ Error generating test customer email:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate test customer email'
    }, { status: 500 })
  }
}
