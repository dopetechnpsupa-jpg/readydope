"use client"

import React, { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileUploadWithSizeCheckProps {
  onFileSelect: (file: File) => void
  maxSizeBytes?: number
  acceptedTypes?: string[]
  bucketName?: string
  className?: string
}

export function FileUploadWithSizeCheck({ 
  onFileSelect, 
  maxSizeBytes = 1024 * 1024, // Default 1MB
  acceptedTypes = ['image/*'],
  bucketName = 'assets',
  className = ''
}: FileUploadWithSizeCheckProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): boolean => {
    setError(null)
    setSuccess(null)

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSizeBytes)})`)
      return false
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isValidType) {
      setError(`File type ${file.type} is not allowed. Accepted types: ${acceptedTypes.join(', ')}`)
      return false
    }

    setSuccess(`File "${file.name}" (${formatFileSize(file.size)}) is valid`)
    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setError(null)
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
        />
        
        <div className="space-y-2">
          <Upload className={`mx-auto h-8 w-8 ${
            selectedFile ? 'text-green-600' : 'text-gray-400'
          }`} />
          
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-green-600">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop file here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Max size: {formatFileSize(maxSizeBytes)} | 
                Types: {acceptedTypes.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Selected File Actions */}
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <span className="text-xs text-gray-500">
              ({formatFileSize(selectedFile.size)})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Size Limit Info */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <p><strong>Current File Size Limit:</strong> {formatFileSize(maxSizeBytes)}</p>
        <p><strong>Bucket:</strong> {bucketName}</p>
        <p className="mt-1">
          💡 <strong>Tip:</strong> If uploads are failing, you may need to increase the file size limit in your Supabase Storage settings.
        </p>
      </div>
    </div>
  )
}
