import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🖼️ API: Getting hero images...')
    
    const { data: heroImages, error } = await supabaseAdmin
      .from('hero_images')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('❌ API: Error getting hero images:', error)
      return NextResponse.json(
        { error: 'Failed to get hero images' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Retrieved ${heroImages?.length || 0} hero images`)
    
    return NextResponse.json(heroImages || [])
  } catch (error) {
    console.error('❌ API: Error getting hero images:', error)
    return NextResponse.json(
      { error: 'Failed to get hero images' },
      { status: 500 }
    )
  }
}
