import { Resend } from 'resend'
import nodemailer from 'nodemailer'

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

interface EmailResult {
  success: boolean
  message: string
  error?: string
}

export class EmailService {
  private static instance: EmailService
  private resend: Resend | null
  private gmailTransporter: nodemailer.Transporter | null

  private constructor() {
    // Debug environment variables for Netlify
    console.log('🔧 Email Service Initialization:')
    console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('📧 GMAIL_USER exists:', !!process.env.GMAIL_USER)
    console.log('📧 GMAIL_APP_PASSWORD exists:', !!process.env.GMAIL_APP_PASSWORD)
    console.log('📧 ADMIN_EMAIL exists:', !!process.env.ADMIN_EMAIL)
    console.log('🌐 NODE_ENV:', process.env.NODE_ENV)
    console.log('🌐 VERCEL_ENV:', process.env.VERCEL_ENV)
    console.log('🌐 NETLIFY_ENV:', process.env.NETLIFY_ENV)

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not found - email service will be disabled')
      console.warn('💡 Add RESEND_API_KEY to your Netlify environment variables')
      this.resend = null as any
    } else {
      console.log('✅ Resend API key found, initializing Resend client...')
      this.resend = new Resend(apiKey)
    }

    // Initialize Gmail transporter for customer emails
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    
    if (!gmailUser || !gmailPass) {
      console.warn('⚠️ Gmail credentials not found - customer emails will use Resend')
      console.warn('💡 Add GMAIL_USER and GMAIL_APP_PASSWORD to your Netlify environment variables')
      this.gmailTransporter = null
    } else {
      console.log('✅ Gmail credentials found, initializing Gmail transporter...')
      this.gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      })
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
          <title>Order Confirmation - DopeTech GMK</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
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
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
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
              <p>Thank you for choosing DopeTech GMK!</p>
              <p>For any questions, please contact us at dopetechnp@gmail.com</p>
              <p style="margin-top: 20px; font-size: 12px;">
                © 2024 DopeTech GMK. All rights reserved.
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
            .order-summary {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .order-summary h3 {
              margin: 0 0 15px 0;
              color: #1e293b;
              font-size: 16px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .summary-item {
              padding: 10px;
              background-color: #f1f5f9;
              border-radius: 6px;
            }
            .summary-label {
              font-weight: 500;
              color: #64748b;
              font-size: 14px;
            }
            .summary-value {
              font-weight: 600;
              color: #1e293b;
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

            <div class="section">
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
              </ul>
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
      
      // Try Gmail SMTP first (for customer emails)
      if (this.gmailTransporter) {
        console.log('📧 Attempting to send customer email via Gmail SMTP...')
        console.log('📧 Gmail user:', process.env.GMAIL_USER)
        
        const emailHtml = this.generateCustomerEmailHTML(orderData)
        
        const mailOptions = {
          from: `"DopeTech GMK" <${process.env.GMAIL_USER}>`,
          to: orderData.customerInfo.email,
          subject: `Order Confirmation - ${orderData.orderId} | DopeTech GMK`,
          html: emailHtml,
          replyTo: 'dopetechnp@gmail.com'
        }

        try {
          const info = await this.gmailTransporter.sendMail(mailOptions)
          console.log('✅ Customer confirmation email sent successfully via Gmail')
          console.log('📧 Message ID:', info.messageId)
          console.log('📧 Sent to:', orderData.customerInfo.email)
          console.log('📧 Order ID in subject:', orderData.orderId)
          return {
            success: true,
            message: 'Customer confirmation email sent successfully via Gmail'
          }
        } catch (gmailError) {
          console.error('❌ Gmail SMTP error:', gmailError)
          console.log('📧 Falling back to Resend for customer email...')
          // Continue to Resend fallback
        }
      }

      // Fallback to Resend (for customer emails)
      if (this.resend) {
        console.log('📧 Sending customer email via Resend fallback...')
        console.log('📧 Customer email address:', orderData.customerInfo.email)
        
        const emailHtml = this.generateCustomerEmailHTML(orderData)
        
        const { data, error } = await this.resend.emails.send({
          from: 'DopeTech GMK <onboarding@resend.dev>',
          to: [orderData.customerInfo.email],
          subject: `Order Confirmation - ${orderData.orderId} | DopeTech GMK`,
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
        from: 'DopeTech GMK <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `🚨 New Order Alert: ${orderData.orderId} | DopeTech GMK`,
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
   * Send both customer confirmation and admin notification emails
   */
  async sendOrderEmails(
    orderData: OrderData,
    orderDbId: number,
    adminEmail?: string
  ): Promise<{
    customerEmail: EmailResult
    adminEmail: EmailResult
  }> {
    console.log('📧 Sending order emails...')

    // Send emails in parallel
    const [customerResult, adminResult] = await Promise.allSettled([
      this.sendCustomerConfirmation(orderData, orderDbId),
      this.sendAdminNotification(orderData, orderDbId, adminEmail)
    ])

    const customerEmail = customerResult.status === 'fulfilled' 
      ? customerResult.value 
      : {
          success: false,
          message: 'Customer email failed',
          error: customerResult.reason?.message || 'Unknown error'
        }

    const adminEmailResult = adminResult.status === 'fulfilled' 
      ? adminResult.value 
      : {
          success: false,
          message: 'Admin email failed',
          error: adminResult.reason?.message || 'Unknown error'
        }

    console.log('📧 Email results:', {
      customer: customerEmail.success ? '✅ Sent' : '❌ Failed',
      admin: adminEmailResult.success ? '✅ Sent' : '❌ Failed'
    })

    return {
      customerEmail,
      adminEmail: adminEmailResult
    }
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
        from: 'DopeTech GMK <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL || 'dopetechnp@gmail.com'],
        subject: 'Test Email - DopeTech GMK Email Service',
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
