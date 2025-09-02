"use client"

import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Image as ImageIcon,
  Loader2,
  X
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductImage, addProductImage, deleteProductImage, setPrimaryImage, reorderProductImages } from '@/lib/products-data'

interface ProductImageManagerProps {
  productId: number
  onImagesChange?: (images: ProductImage[]) => void
  initialImages?: ProductImage[]
}

export function ProductImageManager({ productId, onImagesChange, initialImages = [] }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (initialImages.length > 0) {
      setImages(initialImages)
    }
  }, [initialImages])

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId || 'temp'}-${Date.now()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload image')
        return
      }

      // Get the public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(fileName)

      const imageUrl = urlData.publicUrl

             // For new products (productId = 0), just add to local state
       if (productId === 0) {
         const tempImage: ProductImage = {
           id: Date.now(), // Temporary ID
           product_id: 0,
           image_url: imageUrl,
           file_name: file.name,
           display_order: images.length + 1,
           is_primary: images.length === 0,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         }
        const updatedImages = [...images, tempImage]
        setImages(updatedImages)
        onImagesChange?.(updatedImages)
        setUploadProgress(100)
       } else {
         // Add to product_images table for existing products
         const newImage = await addProductImage(productId, imageUrl, file.name, images.length === 0)
        
        if (newImage) {
          const updatedImages = [...images, newImage]
          setImages(updatedImages)
          onImagesChange?.(updatedImages)
          setUploadProgress(100)
        } else {
          console.error('Failed to add product image to database')
          alert('Failed to save image to database')
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      if (productId === 0) {
        // For new products, just remove from local state
        const updatedImages = images.filter(img => img.id !== imageId)
        setImages(updatedImages)
        onImagesChange?.(updatedImages)
      } else {
        const success = await deleteProductImage(imageId)
        if (success) {
          const updatedImages = images.filter(img => img.id !== imageId)
          setImages(updatedImages)
          onImagesChange?.(updatedImages)
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const handleSetPrimary = async (imageId: number) => {
    try {
      if (productId === 0) {
        // For new products, just update local state
        const updatedImages = images.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
        setImages(updatedImages)
        onImagesChange?.(updatedImages)
      } else {
        const success = await setPrimaryImage(imageId)
        if (success) {
          const updatedImages = images.map(img => ({
            ...img,
            is_primary: img.id === imageId
          }))
          setImages(updatedImages)
          onImagesChange?.(updatedImages)
        }
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
      alert('Failed to set primary image')
    }
  }

  const handleMoveImage = async (imageId: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    const [movedImage] = newImages.splice(currentIndex, 1)
    newImages.splice(newIndex, 0, movedImage)

    setImages(newImages)
    onImagesChange?.(newImages)

    // Update order in database only for existing products
    if (productId !== 0) {
      const imageIds = newImages.map(img => img.id)
      await reorderProductImages(productId, imageIds)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Product Images</h3>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageUpload(file)
              }
            }}
            className="hidden"
            id={`image-upload-${productId}`}
            disabled={isUploading}
          />
          <label
            htmlFor={`image-upload-${productId}`}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors duration-200 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Add Image'}</span>
          </label>
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No images uploaded yet</p>
          <p className="text-sm text-gray-500">Upload the first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-200"
            >
              {/* Image */}
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary indicator */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <span>Primary</span>
                  </div>
                )}

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    {/* Set as primary */}
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors duration-200 text-yellow-400 hover:text-yellow-300"
                        title="Set as primary"
                      >
                        <span className="text-xs font-semibold">Set Primary</span>
                      </button>
                    )}

                    {/* Move up */}
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveImage(image.id, 'up')}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors duration-200 text-blue-400 hover:text-blue-300"
                        title="Move up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                    )}

                    {/* Move down */}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => handleMoveImage(image.id, 'down')}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors duration-200 text-blue-400 hover:text-blue-300"
                        title="Move down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

                             {/* Image info */}
               <div className="p-3">
                 <p className="text-sm text-gray-300">Image {index + 1}</p>
                 <p className="text-xs text-gray-500">Order: {image.display_order || image.image_order || image.sort_order || index + 1}</p>
               </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="text-sm text-gray-400">
          <p>• The first image will be used as the product thumbnail</p>
          <p>• You can reorder images by using the up/down arrows</p>
          <p>• Click "Set Primary" to set an image as primary</p>
        </div>
      )}
    </div>
  )
}
