import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/products-data'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`📦 API: Getting product ${id}...`)
    
    const productId = parseInt(id)
    const product = await getProductById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ API: Product ${id} retrieved`)
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('❌ API: Error getting product:', error)
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`📦 API: Updating product ${id}...`)
    
    const productId = parseInt(id)
    const body = await request.json()
    
    // Use supabaseAdmin directly to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.original_price,
        image_url: body.image_url,
        category: body.category,
        features: body.features,
        color: body.color,
        in_stock: body.in_stock,
        discount: body.discount
      })
      .eq('id', productId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ API: Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Product ${id} updated`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API: Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`📦 API: Deleting product ${id}...`)
    
    const productId = parseInt(id)
    
    // Use supabaseAdmin directly to bypass RLS policies
    // First delete product images
    const { error: imagesError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId)
    
    if (imagesError) {
      console.error('❌ API: Error deleting product images:', imagesError)
      // Continue anyway, might not have images
    }
    
    // Then delete the product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (error) {
      console.error('❌ API: Error deleting product:', error)
      return NextResponse.json(
        { error: 'Failed to delete product', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Product ${id} deleted`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ API: Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
