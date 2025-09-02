import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'

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
    image: string
    selectedColor?: string
    selectedFeatures?: string[]
  }>
  total: number
  paymentOption: 'full' | 'deposit'
  receiptFile?: string // base64 encoded file
  receiptFileName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutData = await request.json()
    
    console.log('📋 Received Supabase checkout data:', {
      orderId: body.orderId,
      customerName: body.customerInfo.fullName,
      total: body.total,
      hasReceipt: !!body.receiptFile,
      paymentOption: body.paymentOption
    })

    // Validate required fields
    if (!body.orderId || !body.customerInfo.fullName || !body.customerInfo.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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
          
          // Test if the URL is accessible
          try {
            const testResponse = await fetch(receiptUrl, { method: 'HEAD' })
            if (testResponse.ok) {
              console.log('✅ Receipt URL is accessible')
            } else {
              console.warn('⚠️ Receipt URL might not be accessible:', testResponse.status)
            }
          } catch (testError) {
            console.warn('⚠️ Could not test receipt URL accessibility:', testError)
          }
        }
      } catch (error) {
        console.error('❌ Error processing receipt:', error)
      }
    }

    // Create order in Supabase
    console.log('📊 Creating order in Supabase database...')
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        order_id: body.orderId,
        customer_name: body.customerInfo.fullName,
        customer_email: body.customerInfo.email,
        customer_phone: body.customerInfo.phone,
        customer_city: body.customerInfo.city,
        customer_state: body.customerInfo.state,
        customer_zip_code: body.customerInfo.zipCode,
        customer_address: body.customerInfo.fullAddress,
        receiver_name: body.receiverInfo?.fullName || null,
        receiver_phone: body.receiverInfo?.phone || null,
        receiver_city: body.receiverInfo?.city || null,
        receiver_state: body.receiverInfo?.state || null,
        receiver_zip_code: body.receiverInfo?.zipCode || null,
        receiver_address: body.receiverInfo?.fullAddress || null,
        total_amount: body.total,
        payment_option: body.paymentOption,
        payment_status: 'pending',
        order_status: 'processing',
        receipt_url: receiptUrl,
        receipt_file_name: body.receiptFileName
      }])
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    console.log('✅ Order created successfully:', order.id)

    // Add order items
    console.log('📦 Adding order items...')
    const orderItems = body.cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      selected_color: item.selectedColor || null,
      selected_features: item.selectedFeatures || null
    }))
    
    console.log('📦 Order items to be saved:', orderItems.map(item => ({
      product_id: item.product_id,
      selected_color: item.selected_color,
      selected_features: item.selected_features
    })))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('❌ Error adding order items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to add order items' },
        { status: 500 }
      )
    }

    console.log('✅ Order items added successfully')

    // Send notification email (you can integrate with your preferred email service)
    try {
      await sendNotificationEmail(body, order.id, receiptUrl)
      console.log('✅ Notification email sent')
    } catch (error) {
      console.error('❌ Error sending notification email:', error)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: body.orderId,
      orderDbId: order.id,
      receiptUrl,
      message: 'Order submitted successfully to Supabase database'
    })

  } catch (error) {
    console.error('❌ Supabase checkout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to send notification emails using Resend
async function sendNotificationEmail(orderData: CheckoutData, orderDbId: number, receiptUrl: string | null) {
  try {
    console.log('📧 Sending notification emails for order:', orderDbId)
    
    // Send admin notification email only (customer emails disabled)
    const emailResults = await emailService.sendOrderEmails(
      {
        orderId: orderData.orderId,
        customerInfo: orderData.customerInfo,
        receiverInfo: orderData.receiverInfo,
        cart: orderData.cart,
        total: orderData.total,
        paymentOption: orderData.paymentOption,
        receiptUrl
      },
      orderDbId,
      'dopetechnp@gmail.com' // Send to specific admin email
    )

    // Log results
    if (emailResults.customerEmail.success) {
      console.log('⏭️ Customer confirmation email skipped (disabled)')
    } else {
      console.warn('⚠️ Customer confirmation email failed:', emailResults.customerEmail.error)
    }

    if (emailResults.adminEmail.success) {
      console.log('✅ Admin notification email sent successfully')
    } else {
      console.warn('⚠️ Admin notification email failed:', emailResults.adminEmail.error)
    }

    return emailResults
  } catch (error) {
    console.error('❌ Error sending notification emails:', error)
    return {
      customerEmail: { success: false, message: 'Email service error', error: error instanceof Error ? error.message : 'Unknown error' },
      adminEmail: { success: false, message: 'Email service error', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
