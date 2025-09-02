import { useState, useEffect } from 'react'
import { getLogoUrl, getVideoUrl, uploadAsset, listAssets, deleteAsset } from '@/lib/assets'
import type { Asset } from '@/lib/assets'

export function useAssets() {
  const [logoUrl, setLogoUrl] = useState<string>('/logo/dopelogo.svg')
  const [videoUrl, setVideoUrl] = useState<string>('/video/footervid.mp4')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load assets on mount
  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load logo and video URLs with timeout and caching
      const [logo, video] = await Promise.allSettled([
        getLogoUrl(),
        getVideoUrl()
      ])

      // Use results or fallbacks
      setLogoUrl(logo.status === 'fulfilled' ? logo.value : '/logo/dopelogo.svg')
      setVideoUrl(video.status === 'fulfilled' ? video.value : '/video/footervid.mp4')

      // Load all assets list (non-blocking)
      try {
        const allAssets = await listAssets()
        setAssets(allAssets)
      } catch (err) {
        console.error('Error loading assets list:', err)
        // Don't fail the entire load for this
      }

    } catch (err) {
      console.error('Error loading assets:', err)
      setError('Failed to load assets')
      // Ensure we have fallbacks
      setLogoUrl('/logo/dopelogo.svg')
      setVideoUrl('/video/footervid.mp4')
    } finally {
      setLoading(false)
    }
  }

  const uploadAssetFile = async (
    file: File,
    name: string,
    type: 'logo' | 'video' | 'image'
  ) => {
    try {
      setError(null)
      const result = await uploadAsset(file, name, type)
      
      if (result.success) {
        // Reload assets after successful upload
        await loadAssets()
        return { success: true, url: result.url }
      } else {
        setError(result.error || 'Upload failed')
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('Error uploading asset:', err)
      setError('Upload failed')
      return { success: false, error: 'Upload failed' }
    }
  }

  const deleteAssetFile = async (fileName: string) => {
    try {
      setError(null)
      const success = await deleteAsset(fileName)
      
      if (success) {
        // Reload assets after successful deletion
        await loadAssets()
        return { success: true }
      } else {
        setError('Failed to delete asset')
        return { success: false, error: 'Failed to delete asset' }
      }
    } catch (err) {
      console.error('Error deleting asset:', err)
      setError('Failed to delete asset')
      return { success: false, error: 'Failed to delete asset' }
    }
  }

  const refreshAssets = () => {
    loadAssets()
  }

  return {
    logoUrl,
    videoUrl,
    assets,
    loading,
    error,
    uploadAsset: uploadAssetFile,
    deleteAsset: deleteAssetFile,
    refreshAssets
  }
}

// Optimized hook for getting just the logo URL with caching
export function useLogoUrl() {
  const [logoUrl, setLogoUrl] = useState<string>('/logo/dopelogo.svg')
  const [loading, setLoading] = useState(false) // Start with false since we have fallback

  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Check cache first
        const cachedLogo = sessionStorage.getItem('cachedLogoUrl')
        const cacheTime = sessionStorage.getItem('logoCacheTime')
        const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity
        
        // Use cache if it's less than 10 minutes old
        if (cachedLogo && cacheAge < 10 * 60 * 1000) {
          setLogoUrl(cachedLogo)
          return
        }
        
        setLoading(true)
        const url = await getLogoUrl()
        setLogoUrl(url)
        
        // Cache the result
        sessionStorage.setItem('cachedLogoUrl', url)
        sessionStorage.setItem('logoCacheTime', Date.now().toString())
      } catch (err) {
        console.error('Error loading logo:', err)
        // Keep fallback
        setLogoUrl('/logo/dopelogo.svg')
      } finally {
        setLoading(false)
      }
    }

    loadLogo()
  }, [])

  return { logoUrl, loading }
}

// Optimized hook for getting just the video URL with caching
export function useVideoUrl() {
  const [videoUrl, setVideoUrl] = useState<string>('/video/footervid.mp4')
  const [loading, setLoading] = useState(false) // Start with false since we have fallback

  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Check cache first
        const cachedVideo = sessionStorage.getItem('cachedVideoUrl')
        const cacheTime = sessionStorage.getItem('videoCacheTime')
        const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : Infinity
        
        // Use cache if it's less than 10 minutes old
        if (cachedVideo && cacheAge < 10 * 60 * 1000) {
          setVideoUrl(cachedVideo)
          return
        }
        
        setLoading(true)
        const url = await getVideoUrl()
        setVideoUrl(url)
        
        // Cache the result
        sessionStorage.setItem('cachedVideoUrl', url)
        sessionStorage.setItem('videoCacheTime', Date.now().toString())
      } catch (err) {
        console.error('Error loading video:', err)
        // Keep fallback
        setVideoUrl('/video/footervid.mp4')
      } finally {
        setLoading(false)
      }
    }

    loadVideo()
  }, [])

  return { videoUrl, loading }
}
