import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteAsset as deleteAssetFromStorage } from '@/lib/assets'

export async function GET() {
  try {
    console.log('📁 API: Getting assets...')
    
    // List files from assets bucket
    const { data: files, error } = await supabaseAdmin.storage
      .from('assets')
      .list('', { limit: 100 })
    
    if (error) {
      console.error('❌ API: Error getting assets:', error)
      return NextResponse.json(
        { error: 'Failed to get assets' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Retrieved ${files?.length || 0} assets`)
    
    return NextResponse.json(files || [])
  } catch (error) {
    console.error('❌ API: Error getting assets:', error)
    return NextResponse.json(
      { error: 'Failed to get assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Uploading asset...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const fileName = `${Date.now()}-${file.name}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, file)
    
    if (error) {
      console.error('❌ API: Error uploading asset:', error)
      return NextResponse.json(
        { error: 'Failed to upload asset' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Asset uploaded: ${fileName}`)
    
    return NextResponse.json({ 
      success: true, 
      fileName: fileName,
      path: data.path 
    })
  } catch (error) {
    console.error('❌ API: Error uploading asset:', error)
    return NextResponse.json(
      { error: 'Failed to upload asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📁 API: Deleting asset...')
    
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
    }
    
    console.log(`🗑️ API: Attempting to delete asset: ${fileName}`)
    
    // Check if this is a directory by trying to list files inside it
    const { data: filesInDir, error: listError } = await supabaseAdmin.storage
      .from('assets')
      .list(fileName, { limit: 100 })
    
    if (!listError && filesInDir && filesInDir.length > 0) {
      // This is a directory with files - delete all files inside first
      console.log(`📁 API: "${fileName}" is a directory with ${filesInDir.length} files`)
      
      const filesToDelete = filesInDir.map(file => `${fileName}/${file.name}`)
      console.log(`🗑️ API: Deleting files: ${filesToDelete.join(', ')}`)
      
      const { error: deleteFilesError } = await supabaseAdmin.storage
        .from('assets')
        .remove(filesToDelete)
      
      if (deleteFilesError) {
        console.error(`❌ API: Failed to delete files in directory: ${deleteFilesError.message}`)
        return NextResponse.json(
          { error: 'Failed to delete files in directory', details: deleteFilesError.message },
          { status: 500 }
        )
      }
      
      console.log(`✅ API: All files in directory "${fileName}" deleted successfully`)
      
      return NextResponse.json({ 
        success: true,
        message: `Directory "${fileName}" and all its files deleted successfully`,
        deletedFiles: filesToDelete.length
      })
    } else {
      // This is a single file - use the original deletion method
      const success = await deleteAssetFromStorage(fileName)
      
      if (!success) {
        console.error(`❌ API: Failed to delete asset: ${fileName}`)
        return NextResponse.json(
          { error: 'Failed to delete asset from storage' },
          { status: 500 }
        )
      }
      
      console.log(`✅ API: File "${fileName}" deleted successfully`)
      
      return NextResponse.json({ 
        success: true,
        message: 'Asset deleted successfully'
      })
    }
  } catch (error) {
    console.error('❌ API: Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
