import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function GET() {
  try {
    console.log('🧪 Testing email service...')
    
    // Test the email service
    const result = await emailService.testEmailService()
    
    console.log('🧪 Email service test result:', result)
    
    return NextResponse.json({
      success: true,
      emailTestResult: result,
      message: 'Email service test completed'
    })
    
  } catch (error) {
    console.error('❌ Email service test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Email service test failed'
    }, { status: 500 })
  }
}
