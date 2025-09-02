"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Trash2, 
  Download, 
  QrCode, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react'
import { supabase } from "@/lib/supabase"

interface QRCodeData {
  id: string
  name: string
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function QRCodeManager() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [qrCodeName, setQrCodeName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadQRCodes()
  }, [])

  const loadQRCodes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading QR codes:', error)
        setError('Failed to load QR codes')
        return
      }

      setQrCodes(data || [])
    } catch (err) {
      console.error('Error loading QR codes:', err)
      setError('Failed to load QR codes')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      setSelectedFile(file)
      setError("")
    }
  }

  const uploadQRCode = async () => {
    if (!selectedFile || !qrCodeName.trim()) {
      setError('Please select a file and enter a name')
      return
    }

    try {
      setUploading(true)
      setError("")

      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(fileName, selectedFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload image')
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase
        .from('qr_codes')
        .insert({
          name: qrCodeName.trim(),
          image_url: urlData.publicUrl,
          is_active: qrCodes.length === 0 // First QR code is active by default
        })

      if (dbError) {
        console.error('Database error:', dbError)
        setError('Failed to save QR code')
        return
      }

      setSuccess('QR code uploaded successfully!')
      setSelectedFile(null)
      setQrCodeName("")
      loadQRCodes()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload QR code')
    } finally {
      setUploading(false)
    }
  }

  const deleteQRCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        setError('Failed to delete QR code')
        return
      }

      setSuccess('QR code deleted successfully!')
      loadQRCodes()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete QR code')
    }
  }

  const toggleActive = async (id: string) => {
    try {
      // First, deactivate all QR codes
      await supabase
        .from('qr_codes')
        .update({ is_active: false })

      // Then activate the selected one
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_active: true })
        .eq('id', id)

      if (error) {
        console.error('Toggle error:', error)
        setError('Failed to update QR code status')
        return
      }

      setSuccess('QR code status updated!')
      loadQRCodes()
    } catch (err) {
      console.error('Toggle error:', err)
      setError('Failed to update QR code status')
    }
  }

  const downloadQRCode = (imageUrl: string, name: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${name}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Upload Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <QrCode className="w-6 h-6 text-blue-400" />
          Upload New QR Code
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-white mb-3">
              QR Code Name
            </label>
            <input
              type="text"
              value={qrCodeName}
              onChange={(e) => setQrCodeName(e.target.value)}
              placeholder="e.g., Payment QR Code"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-medium text-white mb-3">
              QR Code Image
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 sm:p-10 text-center hover:border-blue-500/50 transition-colors bg-white/5">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="qr-upload"
              />
              <label htmlFor="qr-upload" className="cursor-pointer">
                <div className="text-blue-400 mb-4">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
                </div>
                <p className="text-white font-medium text-base sm:text-lg">
                  {selectedFile ? selectedFile.name : 'Click to upload QR code image'}
                </p>
                <p className="text-gray-400 text-sm sm:text-base mt-2">
                  PNG, JPG up to 5MB
                </p>
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 sm:p-5 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 text-sm sm:text-base">✓ {selectedFile.name} selected</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={uploadQRCode}
            disabled={uploading || !selectedFile || !qrCodeName.trim()}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Upload QR Code
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 sm:p-5 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm sm:text-base">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 sm:p-5 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400 text-sm sm:text-base">{success}</p>
        </motion.div>
      )}

      {/* QR Codes List */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-3">
            <QrCode className="w-6 h-6 text-blue-400" />
            QR Codes ({qrCodes.length})
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadQRCodes}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="loading-skeleton h-20 rounded-lg"></div>
            ))}
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No QR codes uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qrCodes.map((qrCode) => (
              <motion.div
                key={qrCode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-base sm:text-lg">
                      {qrCode.name}
                      {qrCode.is_active && (
                        <span className="ml-3 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-300 mt-1">
                      Uploaded {new Date(qrCode.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {!qrCode.is_active && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleActive(qrCode.id)}
                      className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors duration-200 text-green-400 hover:text-green-300"
                      title="Set as active"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadQRCode(qrCode.image_url, qrCode.name)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors duration-200 text-blue-400 hover:text-blue-300"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteQRCode(qrCode.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
