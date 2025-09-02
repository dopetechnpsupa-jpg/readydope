"use client"

import { useState, useRef, useEffect } from "react"
import { X, Truck, Lock, CheckCircle, ChevronDown, Upload, FileText, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQRCodes } from '@/hooks/use-qr-codes'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string
  selectedColor?: string
  selectedFeatures?: string[]
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  total: number
  onCartReset: () => void
}

export default function SupabaseCheckout({ isOpen, onClose, cart, total, onCartReset }: CheckoutModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const { activeQRCode, loading: qrLoading } = useQRCodes()
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: '',
  })
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: '',
  })
  const [showShippingAddress, setShowShippingAddress] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [currentStep, setCurrentStep] = useState<'customer-info' | 'payment-selection' | 'payment' | 'confirmation'>('customer-info')
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptFileName, setReceiptFileName] = useState('')
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  const [isCartCollapsed, setIsCartCollapsed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Auto-collapse cart on mobile for better UX
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 // lg breakpoint
    if (isMobile) {
      setIsCartCollapsed(true)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden'
      return
    }
    setIsClosing(true)
    // Restore body scroll when modal is closed
    document.body.style.overflow = 'unset'
    const timeout = setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
    }, 220)
    return () => {
      clearTimeout(timeout)
      // Ensure body scroll is restored on cleanup
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const NEPAL_PHONE_REGEX = /^\+977\d{8,10}$/

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '')
    let localPart = digitsOnly
    if (localPart.startsWith('977')) {
      localPart = localPart.slice(3)
    }
    localPart = localPart.slice(0, 10)
    const fullNumber = `+977${localPart}`
    handleCustomerInfoChange('phone', fullNumber)
  }

  const isCustomerInfoValid = () => {
    // Basic customer info validation (name, email, phone, terms)
    const basicInfoValid = (
      customerInfo.fullName.trim().length > 0 &&
      customerInfo.email.trim().length > 0 &&
      NEPAL_PHONE_REGEX.test(customerInfo.phone) &&
      termsAccepted
    )
    
    console.log('🔍 Customer validation:', {
      basicInfoValid,
      showShippingAddress,
      customerAddress: customerInfo.fullAddress.trim().length > 0,
      receiverValid: showShippingAddress ? isReceiverInfoValid() : 'N/A'
    })
    
    // If shipping to different address, validate receiver info instead of customer address
    if (showShippingAddress) {
      const result = basicInfoValid && isReceiverInfoValid()
      console.log('🔍 Shipping to different address - validation result:', result)
      return result
    }
    
    // If not shipping to different address, validate customer address
    const result = basicInfoValid && customerInfo.fullAddress.trim().length > 0
    console.log('🔍 Shipping to customer address - validation result:', result)
    return result
  }

  const isPaymentValid = () => {
    // Receipt upload is only required for Pay in Full option
    if (paymentOption === 'full') {
      return receiptFile !== null
    }
    // For Cash on Delivery, no receipt is needed
    return true
  }

  const isReceiverInfoValid = () => {
    if (!showShippingAddress) return true // Not required if not showing
    return (
      shippingInfo.fullName.trim().length > 0 &&
      shippingInfo.phone.trim().length > 0 &&
      shippingInfo.fullAddress.trim().length > 0
    )
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File size must be less than 5MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        console.error('Please upload a valid image (JPG, PNG) or PDF file')
        return
      }
      
      setReceiptFile(file)
      setReceiptFileName(file.name)
    }
  }

  const codAmount = total // Cash on delivery pays full amount
  const paymentAmount = paymentOption === 'full' ? total : codAmount
  const finalTotal = total

  const submitToSupabaseAPI = async (): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      
      // Generate unique order ID
      const uniqueOrderId = `DOPE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setOrderId(uniqueOrderId)

      // Prepare order data
      const orderData = {
        orderId: uniqueOrderId,
        customerInfo,
        receiverInfo: showShippingAddress ? shippingInfo : undefined,
        cart,
        total: finalTotal,
        paymentOption,
        receiptFile: receiptFile ? await fileToBase64(receiptFile) : undefined,
        receiptFileName: receiptFileName || undefined
      }

      console.log('📋 Submitting order to Supabase:', {
        orderId: uniqueOrderId,
        customerName: customerInfo.fullName,
        total: finalTotal,
        hasReceipt: !!receiptFile
      })

      // Use client-side service instead of API route
      const { checkoutClient } = await import('@/lib/checkout-client')
      const result = await checkoutClient.submitOrder(orderData)

      if (result.success) {
        console.log('✅ Order submitted successfully to Supabase:', result)
        return true
      } else {
        console.error('❌ Order submission failed:', result)
        return false
      }
    } catch (error) {
      console.error('Error submitting to Supabase:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmitOrder = async () => {
    console.log('Current step:', currentStep)
    
    if (currentStep === 'customer-info') {
      if (!isCustomerInfoValid()) {
        console.log('Customer info not valid')
        return
      }
      console.log('Advancing to payment selection step')
      setCurrentStep('payment-selection')
      return
    }
    
    if (currentStep === 'payment-selection') {
      // If Cash on Delivery is selected, skip payment step and submit order directly
      if (paymentOption === 'deposit') {
        console.log('Cash on Delivery selected, proceeding with order submission...')
        try {
          console.log('Starting Supabase checkout submission for COD...')
          const success = await submitToSupabaseAPI()
          
          if (success) {
            console.log('Supabase checkout submission successful!')
            setCurrentStep('confirmation')
            setOrderConfirmed(true)
            
                      console.log('✅ Order submitted successfully to Supabase!')
          console.log('📋 Order ID:', orderId)
          } else {
            console.error('Supabase checkout submission failed')
          }
        } catch (error) {
          console.error('Error submitting order:', error)
        }
        return
      }
      
      // If Pay in Full is selected, go to payment step
      console.log('Advancing to payment step')
      setCurrentStep('payment')
      return
    }
    
    if (currentStep === 'payment') {
      console.log('Proceeding with order submission...')

      try {
        console.log('Starting Supabase checkout submission...')
        const success = await submitToSupabaseAPI()
        
        if (success) {
          console.log('Supabase checkout submission successful!')
          setCurrentStep('confirmation')
          setOrderConfirmed(true)
          
          console.log('✅ Order submitted successfully to Supabase!')
          console.log('📋 Order ID:', orderId)
        } else {
          console.error('Supabase checkout submission failed')
        }
      } catch (error) {
        console.error('Error submitting order:', error)
      }
    }
  }

  const handleContinueShopping = () => {
    // Reset all checkout states
    setOrderConfirmed(false)
    setOrderId('')
    setCurrentStep('customer-info')
    setPaymentOption('full')
    setReceiptFile(null)
    setReceiptFileName('')
    setIsUploadingReceipt(false)
    setIsSubmitting(false)
    setCustomerInfo({
      fullName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      zipCode: '',
      fullAddress: '',
    })
    setTermsAccepted(false)
    
    // Reset cart and close modal
    onCartReset()
    onClose()
  }

  if (!shouldRender) return null

  // Order Confirmation Screen
  if (orderConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 backdrop-blur-sm bg-black/50 overflow-y-auto">
        <div className="bg-black rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 my-4">
          <div className="p-6 text-center">
            {/* Animated Checkmark */}
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-[#F7DD0F] rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-10 h-10 text-black animate-bounce" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-[#F7DD0F] rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-xl font-bold text-white mb-3">Order Confirmed!</h2>
            <p className="text-gray-300 mb-4 text-sm">
              Thank you for your order. We've received your request and will process it shortly.
            </p>

            {/* Order Details */}
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-white mb-2">Order Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">Order ID:</span> <span className="text-[#F7DD0F] font-mono">{orderId}</span></p>
                <p><span className="text-gray-400">Customer:</span> <span className="text-white">{customerInfo.fullName}</span></p>
                <p><span className="text-gray-400">Total:</span> <span className="text-[#F7DD0F] font-bold">Rs {finalTotal.toLocaleString()}</span></p>
                <p><span className="text-gray-400">Payment:</span> <span className="text-white">{paymentOption === 'full' ? 'Full Payment' : 'Cash on Delivery'}</span></p>
              </div>
            </div>

            {/* Continue Shopping Button */}
            <button
              onClick={handleContinueShopping}
              className="w-full bg-[#F7DD0F] text-black py-3 px-6 rounded-xl font-semibold hover:bg-[#F7DD0F]/90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 backdrop-blur-sm bg-black/50 overflow-y-auto">
      <div className={`bg-black rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-white/20 transition-all duration-300 my-4 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Checkout</h2>
            <p className="text-gray-400 text-sm">Complete your order</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[80vh] max-h-[800px]">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentStep === 'customer-info' ? (
              // Customer Information Screen
              <div className="space-y-6 md:space-y-8">
                {/* WhatsApp Contact - Above Customer Information */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">Order With WhatsApp</h3>
                      <p className="text-gray-300 text-sm">Quick order with WhatsApp</p>
                    </div>
                    <a
                      href="https://wa.me/9779808640750"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Customer Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="fullName" className="block text-base font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={customerInfo.fullName}
                        onChange={(e) => handleCustomerInfoChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-base font-medium text-gray-300 mb-2">
                        Email address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="phone" className="block text-base font-medium text-gray-300 mb-2">
                        Phone number (Nepal only) *
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <span className="text-base">🇳🇵</span>
                          <span className="text-gray-400">+977</span>
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          value={customerInfo.phone.replace(/^\+977/, '')}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className="w-full pl-32 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 text-base md:text-lg"
                          placeholder="98XXXXXXXX"
                          required
                        />
                        {!NEPAL_PHONE_REGEX.test(customerInfo.phone) && customerInfo.phone.length > 0 && (
                          <p className="mt-2 text-sm text-red-400">Enter a valid Nepal number starting with +977.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-base font-medium text-gray-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-base font-medium text-gray-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={customerInfo.state}
                        onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                        placeholder="Enter state"
                      />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-base font-medium text-gray-300 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={customerInfo.zipCode}
                        onChange={(e) => handleCustomerInfoChange('zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div className="mt-6 md:mt-8">
                    <label htmlFor="fullAddress" className="block text-base font-medium text-gray-300 mb-2">
                      Full Address *
                    </label>
                    <textarea
                      id="fullAddress"
                      value={customerInfo.fullAddress}
                      onChange={(e) => handleCustomerInfoChange('fullAddress', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 resize-none backdrop-blur-sm text-base md:text-lg"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mt-6 md:mt-8">
                    <label className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 text-[#F7DD0F] border-white/30 rounded focus:ring-[#F7DD0F] bg-white/5"
                      />
                      <span className="text-base text-gray-300">
                        I have read and agree to the Terms and Conditions.
                      </span>
                    </label>
                  </div>

                  {/* Ship to Different Address */}
                  <div className="mt-4">
                    <button 
                      onClick={() => setShowShippingAddress(!showShippingAddress)}
                      className="text-base text-[#F7DD0F] font-medium hover:text-[#F7DD0F]/80 cursor-pointer transition-colors border-b border-dotted border-[#F7DD0F] pb-1 flex items-center gap-2"
                    >
                      Ship to a different address?
                      <svg 
                        className={`w-4 h-4 transition-transform ${showShippingAddress ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showShippingAddress && (
                      <div className="mt-2 text-sm text-yellow-400">
                        ⚠️ Receiver details are required when shipping to a different address
                      </div>
                    )}
                    
                    {showShippingAddress && (
                      <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-fade-in-up">
                        <h4 className="text-white font-medium mb-3">Receiver Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-base font-medium text-gray-300 mb-2">
                              Receiver Name *
                            </label>
                            <input
                              type="text"
                              value={shippingInfo.fullName}
                              onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                              placeholder="Enter receiver name"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-base font-medium text-gray-300 mb-2">
                              Receiver Phone (Nepal only) *
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                <span className="text-base">🇳🇵</span>
                                <span className="text-gray-400">+977</span>
                              </div>
                              <input
                                type="tel"
                                value={shippingInfo.phone.replace(/^\+977/, '')}
                                onChange={(e) => {
                                  const digitsOnly = e.target.value.replace(/\D/g, '')
                                  let localPart = digitsOnly
                                  if (localPart.startsWith('977')) {
                                    localPart = localPart.slice(3)
                                  }
                                  localPart = localPart.slice(0, 10)
                                  const fullNumber = `+977${localPart}`
                                  setShippingInfo(prev => ({ ...prev, phone: fullNumber }))
                                }}
                                className="w-full pl-32 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                                placeholder="98XXXXXXXX"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-base font-medium text-gray-300 mb-2">
                              Receiver City
                            </label>
                            <input
                              type="text"
                              value={shippingInfo.city}
                              onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                              placeholder="Enter receiver city"
                            />
                          </div>
                          <div>
                            <label className="block text-base font-medium text-gray-300 mb-2">
                              Receiver State
                            </label>
                            <input
                              type="text"
                              value={shippingInfo.state}
                              onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                              placeholder="Enter receiver state"
                            />
                          </div>
                          <div>
                            <label className="block text-base font-medium text-gray-300 mb-2">
                              Receiver ZIP Code
                            </label>
                            <input
                              type="text"
                              value={shippingInfo.zipCode}
                              onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-base md:text-lg"
                              placeholder="Enter receiver ZIP code"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-base font-medium text-gray-300 mb-2">
                              Receiver Full Address *
                            </label>
                            <textarea
                              value={shippingInfo.fullAddress}
                              onChange={(e) => setShippingInfo(prev => ({ ...prev, fullAddress: e.target.value }))}
                              rows={4}
                              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 resize-none backdrop-blur-sm text-base md:text-lg"
                              placeholder="Enter complete receiver address"
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Validation message */}
                        {showShippingAddress && !isReceiverInfoValid() && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm">
                              ⚠️ Please fill in all required receiver fields (Name, Phone, and Address)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>


                </div>
              </div>
            ) : currentStep === 'payment-selection' ? (
              // Payment Selection Screen
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Choose Payment Option</h2>
                  <p className="text-gray-300 mb-6">Select how you'd like to pay for your order.</p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="full"
                        checked={paymentOption === 'full'}
                        onChange={(e) => setPaymentOption(e.target.value as 'full' | 'deposit')}
                        className="w-5 h-5 text-[#F7DD0F] border-white/30 rounded focus:ring-[#F7DD0F] bg-white/5"
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold">Pay in Full</div>
                        <div className="text-gray-300 text-sm">Pay the complete amount now</div>
                        <div className="text-[#F7DD0F] font-bold text-lg">Rs {finalTotal.toLocaleString()}</div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="deposit"
                        checked={paymentOption === 'deposit'}
                        onChange={(e) => setPaymentOption(e.target.value as 'full' | 'deposit')}
                        className="w-5 h-5 text-[#F7DD0F] border-white/30 rounded focus:ring-[#F7DD0F] bg-white/5"
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold">Cash on Delivery</div>
                        <div className="text-gray-300 text-sm">Pay the full amount when you receive your order</div>
                        <div className="text-[#F7DD0F] font-bold text-lg">Rs {codAmount.toLocaleString()}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // Payment Screen
              <div className="space-y-6 md:space-y-8">
                {/* QR Code Section */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Scan QR Code to Pay
                  </h3>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
                    <div className="w-56 h-80 mx-auto bg-white rounded-lg p-4 mb-4 relative">
                      {/* Payment QR Code */}
                      {qrLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      ) : activeQRCode ? (
                        <img 
                          src={activeQRCode.image_url} 
                          alt={activeQRCode.name}
                          className="w-full h-full object-contain"
                          onLoad={(e) => {
                            console.log('✅ Payment QR code loaded successfully');
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                            const fallback = target.parentElement?.querySelector('.qr-fallback');
                            if (fallback) {
                              fallback.classList.add('hidden');
                            }
                          }}
                          onError={(e) => {
                            console.error('❌ Payment QR code failed to load');
                            // Fallback if QR code image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.qr-fallback');
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center">
                          <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                          <span className="text-gray-500 text-sm font-medium">No QR Code Available</span>
                          <span className="text-gray-400 text-xs mt-1">Please upload a QR code in admin panel</span>
                        </div>
                      )}
                      {/* Fallback QR Code Display */}
                      <div className="qr-fallback w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center hidden">
                        <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                        <span className="text-gray-500 text-sm font-medium">Payment QR Code</span>
                        <span className="text-gray-400 text-xs mt-1">Amount: Rs {paymentAmount.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs mt-1">Contact: dopetechnp@gmail.com</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">Scan this QR code with your payment app</p>
                    <p className="text-[#F7DD0F] font-semibold">Amount: Rs {paymentAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Payment Receipt (Required)
                  </h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#F7DD0F] transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <div className="text-[#F7DD0F] mb-2">
                          <Upload className="w-8 h-8 mx-auto" />
                        </div>
                        <p className="text-white font-medium">Click to upload receipt (required)</p>
                        <p className="text-gray-400 text-sm">PNG, JPG, PDF up to 5MB</p>
                      </label>
                    </div>
                    
                    {receiptFileName && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-300" />
                        <p className="text-green-300 text-sm">✓ {receiptFileName}</p>
                        {isUploadingReceipt && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                            <span className="text-green-300 text-xs">Processing receipt...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:w-80 border-l border-white/10 bg-white/5">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Order Summary</h3>
                <button
                  onClick={() => setIsCartCollapsed(!isCartCollapsed)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 text-white transition-transform ${isCartCollapsed ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className={`lg:block ${isCartCollapsed ? 'hidden' : 'block'}`}>
                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#F7DD0F]">Rs {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">Rs {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Payment Option:</span>
                    <span className="text-white">{paymentOption === 'full' ? 'Full Payment' : 'Cash on Delivery'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-[#F7DD0F]">Rs {finalTotal.toLocaleString()}</span>
                  </div>
                  {paymentOption === 'deposit' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Pay on Delivery:</span>
                      <span className="text-[#F7DD0F] font-semibold">Rs {codAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button - Always visible on mobile */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || (currentStep === 'customer-info' && !isCustomerInfoValid()) || (currentStep === 'payment' && paymentOption === 'full' && !isPaymentValid())}
                  className="w-full bg-[#F7DD0F] text-black py-3 px-6 rounded-xl font-semibold hover:bg-[#F7DD0F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      Processing...
                    </>
                  ) : currentStep === 'customer-info' ? (
                    'Continue to Payment'
                  ) : currentStep === 'payment-selection' ? (
                    paymentOption === 'deposit' ? 'Confirm Order' : 'Continue to Payment'
                  ) : (
                    'Confirm Order'
                  )}
                </button>
                
                {(currentStep === 'payment' || currentStep === 'payment-selection') && (
                  <button
                    onClick={() => setCurrentStep('customer-info')}
                    className="w-full text-[#F7DD0F] hover:text-[#F7DD0F]/80 py-2 px-6 rounded-xl font-medium transition-colors underline"
                  >
                    Edit order details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
