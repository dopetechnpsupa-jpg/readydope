import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    // Update the hero image in the database
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // Handle show_content updates properly
    // Note: show_content can be true, false, or undefined

    const { data, error } = await supabaseAdmin
      .from('hero_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating hero image:', error)
      return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      image: data,
      message: 'Hero image updated successfully'
    })

  } catch (error) {
    console.error('❌ Error in hero image update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
