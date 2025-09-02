'use client'

import { useState } from 'react'
import { useHeroImages, HeroImage } from '@/hooks/use-hero-images'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Upload, Trash2, Edit, Save, X, FileImage, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function HeroImageManager() {
  const { 
    heroImages, 
    loading, 
    error, 
    uploadHeroImage, 
    deleteHeroImage, 
    updateHeroImage,
    refreshHeroImages 
  } = useHeroImages()

  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<HeroImage>>({})
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_link: '',
    show_content: true
  })
  const [previewMode, setPreviewMode] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('🎯 Starting file upload process...')
    setUploading(true)
    try {
      const success = await uploadHeroImage(file, {
        title: uploadForm.title,
        subtitle: uploadForm.subtitle,
        description: uploadForm.description,
        button_text: '',
        button_link: uploadForm.button_link,
        display_order: heroImages.length + 1,
        show_content: uploadForm.show_content
      })

      if (success) {
        console.log('✅ Upload completed successfully')
        event.target.value = '' // Clear the input
        setUploadForm({ title: '', subtitle: '', description: '', button_link: '', show_content: true }) // Clear form
      } else {
        console.log('❌ Upload failed')
      }
    } catch (error) {
      console.error('❌ Upload error in component:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: number | string) => {
    if (confirm('Are you sure you want to delete this hero image?')) {
      await deleteHeroImage(imageId)
    }
  }

  const startEditing = (image: HeroImage) => {
    setEditingId(image.id)
    setEditForm({
      title: image.title,
      subtitle: image.subtitle,
      description: image.description,
      button_text: image.button_text,
      button_link: image.button_link,
      display_order: image.display_order,
      is_active: image.is_active,
      show_content: image.show_content !== false
    })
  }

  const saveEdit = async () => {
    if (editingId) {
      await updateHeroImage(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const toggleActive = async (image: HeroImage) => {
    // If the image is already active, toggle show_content instead
    if (image.is_active) {
      await updateHeroImage(image.id, { show_content: !image.show_content })
    } else {
      // If the image is inactive, activate it and ensure show_content is true
      await updateHeroImage(image.id, { is_active: true, show_content: true })
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <FileImage className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                  Hero Carousel Management
                </CardTitle>
                <p className="text-xs sm:text-sm lg:text-base text-gray-300 mt-1 leading-relaxed">
                  Manage hero images for the sliding card carousel
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-gray-400 text-sm sm:text-base">Loading hero images...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <FileImage className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                  Hero Carousel Management
                </CardTitle>
                <p className="text-xs sm:text-sm lg:text-base text-gray-300 mt-1 leading-relaxed">
                  Manage hero images for the sliding card carousel. Active images will be displayed on the homepage.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setPreviewMode(!previewMode)} 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 h-10 px-3 sm:px-4"
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline ml-2">{previewMode ? 'Hide' : 'Preview'}</span>
              </Button>
              <Button 
                onClick={refreshHeroImages} 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 h-10 px-3 sm:px-4"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2 mt-3 sm:mt-4">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-xs sm:text-sm text-gray-400">
              {loading ? 'Loading...' : error ? 'Connection Error' : `${heroImages.length} images loaded`}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertDescription className="text-red-300 font-medium text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview Section */}
      {previewMode && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
          <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-white">
                  Carousel Preview
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Preview of active hero images
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {heroImages.filter(img => img.is_active).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileImage className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No active hero images to preview</p>
                <p className="text-xs sm:text-sm mt-1">Upload and activate images to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {heroImages
                  .filter(img => img.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-video bg-black/50 rounded-lg sm:rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300">
                        <img
                          src={image.image_url}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h4 className="text-white font-semibold text-sm sm:text-base">{image.title}</h4>
                          {image.subtitle && (
                            <p className="text-gray-300 text-xs sm:text-sm">{image.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-white">
                Upload Hero Image
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Upload an image to display in the hero carousel. Recommended size: 1920x1080px
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Text Input Fields */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="upload-title" className="text-sm sm:text-base font-semibold text-white">Title *</Label>
                <Input
                  id="upload-title"
                  placeholder="Enter hero title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  disabled={uploading}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="upload-subtitle" className="text-sm sm:text-base font-semibold text-white">Subtitle</Label>
                <Input
                  id="upload-subtitle"
                  placeholder="Enter subtitle"
                  value={uploadForm.subtitle}
                  onChange={(e) => setUploadForm({ ...uploadForm, subtitle: e.target.value })}
                  disabled={uploading}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="upload-description" className="text-sm sm:text-base font-semibold text-white">Description</Label>
              <Textarea
                id="upload-description"
                placeholder="Enter description (optional)"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={3}
                disabled={uploading}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="upload-link" className="text-sm sm:text-base font-semibold text-white">Link URL</Label>
              <Input
                id="upload-link"
                placeholder="Enter link URL (e.g., /product/123 or https://example.com)"
                value={uploadForm.button_link}
                onChange={(e) => setUploadForm({ ...uploadForm, button_link: e.target.value })}
                disabled={uploading}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-gray-400">
                When users click on this carousel slide, they will be redirected to this URL
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/20">
              <div>
                <Label className="text-sm sm:text-base font-semibold text-white">Show Content</Label>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Display title, subtitle, and description on this carousel slide
                </p>
              </div>
              <Switch
                checked={uploadForm.show_content}
                onCheckedChange={(checked) => setUploadForm({ ...uploadForm, show_content: checked })}
                disabled={uploading}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-600"
              />
            </div>
          </div>
          
          {/* File Upload */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold text-white">Select Image File</Label>
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="file:text-blue-500 file:hover:text-blue-600 file:font-semibold file:bg-transparent file:border-0 file:py-2 sm:file:py-3 file:px-3 sm:file:px-4 file:rounded-lg file:cursor-pointer file:transition-colors file:duration-200 border-white/20 bg-white/10 text-white h-12 sm:h-14 text-sm sm:text-base"
              />
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <p className="text-sm sm:text-base">Uploading...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hero Images List */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
              <FileImage className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-white">
                Current Hero Images
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                {heroImages.filter(img => img.is_active).length} active out of {heroImages.length} total
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          {heroImages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <FileImage className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No hero images uploaded yet.</p>
              <p className="text-xs sm:text-sm mt-1">Upload your first hero image to get started</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {heroImages.map((image) => (
                <Card key={image.id} className="overflow-hidden bg-white/5 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Preview */}
                    <div className="w-full sm:w-48 h-32 sm:h-32 relative bg-black/50">
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="relative group">
                          <Switch
                            checked={image.is_active}
                            onCheckedChange={() => toggleActive(image)}
                            className={`${
                              image.is_active 
                                ? image.show_content !== false 
                                  ? 'data-[state=checked]:bg-blue-500' 
                                  : 'data-[state=checked]:bg-orange-500'
                                : 'data-[state=unchecked]:bg-gray-600'
                            }`}
                          />
                          {image.is_active && (
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              {image.show_content !== false ? 'Click to hide text' : 'Click to show text'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">
                        Order: {image.display_order}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 text-white">
                      {editingId === image.id ? (
                        // Edit Form
                        <div className="space-y-3 sm:space-y-4">
                          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="title" className="text-sm sm:text-base font-semibold text-white">Title</Label>
                              <Input
                                id="title"
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                              />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="subtitle" className="text-sm sm:text-base font-semibold text-white">Subtitle</Label>
                              <Input
                                id="subtitle"
                                value={editForm.subtitle || ''}
                                onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-white">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows={2}
                              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            />
                          </div>
                          
                          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="button_text" className="text-sm sm:text-base font-semibold text-white">Button Text</Label>
                              <Input
                                id="button_text"
                                value={editForm.button_text || ''}
                                onChange={(e) => setEditForm({ ...editForm, button_text: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                              />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label htmlFor="display_order" className="text-sm sm:text-base font-semibold text-white">Display Order</Label>
                              <Input
                                id="display_order"
                                type="number"
                                value={editForm.display_order || 0}
                                onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="button_link" className="text-sm sm:text-base font-semibold text-white">Link URL</Label>
                            <Input
                              id="button_link"
                              placeholder="Enter link URL (e.g., /product/123 or https://example.com)"
                              value={editForm.button_link || ''}
                              onChange={(e) => setEditForm({ ...editForm, button_link: e.target.value })}
                              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
                            />
                            <p className="text-xs sm:text-sm text-gray-400">
                              When users click on this carousel slide, they will be redirected to this URL
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/20">
                            <div>
                              <Label className="text-sm sm:text-base font-semibold text-white">Show Content</Label>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                Display title, subtitle, and description on this carousel slide
                              </p>
                            </div>
                            <Switch
                              checked={editForm.show_content !== false}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, show_content: checked })}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-600"
                            />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button 
                              onClick={saveEdit} 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white h-10 sm:h-12"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button 
                              onClick={cancelEdit} 
                              variant="outline" 
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10 h-10 sm:h-12"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm sm:text-base truncate">{image.title}</h4>
                              {image.subtitle && (
                                <p className="text-sm text-gray-300 truncate">{image.subtitle}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => startEditing(image)}
                                variant="outline"
                                size="sm"
                                className="border-white/20 text-white hover:bg-white/10 h-10 px-3 sm:px-4"
                              >
                                <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Edit</span>
                              </Button>
                              <Button
                                onClick={() => handleDelete(image.id)}
                                variant="destructive"
                                size="sm"
                                className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 h-10 px-3 sm:px-4"
                              >
                                <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Delete</span>
                              </Button>
                            </div>
                          </div>
                          
                          {image.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">{image.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              image.is_active 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {image.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {image.is_active && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                image.show_content !== false
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              }`}>
                                {image.show_content !== false ? 'Show Text' : 'Hide Text'}
                              </span>
                            )}
                            <span>Order: {image.display_order}</span>
                            {image.button_text && (
                              <span>Button: {image.button_text}</span>
                            )}
                            {image.button_link && (
                              <span className="text-blue-400 truncate">Link: {image.button_link}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
