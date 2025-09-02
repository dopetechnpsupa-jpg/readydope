import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🖼️ API: Getting product images...')
    
    // Get product images from database
    const { data: images, error } = await supabaseAdmin
      .from('product_images')
      .select(`
        *,
        products (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ API: Error getting product images:', error)
      return NextResponse.json(
        { error: 'Failed to get product images' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Retrieved ${images?.length || 0} product images`)
    
    return NextResponse.json(images || [])
  } catch (error) {
    console.error('❌ API: Error getting product images:', error)
    return NextResponse.json(
      { error: 'Failed to get product images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ API: Creating product image...')
    
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: body.product_id,
        image_url: body.image_url,
        file_name: body.file_name,
        display_order: body.display_order || 0,
        is_primary: body.is_primary || false
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ API: Error creating product image:', error)
      return NextResponse.json(
        { error: 'Failed to create product image', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Product image created with ID ${data.id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API: Error creating product image:', error)
    return NextResponse.json(
      { error: 'Failed to create product image' },
      { status: 500 }
    )
  }
}
