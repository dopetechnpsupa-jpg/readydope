import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface HeroImage {
  id: number
  title: string
  subtitle?: string
  description?: string
  image_url: string
  image_file_name?: string
  button_text?: string
  button_link?: string
  display_order: number
  is_active: boolean
  show_content?: boolean
  created_at: string
  updated_at: string
}

export function useHeroImages() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHeroImages = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load ALL hero images (not just active ones) for admin management
      const { data: tableData, error: tableError } = await supabase
        .from('hero_images')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (tableError) {
        console.error('Error loading hero images:', tableError)
        setError('Failed to load hero images')
        return
      }

      // Add default show_content value for records that don't have it
      const processedData = tableData ? tableData.map((item: any) => ({
        ...item,
        show_content: item.show_content !== undefined ? item.show_content : true
      })) : []
      
      setHeroImages(processedData as HeroImage[])
    } catch (error) {
      console.error('Error loading hero images:', error)
      setError('Failed to load hero images')
    } finally {
      setLoading(false)
    }
  }

  const uploadHeroImage = async (file: File, metadata?: {
    title?: string
    subtitle?: string
    description?: string
    button_text?: string
    button_link?: string
    display_order?: number
    show_content?: boolean
  }): Promise<boolean> => {
    try {
      console.log('🚀 Starting hero image upload...')
      console.log('📁 File:', file.name, 'Size:', file.size)
      console.log('📝 Metadata:', metadata)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', metadata?.title || '')
      formData.append('subtitle', metadata?.subtitle || '')
      formData.append('description', metadata?.description || '')
      formData.append('display_order', (metadata?.display_order || 0).toString())
      formData.append('show_content', (metadata?.show_content !== false).toString())

      console.log('🌐 Making fetch request to /api/hero-images/upload')
      
      // Get the current origin for the fetch request
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const apiUrl = `${origin}/api/hero-images/upload`
      
      console.log('🌐 Full API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it with boundary
        }
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Server error:', errorData)
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Upload successful:', result)

      await loadHeroImages() // Reload the images
      return true
    } catch (error) {
      console.error('❌ Error uploading hero image:', error)
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      setError(`Failed to upload hero image: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  const deleteHeroImage = async (imageId: number | string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/hero-images/delete?id=${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      await loadHeroImages() // Reload the images
      return true
    } catch (error) {
      console.error('Error deleting hero image:', error)
      setError('Failed to delete hero image')
      return false
    }
  }

  const updateHeroImage = async (id: number, updates: Partial<HeroImage>): Promise<boolean> => {
    try {
      const response = await fetch('/api/hero-images/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Update failed')
      }

      await loadHeroImages() // Reload the images
      return true
    } catch (error) {
      console.error('Error updating hero image:', error)
      setError('Failed to update hero image')
      return false
    }
  }

  const getActiveHeroImages = (): HeroImage[] => {
    return heroImages.filter(img => img.is_active !== false).slice(0, 5) // Limit to 5 active images
  }

  useEffect(() => {
    loadHeroImages()
  }, [])

  return {
    heroImages,
    activeHeroImages: getActiveHeroImages(),
    loading,
    error,
    uploadHeroImage,
    deleteHeroImage,
    updateHeroImage,
    refreshHeroImages: loadHeroImages
  }
}
