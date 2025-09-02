import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/products-data'

export async function GET() {
  try {
    console.log('📦 API: Getting products...')
    
    const products = await getProducts()
    
    console.log(`✅ API: Retrieved ${products.length} products`)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('❌ API: Error getting products:', error)
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 API: Creating product...')
    
    const body = await request.json()
    
    // Use supabaseAdmin directly to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.original_price || body.price,
        image_url: body.image_url,
        category: body.category,
        rating: body.rating || 0,
        reviews: body.reviews || 0,
        features: body.features || [],
        color: body.color || null,
        in_stock: body.in_stock,
        discount: body.discount || 0,
        hidden_on_home: body.hidden_on_home || false
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ API: Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Product created with ID ${data.id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API: Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
