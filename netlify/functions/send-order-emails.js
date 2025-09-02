const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📧 Netlify function: send-order-emails triggered');
    console.log('📧 Environment variables check:');
    console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('📧 ADMIN_EMAIL exists:', !!process.env.ADMIN_EMAIL);
    console.log('📧 ADMIN_EMAIL value:', process.env.ADMIN_EMAIL);

    // Parse the request body
    const orderData = JSON.parse(event.body);
    
    console.log('📧 Order data received:', {
      orderId: orderData.orderId,
      customerName: orderData.customerInfo?.fullName,
      customerEmail: orderData.customerInfo?.email,
      total: orderData.total
    });

    // Validate required fields
    if (!orderData.orderId || !orderData.customerInfo || !orderData.cart) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required order data' })
      };
    }

    // Generate admin email HTML
    const adminEmailHtml = generateAdminEmailHTML(orderData, orderData.orderDbId || 0);

    // Send admin notification email
    const { data, error } = await resend.emails.send({
      from: 'DopeTech GMK <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'dopetechnp@gmail.com'],
      subject: `🚨 New Order Alert: ${orderData.orderId} | DopeTech GMK`,
      html: adminEmailHtml,
      replyTo: 'dopetechnp@gmail.com'
    });

    if (error) {
      console.error('❌ Error sending admin email:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to send admin email',
          details: error.message 
        })
      };
    }

    console.log('✅ Admin email sent successfully');
    console.log('📧 Email ID:', data?.id);
    console.log('📧 Sent to:', process.env.ADMIN_EMAIL);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Admin notification email sent successfully',
        emailId: data?.id
      })
    };

  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

// Generate admin email HTML
function generateAdminEmailHTML(orderData, orderDbId) {
  const depositAmount = orderData.paymentOption === 'deposit' ? Math.max(1, Math.round(orderData.total * 0.10)) : 0;
  const orderDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
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
            </div>
            <div style="margin-top: 15px;">
              <div class="info-label">Full Address:</div>
              <div class="info-value">${orderData.customerInfo.fullAddress}</div>
            </div>
          </div>

          <div>
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">📦 Order Items</h3>
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
  `;
}
