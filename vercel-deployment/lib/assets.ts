import { supabase } from './supabase'

// Asset types
export interface Asset {
  id: string
  name: string
  url: string
  type: 'logo' | 'video' | 'image'
  created_at: string
}

// Asset bucket name
const ASSETS_BUCKET = 'assets'

// Initialize assets bucket if it doesn't exist
export async function initializeAssetsBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const assetsBucket = buckets?.find(bucket => bucket.name === ASSETS_BUCKET)
    
    if (!assetsBucket) {
      const { error } = await supabase.storage.createBucket(ASSETS_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'video/mp4', 'video/webm'],
        fileSizeLimit: 10485760 // 10MB limit
      })
      
      if (error) {
        console.error('Error creating assets bucket:', error)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error initializing assets bucket:', error)
    return false
  }
}

// Upload asset to Supabase storage
export async function uploadAsset(
  file: File,
  name: string,
  type: 'logo' | 'video' | 'image'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Initialize bucket if needed
    await initializeAssetsBucket()
    
    // Create unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${type}/${name}_${timestamp}.${fileExtension}`
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .upload(fileName, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      })
    
    if (error) {
      console.error('Error uploading asset:', error)
      return { success: false, error: error.message }
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(ASSETS_BUCKET)
      .getPublicUrl(fileName)
    
    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Error in uploadAsset:', error)
    return { success: false, error: 'Upload failed' }
  }
}

// Get asset URL by type with timeout
export async function getAssetUrl(type: 'logo' | 'video', name?: string): Promise<string | null> {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 3000) // 3 second timeout
    })

    const fetchPromise = (async () => {
      const { data: files, error } = await supabase.storage
        .from(ASSETS_BUCKET)
        .list(type, {
          limit: 100
        })
      
      if (error) {
        console.error('Error fetching asset:', error)
        return null
      }
      
      if (files && files.length > 0) {
        // Sort by created_at descending to get the most recent file
        const sortedFiles = files.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
        
        const latestFile = sortedFiles[0]
        const { data: urlData } = supabase.storage
          .from(ASSETS_BUCKET)
          .getPublicUrl(`${type}/${latestFile.name}`)
        
        return urlData.publicUrl
      }
      
      return null
    })()

    // Race between timeout and fetch
    return await Promise.race([fetchPromise, timeoutPromise])
  } catch (error) {
    console.error('Error in getAssetUrl:', error)
    return null
  }
}

// Get logo URL with immediate fallback
export async function getLogoUrl(): Promise<string> {
  try {
    const supabaseUrl = await getAssetUrl('logo', 'dopelogo')
    
    if (supabaseUrl) {
      return supabaseUrl
    }
  } catch (error) {
    console.error('Error loading logo from Supabase:', error)
  }
  
  // Immediate fallback to local file
  return '/logo/dopelogo.svg'
}

// Get video URL with immediate fallback
export async function getVideoUrl(): Promise<string> {
  try {
    const supabaseUrl = await getAssetUrl('video', 'footervid')
    
    if (supabaseUrl) {
      return supabaseUrl
    }
  } catch (error) {
    console.error('Error loading video from Supabase:', error)
  }
  
  // Immediate fallback to local file
  return '/video/footervid.mp4'
}

// List all assets
export async function listAssets(): Promise<Asset[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .list('', {
        limit: 100
      })
    
    if (error) {
      console.error('Error listing assets:', error)
      return []
    }
    
    return files?.map(file => ({
      id: file.id,
      name: file.name,
      url: supabase.storage.from(ASSETS_BUCKET).getPublicUrl(file.name).data.publicUrl,
      type: file.name.startsWith('logo/') ? 'logo' : 
            file.name.startsWith('video/') ? 'video' : 'image',
      created_at: file.created_at
    })) || []
  } catch (error) {
    console.error('Error in listAssets:', error)
    return []
  }
}

// Delete asset
export async function deleteAsset(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(ASSETS_BUCKET)
      .remove([fileName])
    
    if (error) {
      console.error('Error deleting asset:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteAsset:', error)
    return false
  }
}
