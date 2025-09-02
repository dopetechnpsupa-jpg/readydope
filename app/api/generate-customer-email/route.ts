import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate customer copy email HTML
    const customerEmailHTML = emailService.generateCustomerCopyEmail(body.orderData, body.orderDbId)
    
    return NextResponse.json({
      success: true,
      customerEmailHTML,
      message: 'Customer copy email HTML generated successfully'
    })
    
  } catch (error) {
    console.error('❌ Error generating customer email:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate customer email HTML'
    }, { status: 500 })
  }
}
