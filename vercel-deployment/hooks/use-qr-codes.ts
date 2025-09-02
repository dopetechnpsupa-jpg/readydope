import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface QRCode {
  id: string
  name: string
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useQRCodes() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [activeQRCode, setActiveQRCode] = useState<QRCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQRCodes()
  }, [])

  const loadQRCodes = async () => {
    try {
      setLoading(true)
      setError(null)

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
      
      // Find the active QR code
      const active = data?.find(qr => qr.is_active)
      setActiveQRCode(active || null)
    } catch (err) {
      console.error('Error loading QR codes:', err)
      setError('Failed to load QR codes')
    } finally {
      setLoading(false)
    }
  }

  const refreshQRCodes = () => {
    loadQRCodes()
  }

  return {
    qrCodes,
    activeQRCode,
    loading,
    error,
    refreshQRCodes
  }
}
