import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📱 API: Getting QR codes...')
    
    // Get QR codes from database
    const { data: qrCodes, error } = await supabaseAdmin
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ API: Error getting QR codes:', error)
      return NextResponse.json(
        { error: 'Failed to get QR codes' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Retrieved ${qrCodes?.length || 0} QR codes`)
    
    return NextResponse.json(qrCodes || [])
  } catch (error) {
    console.error('❌ API: Error getting QR codes:', error)
    return NextResponse.json(
      { error: 'Failed to get QR codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📱 API: Creating QR code...')
    
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('qr_codes')
      .insert({
        name: body.name,
        image_url: body.image_url,
        is_active: body.is_active || true
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ API: Error creating QR code:', error)
      return NextResponse.json(
        { error: 'Failed to create QR code', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: QR code created with ID ${data.id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API: Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    )
  }
}
