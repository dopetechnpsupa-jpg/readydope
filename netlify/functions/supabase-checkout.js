const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

// Initialize Supabase client with better error handling
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback to hardcoded values if environment variables are not available
if (!supabaseUrl) {
  supabaseUrl = "https://aizgswoelfdkhyosgvzu.supabase.co"
  console.log('⚠️ Using fallback Supabase URL')
}

if (!supabaseServiceKey) {
  supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc"
  console.log('⚠️ Using fallback Supabase service key')
}

console.log('🔧 Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  nodeEnv: process.env.NODE_ENV,
  hasResendKey: !!process.env.RESEND_API_KEY,
  hasAdminEmail: !!process.env.ADMIN_EMAIL,
  resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
  adminEmail: process.env.ADMIN_EMAIL || 'Not set'
})

// Create Supabase client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Initialize Resend for email notifications
let resend = null
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY)
    console.log('✅ Resend email service initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing Resend:', error)
    resend = null
  }
} else {
  console.log('⚠️ RESEND_API_KEY not found - email notifications will be disabled')
}

// Email service functions
const emailService = {
  async sendAdminNotification(orderData, orderDbId) {
    console.log('📧 Starting admin notification email process...')
    
    if (!resend) {
      console.log('⚠️ Resend not configured - skipping admin email')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'dopetechnp@gmail.com'
      console.log('📧 Sending admin notification to:', adminEmail)
      console.log('📧 Order ID:', orderData.orderId)
      console.log('📧 Database ID:', orderDbId)

      const emailHtml = this.generateAdminEmailHTML(orderData, orderDbId)
      console.log('📧 Email HTML generated successfully')

      console.log('📧 Attempting to send email via Resend...')
      const { data, error } = await resend.emails.send({
        from: 'DopeTech GMK <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `🚨 New Order Alert: ${orderData.orderId} | DopeTech GMK`,
        html: emailHtml,
        replyTo: 'dopetechnp@gmail.com'
      })

      if (error) {
        console.error('❌ Error sending admin email:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        return { success: false, error: error.message }
      }

      console.log('✅ Admin notification email sent successfully')
      console.log('📧 Email ID:', data?.id)
      console.log('📧 Sent to:', adminEmail)
      return { success: true, emailId: data?.id }
    } catch (error) {
      console.error('❌ Exception sending admin email:', error)
      console.error('❌ Exception stack:', error.stack)
      return { success: false, error: error.message }
    }
  },

  generateAdminEmailHTML(orderData, orderDbId) {
    const depositAmount = orderData.paymentOption === 'deposit' ? Math.max(1, Math.round(orderData.total * 0.10)) : 0
    const orderDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Alert - DopeTech GMK</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 700px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #dc2626;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #dc2626;
              margin-bottom: 10px;
            }
            .alert-badge {
              background-color: #dc2626;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 15px;
            }
            .order-id {
              background-color: #fef2f2;
              border: 2px solid #dc2626;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .order-id h2 {
              margin: 0;
              color: #991b1b;
              font-size: 20px;
            }
            .customer-info {
              background-color: #f0f9ff;
              border: 1px solid #0ea5e9;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .customer-info h4 {
              margin: 0 0 15px 0;
              color: #0c4a6e;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              margin: 8px 0;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
            }
            .info-value {
              color: #6b7280;
            }
            .item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin: 10px 0;
              background-color: #f9fafb;
            }
            .item-name {
              font-weight: 600;
              color: #1f2937;
            }
            .item-details {
              color: #6b7280;
              font-size: 14px;
              margin-top: 5px;
            }
            .item-price {
              font-weight: bold;
              color: #059669;
              font-size: 16px;
            }
            .total-section {
              background-color: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .total-amount {
              font-size: 28px;
              font-weight: bold;
              color: #d97706;
              margin: 10px 0;
            }
            .urgent-note {
              background-color: #fef2f2;
              border: 2px solid #ef4444;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .urgent-note h4 {
              margin: 0 0 10px 0;
              color: #991b1b;
            }
            .action-buttons {
              text-align: center;
              margin: 30px 0;
            }
            .action-button {
              display: inline-block;
              padding: 12px 24px;
              margin: 0 10px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              font-size: 14px;
            }
            .primary-button {
              background-color: #2563eb;
              color: white;
            }
            .secondary-button {
              background-color: #6b7280;
              color: white;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #f0f0f0;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎮 DopeTech GMK</div>
              <div class="alert-badge">🚨 NEW ORDER ALERT</div>
              <p style="margin: 0; color: #6b7280; font-size: 16px;">Admin Notification</p>
            </div>

            <div class="order-id">
              <h2>🆕 New Order Received!</h2>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #991b1b;">
                Order ID: <strong>${orderData.orderId}</strong>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                Database ID: ${orderDbId} | Placed on: ${orderDate}
              </p>
            </div>

            <div class="urgent-note">
              <h4>⚠️ Action Required</h4>
              <p style="margin: 0; color: #991b1b;">
                A new order has been placed. Please review the details and take appropriate action within 24 hours.
              </p>
            </div>

            <div class="customer-info">
              <h4>👤 Customer Information</h4>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${orderData.customerInfo.fullName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${orderData.customerInfo.email}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone:</div>
                  <div class="info-value">${orderData.customerInfo.phone}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">City:</div>
                  <div class="info-value">${orderData.customerInfo.city}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">State:</div>
                  <div class="info-value">${orderData.customerInfo.state}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">ZIP Code:</div>
                  <div class="info-value">${orderData.customerInfo.zipCode}</div>
                </div>
              </div>
              <div style="margin-top: 15px;">
                <div class="info-label">Full Address:</div>
                <div class="info-value">${orderData.customerInfo.fullAddress}</div>
              </div>
            </div>

            <div>
              <h3>📦 Order Items</h3>
              ${orderData.cart.map(item => `
                <div class="item">
                  <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">Quantity: ${item.quantity} × Rs ${item.price.toLocaleString()}</div>
                  </div>
                  <div class="item-price">
                    Rs ${(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="total-section">
              <h3 style="margin: 0 0 15px 0; color: #92400e;">💰 Order Summary</h3>
              <div class="total-amount">Rs ${orderData.total.toLocaleString()}</div>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                Total Order Value
              </p>
              ${orderData.paymentOption === 'deposit' ? `
                <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                  Deposit Required: Rs ${depositAmount.toLocaleString()}
                </p>
                <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
                  Remaining Balance: Rs ${(orderData.total - depositAmount).toLocaleString()}
                </p>
              ` : ''}
            </div>

            ${orderData.receiptUrl ? `
              <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <h4 style="margin: 0 0 10px 0; color: #991b1b;">📄 Payment Receipt</h4>
                <p style="margin: 0 0 15px 0; color: #991b1b;">
                  Customer has uploaded a payment receipt.
                </p>
                <a href="${orderData.receiptUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px;" target="_blank" rel="noopener noreferrer">
                  View Receipt
                </a>
              </div>
            ` : ''}

            <div class="action-buttons">
              <a href="mailto:${orderData.customerInfo.email}?subject=Order ${orderData.orderId} - DopeTech GMK" class="action-button primary-button">
                📧 Email Customer
              </a>
              <a href="tel:${orderData.customerInfo.phone}" class="action-button secondary-button">
                📞 Call Customer
              </a>
            </div>

            <div class="footer">
              <p>This is an automated notification from DopeTech GMK</p>
              <p>Order received at: ${new Date().toLocaleString()}</p>
              <p style="margin-top: 20px; font-size: 12px;">
                © 2024 DopeTech GMK. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

exports.handler = async (event, context) => {
  console.log('🚀 Function invoked with method:', event.httpMethod)
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Handling preflight request')
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod)
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    console.log('📥 Parsing request body...')
    const body = JSON.parse(event.body)
    
    console.log('📋 Received Supabase checkout data:', {
      orderId: body.orderId,
      customerName: body.customerInfo?.fullName,
      total: body.total,
      hasReceipt: !!body.receiptFile,
      paymentOption: body.paymentOption
    })

    // Validate required fields
    if (!body.orderId || !body.customerInfo?.fullName || !body.customerInfo?.email) {
      console.error('❌ Missing required fields')
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    let receiptUrl = null

    // Upload receipt to Supabase Storage if provided
    if (body.receiptFile && body.receiptFileName) {
      try {
        console.log('📤 Uploading receipt to Supabase Storage...')
        
        const fileExt = body.receiptFileName.split('.').pop()?.toLowerCase()
        const fileName = `${body.orderId}_receipt.${fileExt}`
        
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(body.receiptFile.split(',')[1], 'base64')
        
        // Determine content type based on file extension
        let contentType = 'image/jpeg' // default
        if (fileExt === 'png') contentType = 'image/png'
        else if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg'
        else if (fileExt === 'pdf') contentType = 'application/pdf'
        else if (fileExt === 'webp') contentType = 'image/webp'
        
        console.log(`📤 Uploading file: ${fileName} with content type: ${contentType}`)
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('receipts')
          .upload(fileName, fileBuffer, {
            contentType: contentType,
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error('❌ Error uploading receipt:', uploadError)
        } else {
          console.log('✅ File uploaded successfully:', fileName)
          
          // Generate public URL
          const { data: urlData } = supabaseAdmin.storage
            .from('receipts')
            .getPublicUrl(fileName)
          
          receiptUrl = urlData.publicUrl
          console.log('✅ Receipt URL generated:', receiptUrl)
        }
      } catch (uploadError) {
        console.error('❌ Error in receipt upload process:', uploadError)
      }
    }

    // Create order in database
    console.log('📝 Creating order in database...')
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: body.orderId,
        customer_name: body.customerInfo.fullName,
        customer_email: body.customerInfo.email,
        customer_phone: body.customerInfo.phone,
        customer_city: body.customerInfo.city,
        customer_state: body.customerInfo.state,
        customer_zip_code: body.customerInfo.zipCode,
        customer_address: body.customerInfo.fullAddress,
        total_amount: body.total,
        payment_option: body.paymentOption,
        payment_status: 'pending',
        order_status: 'processing',
        receipt_url: receiptUrl,
        receipt_file_name: body.receiptFileName || null
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create order: ' + orderError.message })
      }
    }

    console.log('✅ Order created successfully:', order.id)

    // Add order items
    console.log('📦 Adding order items...')
    const orderItems = body.cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Error adding order items:', itemsError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to add order items: ' + itemsError.message })
      }
    }

    console.log('✅ Order items added successfully')

    // Send admin notification email
    try {
      console.log('📧 Sending admin notification email...')
      const emailResult = await emailService.sendAdminNotification(body, order.id)
      
      if (emailResult.success) {
        console.log('✅ Admin notification email sent successfully')
        console.log('📧 Email ID:', emailResult.emailId)
      } else {
        console.error('❌ Failed to send admin notification email:', emailResult.error)
        // Don't fail the order if email fails
      }
    } catch (emailError) {
      console.error('❌ Error sending admin notification email:', emailError)
      console.error('❌ Email error stack:', emailError.stack)
      // Don't fail the order if email fails
    }

    console.log('🎉 Order processing completed successfully')
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId: body.orderId,
        orderDbId: order.id,
        receiptUrl,
        message: 'Order submitted successfully to Supabase database'
      })
    }

  } catch (error) {
    console.error('❌ Supabase checkout API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    }
  }
}
