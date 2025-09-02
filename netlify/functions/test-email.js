const { Resend } = require('resend')

exports.handler = async (event, context) => {
  console.log('🚀 Test email function invoked')
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    // Check environment variables
    console.log('🔧 Environment check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
      adminEmail: process.env.ADMIN_EMAIL || 'Not set'
    })

    if (!process.env.RESEND_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'RESEND_API_KEY not found in environment variables',
          message: 'Please check your Netlify environment configuration'
        })
      }
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    console.log('✅ Resend client initialized')

    // Send test email
    const adminEmail = process.env.ADMIN_EMAIL || 'dopetechnp@gmail.com'
    console.log('📧 Sending test email to:', adminEmail)

    const { data, error } = await resend.emails.send({
      from: 'DopeTech GMK <onboarding@resend.dev>',
      to: [adminEmail],
      subject: '🧪 Test Email - DopeTech GMK Email Service',
      html: `
        <h1>Test Email from DopeTech GMK</h1>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'Not set'}</p>
        <p><strong>Resend API Key:</strong> ${process.env.RESEND_API_KEY ? 'Present' : 'Missing'}</p>
        <p><strong>Admin Email:</strong> ${adminEmail}</p>
        <hr>
        <p>If you received this email, the email notification system is working correctly!</p>
      `
    })

    if (error) {
      console.error('❌ Error sending test email:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to send test email',
          details: error.message,
          resendError: error
        })
      }
    }

    console.log('✅ Test email sent successfully:', data?.id)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Test email sent successfully',
        emailId: data?.id,
        sentTo: adminEmail,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Exception in test email function:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Exception occurred',
        details: error.message,
        stack: error.stack
      })
    }
  }
}
