"use client"

import { useState, useRef } from 'react'
import { useAssets } from '@/hooks/use-assets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, CheckCircle, AlertCircle, FileText, Image, Video, FileImage } from 'lucide-react'

export function AssetUploader() {
  const { uploadAsset, refreshAssets, error } = useAssets()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState<'logo' | 'video' | 'image'>('logo')
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
      
      // Auto-generate name from filename
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.')
      setAssetName(nameWithoutExt)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setAssetName('')
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload handling
  const handleUpload = async () => {
    if (!selectedFile || !assetName.trim()) {
      setUploadResult({ success: false, message: 'Please select a file and enter a name' })
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const result = await uploadAsset(selectedFile, assetName.trim(), assetType)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        setUploadResult({ 
          success: true, 
          message: `Asset uploaded successfully! URL: ${result.url}` 
        })
        setSelectedFile(null)
        setAssetName('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        refreshAssets()
      } else {
        setUploadResult({ 
          success: false, 
          message: result.error || 'Upload failed' 
        })
      }
    } catch (err) {
      setUploadResult({ 
        success: false, 
        message: 'Upload failed unexpectedly' 
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Utility functions
  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'logo':
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'video':
        return <Video className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'image':
        return <Image className="w-4 h-4 sm:w-5 sm:h-5" />
      default:
        return <FileImage className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeDescription = (type: string) => {
    switch (type) {
      case 'logo':
        return 'SVG, PNG, or JPEG files (recommended: SVG for logos)'
      case 'video':
        return 'MP4 or WebM files (max 10MB)'
      case 'image':
        return 'PNG or JPEG files'
      default:
        return ''
    }
  }

  const getAcceptTypes = () => {
    switch (assetType) {
      case 'logo':
        return '.svg,.png,.jpg,.jpeg'
      case 'video':
        return '.mp4,.webm'
      case 'image':
        return '.png,.jpg,.jpeg'
      default:
        return '.png,.jpg,.jpeg'
    }
  }

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
        {/* Header Section */}
        <CardHeader className="pb-4 sm:pb-6 border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                Upload New Assets
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base text-gray-300 mt-1 leading-relaxed">
                Upload logo, video, or image files to Supabase storage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {/* Content Section */}
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* File Selection Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="file" className="text-sm sm:text-base font-semibold text-white">
                Select File
              </Label>
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  disabled={uploading}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-2 sm:px-3 sm:py-2 h-auto min-h-[44px]"
                >
                  <X className="w-4 h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Clear</span>
                </Button>
              )}
            </div>
            
            <div className="relative">
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={getAcceptTypes()}
                disabled={uploading}
                className="file:text-blue-500 file:hover:text-blue-600 file:font-semibold file:bg-transparent file:border-0 file:py-2 sm:file:py-3 file:px-3 sm:file:px-4 file:rounded-lg file:cursor-pointer file:transition-colors file:duration-200 border-white/20 bg-white/10 text-white h-12 sm:h-14 text-sm sm:text-base"
              />
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                    {getAssetTypeIcon(assetType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {formatFileSize(selectedFile.size)} • {assetType.charAt(0).toUpperCase() + assetType.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset Configuration Section - Stack vertically on mobile, side-by-side on larger screens */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:gap-6">
            {/* Asset Type Selection */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="type" className="text-sm sm:text-base font-semibold text-white">
                Asset Type
              </Label>
              <Select value={assetType} onValueChange={(value: 'logo' | 'video' | 'image') => setAssetType(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="logo" className="py-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <FileText className="w-4 h-4" />
                      <span>Logo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="video" className="py-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="image" className="py-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Image className="w-4 h-4" />
                      <span>Image</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asset Name */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="name" className="text-sm sm:text-base font-semibold text-white">
                Asset Name
              </Label>
              <Input
                id="name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Enter asset name"
                disabled={uploading}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 h-12 sm:h-14 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* File Type Description */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-300 font-medium leading-relaxed">
              💡 {getFileTypeDescription(assetType)}
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-blue-300 font-medium text-sm sm:text-base">Uploading...</span>
                <span className="text-blue-400 font-bold text-base sm:text-lg">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button - Full width on mobile, centered with fixed width on larger screens */}
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !assetName.trim() || uploading}
              className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[240px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg h-12 sm:h-14"
            >
              {uploading ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Upload Asset</span>
                </div>
              )}
            </Button>
          </div>

          {/* Status Messages */}
          <div className="space-y-3">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                <AlertDescription className="text-red-300 font-medium text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {uploadResult && (
              <Alert 
                variant={uploadResult.success ? "default" : "destructive"}
                className={uploadResult.success 
                  ? "bg-green-500/10 border-green-500/20" 
                  : "bg-red-500/10 border-red-500/20"
                }
              >
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                )}
                <AlertDescription className={uploadResult.success ? "text-green-300 font-medium text-xs sm:text-sm" : "text-red-300 font-medium text-xs sm:text-sm"}>
                  {uploadResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
