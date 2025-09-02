import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (orderId) {
      // Get specific order
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ order: data })
    } else {
      // Get all orders
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to get orders' }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 API: Updating order status...')
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    const body = await request.json()
    const { orderId, order_status } = body
    
    if (!orderId || !order_status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and order_status' },
        { status: 400, headers }
      )
    }
    
    console.log(`📝 API: Updating order ${orderId} status to: ${order_status}`)
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        order_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
    
    if (error) {
      console.error('❌ API: Error updating order status:', error)
      return NextResponse.json(
        { error: `Failed to update order status: ${error.message}` },
        { status: 500, headers }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers }
      )
    }
    
    console.log('✅ API: Order status updated successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: data[0]
    }, { headers })
    
  } catch (error) {
    console.error('❌ API: Error updating order status:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }}
    )
  }
}
