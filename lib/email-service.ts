import { Resend } from 'resend'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

interface OrderData {
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
  receiptUrl?: string | null
}

interface EmailResult {
  success: boolean
  message: string
  error?: string
}

export class EmailService {
  private static instance: EmailService
  private resend: Resend | null

  private constructor() {
    // Ensure environment variables are loaded
    dotenv.config()
    
    // Debug environment variables for Netlify
    console.log('🔧 Email Service Initialization:')
    console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('📧 ADMIN_EMAIL exists:', !!process.env.ADMIN_EMAIL)
    console.log('🌐 NODE_ENV:', process.env.NODE_ENV)
    console.log('🌐 VERCEL_ENV:', process.env.VERCEL_ENV)
    console.log('🌐 NETLIFY_ENV:', process.env.NETLIFY_ENV)

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not found - email service will be disabled')
      console.warn('💡 Add RESEND_API_KEY to your environment variables (.env.local for local development)')
      this.resend = null as any
    } else {
      console.log('✅ Resend API key found, initializing Resend client...')
      this.resend = new Resend(apiKey)
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Generate customer confirmation email HTML
   */
  private generateCustomerEmailHTML(orderData: OrderData): string {
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
          <title>Order Confirmation - DopeTech Nepal</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #ffffff;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #000000;
            }
            .container {
              background-color: #111111;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2);
              border: 2px solid #F7DD0F;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #F7DD0F;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #F7DD0F;
              margin-bottom: 10px;
              text-shadow: 0 0 10px rgba(247, 221, 15, 0.5);
            }
            .order-id {
              background-color: #f0f9ff;
              border: 1px solid #0ea5e9;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .order-id h2 {
              margin: 0;
              color: #0c4a6e;
              font-size: 18px;
            }
            .order-details {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .order-details h3 {
              margin: 0 0 15px 0;
              color: #1e293b;
              font-size: 16px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 8px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 500;
              color: #64748b;
            }
            .detail-value {
              font-weight: 600;
              color: #1e293b;
            }
            .section {
              margin: 25px 0;
            }
            .section h3 {
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-name {
              font-weight: 500;
            }
            .item-details {
              color: #6b7280;
              font-size: 14px;
            }
            .total {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
            }
            .total h3 {
              margin: 0 0 10px 0;
              color: #92400e;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
              color: #d97706;
            }
            .payment-info {
              background-color: #f0fdf4;
              border: 1px solid #22c55e;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
            .receipt-section {
              background-color: #fef2f2;
              border: 1px solid #ef4444;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .receipt-button {
              display: inline-block;
              background-color: #dc2626;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #f0f0f0;
              color: #6b7280;
              font-size: 14px;
            }
            .contact-info {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .contact-info h4 {
              margin: 0 0 15px 0;
              color: #374151;
            }
            .contact-item {
              margin: 8px 0;
              color: #6b7280;
            }
            .next-steps {
              background-color: #eff6ff;
              border: 1px solid #3b82f6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .next-steps h4 {
              margin: 0 0 15px 0;
              color: #1e40af;
            }
            .next-steps ul {
              margin: 0;
              padding-left: 20px;
              color: #1e40af;
            }
            .next-steps li {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎮 DopeTech GMK</div>
              <p style="margin: 0; color: #6b7280;">Your Gaming Gear Destination</p>
            </div>

            <div class="order-id">
              <h2>✅ Order Confirmed!</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #0c4a6e;">
                Order ID: <strong>${orderData.orderId}</strong>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                Placed on: ${orderDate}
              </p>
            </div>

            <div class="order-details">
              <h3>📋 Order Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${orderData.orderId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${orderDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${orderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Items:</span>
                <span class="detail-value">${orderData.cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>

            <div class="section">
              <h3>👋 Hello ${orderData.customerInfo.fullName}!</h3>
              <p>Thank you for your order! We've received your purchase and are processing it now. Here are your order details:</p>
            </div>

            <div class="section">
              <h3>📦 Order Items</h3>
              ${orderData.cart.map(item => `
                <div class="item">
                  <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">Quantity: ${item.quantity} × Rs ${item.price.toLocaleString()}</div>
                    ${(item.selectedColor || (item.selectedFeatures && item.selectedFeatures.length > 0)) ? `
                      <div class="item-options" style="margin-top: 5px; font-size: 12px; color: #6b7280;">
                        ${item.selectedColor ? `<div>Color: ${item.selectedColor}</div>` : ''}
                        ${item.selectedFeatures && item.selectedFeatures.length > 0 ? `<div>Features: ${item.selectedFeatures.join(', ')}</div>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  <div style="font-weight: bold; color: #059669;">
                    Rs ${(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="total">
              <h3>💰 Total Amount</h3>
              <div class="total-amount">Rs ${orderData.total.toLocaleString()}</div>
              ${orderData.paymentOption === 'deposit' ? `
                <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                  Deposit Required: Rs ${depositAmount.toLocaleString()}
                </p>
              ` : ''}
            </div>

            <div class="payment-info">
              <h4 style="margin: 0 0 10px 0; color: #166534;">💳 Payment Information</h4>
              <p style="margin: 0; color: #166534;">
                <strong>Payment Option:</strong> ${orderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}
              </p>
              ${orderData.paymentOption === 'deposit' ? `
                <p style="margin: 10px 0 0 0; color: #166534;">
                  <strong>Deposit Amount:</strong> Rs ${depositAmount.toLocaleString()}
                </p>
                <p style="margin: 5px 0 0 0; color: #166534; font-size: 14px;">
                  <strong>Remaining Balance:</strong> Rs ${(orderData.total - depositAmount).toLocaleString()}
                </p>
              ` : ''}
            </div>

            ${orderData.receiptUrl ? `
              <div class="receipt-section">
                <h4 style="margin: 0 0 10px 0; color: #991b1b;">📄 Payment Receipt</h4>
                <p style="margin: 0 0 15px 0; color: #991b1b;">
                  Your payment receipt has been uploaded successfully.
                </p>
                <a href="${orderData.receiptUrl}" class="receipt-button" target="_blank" rel="noopener noreferrer">
                  View Receipt
                </a>
              </div>
            ` : ''}

            <div class="contact-info">
              <h4>📞 Contact Information</h4>
              <div class="contact-item">
                <strong>Name:</strong> ${orderData.customerInfo.fullName}
              </div>
              <div class="contact-item">
                <strong>Email:</strong> ${orderData.customerInfo.email}
              </div>
              <div class="contact-item">
                <strong>Phone:</strong> ${orderData.customerInfo.phone}
              </div>
              <div class="contact-item">
                <strong>Address:</strong> ${orderData.customerInfo.fullAddress}
              </div>
            </div>

            ${orderData.receiverInfo ? `
            <div class="contact-info" style="background-color: #fef3c7; border: 1px solid #f59e0b;">
              <h4 style="color: #92400e;">📦 Delivery Information</h4>
              <div class="contact-item">
                <strong style="color: #92400e;">Receiver Name:</strong> <span style="color: #92400e;">${orderData.receiverInfo.fullName}</span>
              </div>
              <div class="contact-item">
                <strong style="color: #92400e;">Receiver Phone:</strong> <span style="color: #92400e;">${orderData.receiverInfo.phone}</span>
              </div>
              <div class="contact-item">
                <strong style="color: #92400e;">Delivery Address:</strong> <span style="color: #92400e;">${orderData.receiverInfo.fullAddress}</span>
              </div>
            </div>
            ` : ''}

            <div class="next-steps">
              <h4>🚚 What's Next?</h4>
              <ul>
                <li>We'll review your order and payment within 24 hours</li>
                <li>You'll receive updates on your order status via email</li>
                <li>We'll contact you to arrange delivery or pickup</li>
                <li>Your gaming gear will be prepared and ready soon!</li>
                <li>For any questions, contact us at dopetechnp@gmail.com</li>
              </ul>
            </div>

            <div class="footer">
              <p>Thank you for choosing DopeTech Nepal!</p>
              <p>For any questions, please contact us at dopetechnp@gmail.com</p>
              <p style="margin-top: 20px; font-size: 12px;">
                © 2024 DopeTech Nepal. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate admin notification email HTML
   */
  private generateAdminEmailHTML(orderData: OrderData, orderDbId: number): string {
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
          <title>New Order Alert - DopeTech Nepal</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #000000;
              max-width: 700px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F7DD0F;
            }
            .container {
              background-color: #F7DD0F;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              border: 3px solid #000000;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #000000;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 10px;
              text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            }
            .alert-badge {
              background-color: #000000;
              color: #F7DD0F;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .order-id {
              background-color: #1a1a1a;
              border: 2px solid #F7DD0F;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .order-id h2 {
              margin: 0;
              color: #F7DD0F;
              font-size: 20px;
              text-shadow: 0 0 10px rgba(247, 221, 15, 0.3);
            }
            .order-summary {
              background-color: #000000;
              border: 1px solid #000000;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .order-summary h3 {
              margin: 0 0 15px 0;
              color: #F7DD0F;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .summary-item {
              padding: 10px;
              background-color: #F7DD0F;
              border-radius: 6px;
              border: 1px solid #000000;
            }
            .summary-label {
              font-weight: 500;
              color: #000000;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .summary-value {
              font-weight: 600;
              color: #000000;
              font-size: 16px;
              margin-top: 5px;
            }
            .section {
              margin: 25px 0;
            }
            .section h3 {
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
              font-size: 18px;
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
            .payment-details {
              background-color: #f0fdf4;
              border: 1px solid #22c55e;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .payment-details h4 {
              margin: 0 0 15px 0;
              color: #166534;
            }
            .receipt-section {
              background-color: #fef2f2;
              border: 1px solid #ef4444;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .receipt-button {
              display: inline-block;
              background-color: #dc2626;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin-top: 10px;
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
            .next-steps {
              background-color: #eff6ff;
              border: 1px solid #3b82f6;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .next-steps h4 {
              margin: 0 0 15px 0;
              color: #1e40af;
            }
            .next-steps ul {
              margin: 0;
              padding-left: 20px;
              color: #1e40af;
            }
            .next-steps li {
              margin: 8px 0;
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

            <div class="order-summary">
              <h3>📋 Quick Order Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-label">Order ID</div>
                  <div class="summary-value">${orderData.orderId}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Order Date</div>
                  <div class="summary-value">${orderDate}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Payment Method</div>
                  <div class="summary-value">${orderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Total Items</div>
                  <div class="summary-value">${orderData.cart.reduce((sum, item) => sum + item.quantity, 0)}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Total Amount</div>
                  <div class="summary-value">Rs ${orderData.total.toLocaleString()}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Customer Email</div>
                  <div class="summary-value">${orderData.customerInfo.email}</div>
                </div>
              </div>
            </div>

            <div class="urgent-note">
              <h4>⚠️ Action Required</h4>
              <p style="margin: 0; color: #991b1b;">
                A new order has been placed. Please review the details and take appropriate action within 24 hours.
              </p>
            </div>

            <div class="section">
              <h3>👤 Customer Information</h3>
              <div class="customer-info">
                <h4>Contact Details</h4>
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
            </div>

            ${orderData.receiverInfo ? `
            <div class="section">
              <h3>📦 Receiver Information</h3>
              <div class="customer-info" style="background-color: #fef3c7; border-color: #f59e0b;">
                <h4 style="color: #92400e;">Delivery Details</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label" style="color: #92400e;">Name:</div>
                    <div class="info-value" style="color: #92400e;">${orderData.receiverInfo.fullName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label" style="color: #92400e;">Phone:</div>
                    <div class="info-value" style="color: #92400e;">${orderData.receiverInfo.phone}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label" style="color: #92400e;">City:</div>
                    <div class="info-value" style="color: #92400e;">${orderData.receiverInfo.city}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label" style="color: #92400e;">State:</div>
                    <div class="info-value" style="color: #92400e;">${orderData.receiverInfo.state}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label" style="color: #92400e;">ZIP Code:</div>
                    <div class="info-value" style="color: #92400e;">${orderData.receiverInfo.zipCode}</div>
                  </div>
                </div>
                <div style="margin-top: 15px;">
                  <div class="info-label" style="color: #92400e;">Full Address:</div>
                  <div class="info-value" style="color: #92400e;">${orderData.receiverInfo.fullAddress}</div>
                </div>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h3>📦 Order Items</h3>
              ${orderData.cart.map(item => `
                <div class="item">
                  <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">Quantity: ${item.quantity} × Rs ${item.price.toLocaleString()}</div>
                    ${(item.selectedColor || (item.selectedFeatures && item.selectedFeatures.length > 0)) ? `
                      <div class="item-options" style="margin-top: 5px; font-size: 12px; color: #6b7280;">
                        ${item.selectedColor ? `<div>Color: ${item.selectedColor}</div>` : ''}
                        ${item.selectedFeatures && item.selectedFeatures.length > 0 ? `<div>Features: ${item.selectedFeatures.join(', ')}</div>` : ''}
                      </div>
                    ` : ''}
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

            <div class="payment-details">
              <h4>💳 Payment Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <div class="info-label">Payment Option:</div>
                  <div class="info-value">
                    ${orderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}
                  </div>
                </div>
                ${orderData.paymentOption === 'deposit' ? `
                  <div>
                    <div class="info-label">Deposit Amount:</div>
                    <div class="info-value" style="color: #059669; font-weight: bold;">
                      Rs ${depositAmount.toLocaleString()}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            ${orderData.receiptUrl ? `
              <div class="receipt-section">
                <h4 style="margin: 0 0 10px 0; color: #991b1b;">📄 Payment Receipt</h4>
                <p style="margin: 0 0 15px 0; color: #991b1b;">
                  Customer has uploaded a payment receipt.
                </p>
                <a href="${orderData.receiptUrl}" class="receipt-button" target="_blank" rel="noopener noreferrer">
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

            <div class="next-steps">
              <h4>📋 Next Steps</h4>
              <ul>
                <li>Review the order details and payment verification</li>
                <li>Contact customer to confirm order within 24 hours</li>
                <li>Arrange delivery or pickup based on customer preference</li>
                <li>Update order status in admin panel</li>
                <li>Process payment verification and receipt review</li>
                <li>Prepare items for delivery/pickup</li>
                <li>Send customer confirmation email using the template below</li>
              </ul>
            </div>

            <div class="section" style="background-color: #000000; border: 3px solid #F7DD0F; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #F7DD0F; text-align: center; margin-bottom: 20px;">📧 Customer Email Template</h3>
              <div style="background-color: #F7DD0F; border: 2px solid #000000; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; color: #000000; font-weight: 700; font-size: 14px;">📤 Copy the content below and forward it to the customer</p>
              </div>
              <div style="background-color: #F7DD0F; border: 2px solid #000000; border-radius: 8px; padding: 20px; margin: 15px 0; color: #000000; font-size: 13px; line-height: 1.5;">
                <strong>Subject:</strong> Order Confirmation - ${orderData.orderId} | DopeTech Nepal<br><br>
                
                Dear ${orderData.customerInfo.fullName},<br><br>
                
                Thank you for placing your order with DopeTech Nepal! We're excited to fulfill your gaming gear request.<br><br>
                
                <strong>Order Details:</strong><br>
                • Order ID: ${orderData.orderId}<br>
                • Order Date: ${orderDate}<br>
                • Total Amount: Rs ${orderData.total.toLocaleString()}<br>
                • Payment Method: ${orderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}<br><br>
                
                <strong>Order Items:</strong><br>
                ${orderData.cart.map(item => `• ${item.name} (Qty: ${item.quantity}) - Rs ${(item.price * item.quantity).toLocaleString()}`).join('<br>')}<br><br>
                
                ${orderData.receiverInfo ? `
                <strong>Delivery Information:</strong><br>
                • Receiver: ${orderData.receiverInfo.fullName}<br>
                • Phone: ${orderData.receiverInfo.phone}<br>
                • Address: ${orderData.receiverInfo.fullAddress}<br><br>
                ` : ''}
                
                <strong>Next Steps:</strong><br>
                1. We'll review your order within 24 hours<br>
                2. You'll receive updates on your order status<br>
                3. We'll contact you to arrange delivery or pickup<br>
                4. Your gaming gear will be prepared and ready soon!<br><br>
                
                If you have any questions, please contact us at dopetechnp@gmail.com<br><br>
                
                Best regards,<br>
                The DopeTech Nepal Team<br>
                🎮 Your Gaming Gear Destination
              </div>
            </div>

            <div class="footer">
              <p>This is an automated notification from DopeTech Nepal</p>
              <p>Order received at: ${new Date().toLocaleString()}</p>
              <p style="margin-top: 20px; font-size: 12px;">
                © 2024 DopeTech Nepal. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Send order confirmation email to customer using Gmail SMTP
   */
  async sendCustomerConfirmation(
    orderData: OrderData,
    orderDbId: number
  ): Promise<EmailResult> {
    try {
      console.log('📧 Starting customer confirmation email...')
      console.log('📧 Order ID:', orderData.orderId)
      console.log('📧 Customer Email:', orderData.customerInfo.email)
      console.log('📧 Customer Name:', orderData.customerInfo.fullName)
      console.log('📧 Order Total:', orderData.total)
      console.log('📧 Payment Option:', orderData.paymentOption)
      
      // Customer emails are disabled - only admin notifications are sent
      console.log('📧 Customer confirmation emails are disabled')
      return {
        success: true,
        message: 'Customer confirmation email skipped (disabled)'
      }

      // Fallback to Resend (for customer emails)
      if (this.resend) {
        console.log('📧 Sending customer email via Resend fallback...')
        console.log('📧 Customer email address:', orderData.customerInfo.email)
        
        const emailHtml = this.generateCustomerEmailHTML(orderData)
        
        const { data, error } = await this.resend.emails.send({
          from: 'DopeTech Nepal <onboarding@resend.dev>',
          to: [orderData.customerInfo.email],
          subject: `Order Confirmation - ${orderData.orderId} | DopeTech Nepal`,
          html: emailHtml,
          replyTo: 'dopetechnp@gmail.com'
        }).catch((err) => {
          console.error('❌ Resend API error:', err)
          return { data: null, error: err }
        })

        if (error) {
          console.error('❌ Error sending customer confirmation email:', error)
          console.error('📧 Customer email that failed:', orderData.customerInfo.email)
          return {
            success: false,
            message: 'Failed to send customer confirmation email',
            error: error.message
          }
        }

        console.log('✅ Customer confirmation email sent successfully via Resend')
        console.log('📧 Email ID:', data?.id)
        console.log('📧 Sent to:', orderData.customerInfo.email)
        console.log('📧 Order ID in subject:', orderData.orderId)
        return {
          success: true,
          message: 'Customer confirmation email sent successfully via Resend'
        }
      }

      console.warn('⚠️ No email service configured - skipping customer email')
      return {
        success: false,
        message: 'Email service not configured',
        error: 'No email service available'
      }
    } catch (error) {
      console.error('❌ Exception sending customer confirmation email:', error)
      return {
        success: false,
        message: 'Exception occurred while sending customer confirmation email',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send admin notification email using Resend
   */
  async sendAdminNotification(
    orderData: OrderData,
    orderDbId: number,
    adminEmail?: string
  ): Promise<EmailResult> {
    try {
      console.log('📧 Starting admin notification email...')
      console.log('📧 Order ID:', orderData.orderId)
      console.log('📧 Database ID:', orderDbId)
      console.log('📧 Admin Email:', adminEmail || process.env.ADMIN_EMAIL)
      console.log('📧 Customer Email:', orderData.customerInfo.email)
      
      if (!this.resend) {
        console.warn('⚠️ Resend not configured - skipping admin email')
        return {
          success: false,
          message: 'Email service not configured',
          error: 'RESEND_API_KEY not found'
        }
      }

      // Use admin email from env or fallback to customer email for testing
      const recipientEmail = adminEmail || process.env.ADMIN_EMAIL || orderData.customerInfo.email
      console.log('📧 Final recipient email:', recipientEmail)

      // Generate email HTML
      const emailHtml = this.generateAdminEmailHTML(orderData, orderDbId)

      // Send email using Resend
      const { data, error } = await this.resend.emails.send({
        from: 'DopeTech Nepal <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `🚨 New Order Alert: ${orderData.orderId} | DopeTech Nepal`,
        html: emailHtml,
        replyTo: 'dopetechnp@gmail.com'
      }).catch((err) => {
        console.error('❌ Resend API error:', err)
        return { data: null, error: err }
      })

      if (error) {
        console.error('❌ Error sending admin notification email:', error)
        return {
          success: false,
          message: 'Failed to send admin notification email',
          error: error.message
        }
      }

      console.log('✅ Admin notification email sent successfully')
      console.log('📧 Email ID:', data?.id)
      console.log('📧 Sent to:', recipientEmail)
      console.log('📧 Order ID in subject:', orderData.orderId)
      return {
        success: true,
        message: 'Admin notification email sent successfully'
      }
    } catch (error) {
      console.error('❌ Exception sending admin notification email:', error)
      return {
        success: false,
        message: 'Exception occurred while sending admin notification email',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send admin notification email only (customer emails disabled)
   */
  async sendOrderEmails(
    orderData: OrderData,
    orderDbId: number,
    adminEmail?: string
  ): Promise<{
    customerEmail: EmailResult
    adminEmail: EmailResult
  }> {
    console.log('📧 Sending admin notification email only...')

    // Only send admin email, skip customer email
    const adminResult = await Promise.allSettled([
      this.sendAdminNotification(orderData, orderDbId, adminEmail)
    ])

    const adminEmailResult = adminResult[0].status === 'fulfilled' 
      ? adminResult[0].value 
      : {
          success: false,
          message: 'Admin email failed',
          error: adminResult[0].reason?.message || 'Unknown error'
        }

    // Customer email is always skipped
    const customerEmail = {
      success: true,
      message: 'Customer email skipped (disabled by configuration)'
    }

    console.log('📧 Email results:', {
      customer: '⏭️ Skipped',
      admin: adminEmailResult.success ? '✅ Sent' : '❌ Failed'
    })

    return {
      customerEmail,
      adminEmail: adminEmailResult
    }
  }

  /**
   * Generate customer copy email HTML for manual sending
   */
  generateCustomerCopyEmail(orderData: OrderData, orderDbId: number): string {
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
          <title>Order Confirmation - DopeTech Nepal</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #000000;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F7DD0F;
            }
            .container {
              background-color: #F7DD0F;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              border: 3px solid #000000;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #000000;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 10px;
              text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            }
            .order-id {
              background-color: #000000;
              border: 1px solid #000000;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .order-id h2 {
              margin: 0;
              color: #F7DD0F;
              font-size: 20px;
            }
            .section {
              margin: 25px 0;
            }
            .section h3 {
              margin: 0 0 15px 0;
              color: #000000;
              font-size: 18px;
              border-bottom: 2px solid #000000;
              padding-bottom: 8px;
            }
            .customer-info {
              background-color: #000000;
              border: 1px solid #000000;
              border-radius: 8px;
              padding: 20px;
            }
            .customer-info h4 {
              margin: 0 0 15px 0;
              color: #F7DD0F;
              font-size: 16px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .info-item {
              padding: 10px;
              background-color: #F7DD0F;
              border-radius: 6px;
              border: 1px solid #000000;
            }
            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #000000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #000000;
            }
            .item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 15px;
              background-color: #000000;
              border-radius: 8px;
              margin: 10px 0;
              border: 1px solid #000000;
            }
            .item-name {
              font-weight: 600;
              color: #F7DD0F;
              font-size: 16px;
            }
            .item-details {
              color: #F7DD0F;
              font-size: 14px;
              margin-top: 5px;
            }
            .item-price {
              font-weight: bold;
              color: #F7DD0F;
              font-size: 16px;
            }
            .total-section {
              background-color: #000000;
              border: 2px solid #000000;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .total-amount {
              font-size: 28px;
              font-weight: bold;
              color: #F7DD0F;
              margin: 10px 0;
            }
            .payment-details {
              background-color: #000000;
              border: 1px solid #000000;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .payment-details h4 {
              margin: 0 0 15px 0;
              color: #F7DD0F;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #000000;
              color: #000000;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎮 DopeTech Nepal</div>
              <h1 style="margin: 0; color: #000000;">Order Confirmation</h1>
              <p style="margin: 10px 0 0 0; color: #000000; font-size: 16px;">Thank you for your order!</p>
            </div>

            <div class="order-id">
              <h2>✅ Order Confirmed!</h2>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #F7DD0F;">
                Order ID: <strong>${orderData.orderId}</strong>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #F7DD0F;">
                Placed on: ${orderDate}
              </p>
            </div>

            <div class="section">
              <h3>👤 Order Details</h3>
              <div class="customer-info">
                <h4>Customer Information</h4>
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
                    <div class="info-label">Address:</div>
                    <div class="info-value">${orderData.customerInfo.fullAddress}</div>
                  </div>
                </div>
              </div>
            </div>

            ${orderData.receiverInfo ? `
            <div class="section">
              <h3>📦 Delivery Information</h3>
              <div class="customer-info">
                <h4>Ship to Different Address</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Receiver Name:</div>
                    <div class="info-value">${orderData.receiverInfo.fullName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Receiver Phone:</div>
                    <div class="info-value">${orderData.receiverInfo.phone}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Delivery Address:</div>
                    <div class="info-value">${orderData.receiverInfo.fullAddress}</div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h3>📦 Order Items</h3>
              ${orderData.cart.map(item => `
                <div class="item">
                  <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">Quantity: ${item.quantity} × Rs ${item.price.toLocaleString()}</div>
                    ${(item.selectedColor || (item.selectedFeatures && item.selectedFeatures.length > 0)) ? `
                      <div class="item-options" style="margin-top: 5px; font-size: 12px; color: #F7DD0F;">
                        ${item.selectedColor ? `<div>Color: ${item.selectedColor}</div>` : ''}
                        ${item.selectedFeatures && item.selectedFeatures.length > 0 ? `<div>Features: ${item.selectedFeatures.join(', ')}</div>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  <div class="item-price">
                    Rs ${(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="total-section">
              <h3 style="margin: 0 0 15px 0; color: #F7DD0F;">💰 Order Summary</h3>
              <div class="total-amount">Rs ${orderData.total.toLocaleString()}</div>
              <p style="margin: 10px 0 0 0; color: #F7DD0F;">
                Total Order Value
              </p>
              ${orderData.paymentOption === 'deposit' ? `
                <p style="margin: 10px 0 0 0; color: #F7DD0F; font-size: 14px;">
                  Deposit Required: Rs ${depositAmount.toLocaleString()}
                </p>
                <p style="margin: 5px 0 0 0; color: #F7DD0F; font-size: 14px;">
                  Remaining Balance: Rs ${(orderData.total - depositAmount).toLocaleString()}
                </p>
              ` : ''}
            </div>

            <div class="payment-details">
              <h4>💳 Payment Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <div class="info-label">Payment Option:</div>
                  <div class="info-value">
                    ${orderData.paymentOption === 'full' ? 'Full Payment' : '10% Deposit'}
                  </div>
                </div>
                ${orderData.paymentOption === 'deposit' ? `
                  <div>
                    <div class="info-label">Deposit Amount:</div>
                    <div class="info-value" style="color: #F7DD0F; font-weight: bold;">
                      Rs ${depositAmount.toLocaleString()}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing DopeTech Nepal!</p>
              <p>If you have any questions, please contact us at dopetechnp@gmail.com</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Test email service configuration
   */
  async testEmailService(): Promise<EmailResult> {
    try {
      if (!this.resend) {
        return {
          success: false,
          message: 'Email service not configured',
          error: 'RESEND_API_KEY not found'
        }
      }

      const { data, error } = await this.resend.emails.send({
        from: 'DopeTech Nepal <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL || 'dopetechnp@gmail.com'],
        subject: 'Test Email - DopeTech Nepal Email Service',
        html: '<h1>Test Email</h1><p>This is a test email to verify the email service is working correctly.</p>'
      }).catch((err) => {
        console.error('❌ Resend API error:', err)
        return { data: null, error: err }
      })

      if (error) {
        return {
          success: false,
          message: 'Email service test failed',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Email service test successful'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Email service test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()
