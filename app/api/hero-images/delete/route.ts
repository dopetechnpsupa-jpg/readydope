import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    // Get image data first to get the file name
    const { data: imageData, error: fetchError } = await supabaseAdmin
      .from('hero_images')
      .select('image_file_name')
      .eq('id', imageId)
      .single()

    if (fetchError || !imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete from storage
    if (imageData.image_file_name) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('hero-images')
        .remove([imageData.image_file_name])

      if (storageError) {
        console.error('❌ Error deleting from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('hero_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('❌ Error deleting from database:', dbError)
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Hero image deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error in hero image delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
