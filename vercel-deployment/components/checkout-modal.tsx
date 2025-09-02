"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, CheckCircle, AlertCircle, CreditCard, MessageCircle, Truck, Package, Lock, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogoUrl } from "@/hooks/use-assets"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  total: number
}

export default function CheckoutModal({ isOpen, onClose, cart, total }: CheckoutModalProps) {
  // Allow exit animations by keeping component mounted briefly after close
  const [shouldRender, setShouldRender] = useState(isOpen)
  const { logoUrl, loading: logoLoading } = useLogoUrl()
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState<'customer-info' | 'payment-selection' | 'payment' | 'receipt'>('customer-info')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery')
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: '',
    mobileNumber: ''
  })
  const [discountCode, setDiscountCode] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [summaryCollapsed, setSummaryCollapsed] = useState(false)
  const [discountExpanded, setDiscountExpanded] = useState(false)
  const discountInputRef = useRef<HTMLInputElement>(null)
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'deposit' | 'full' | null>(null)
  const [confirmedReceiptData, setConfirmedReceiptData] = useState<string | null>(null)
  // Manage mount/unmount for entrance/exit animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      setOrderId(null) // Reset orderId for a new checkout session
      return
    }
    setIsClosing(true)
    const timeout = setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
    }, 220)
    return () => clearTimeout(timeout)
  }, [isOpen])


  // Enforce Nepal phone numbers
  const NEPAL_PHONE_REGEX = /^\+977\d{8,10}$/

  // Note: Do not early-return before hooks; guard moved below after hook declarations

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadReceipt = async () => {
    if (!receiptFile) return

    setIsUploading(true)
    setUploadStatus('idle')

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically upload to your server
      // For now, we'll just simulate success
      setUploadStatus('success')
      
    } catch (error) {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirmOrder = () => {
    try {
      const newOrderId = `DTP-${Math.floor(100000 + Math.random()*900000)}` // Generate new ID here
      setOrderId(newOrderId) // Set the new ID to state for display
      const amountDue = selectedPaymentOption === 'deposit' ? Math.max(1, Math.round(finalTotal * 0.10)) : finalTotal
      const order = {
        orderId: newOrderId, // Use the new ID for the saved order
        timestamp: new Date().toISOString(),
        deliveryOption,
        customer: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          fullAddress: customerInfo.fullAddress,
          city: customerInfo.city,
          state: customerInfo.state,
          zipCode: customerInfo.zipCode,
        },
        items: cart,
        totals: {
          subtotal: total,
          shipping: deliveryOption === 'delivery' ? 5 : 0,
          discountCode,
          discountAmount,
          finalTotal,
        },
        payment: {
          option: selectedPaymentOption,
          amount: amountDue,
        },
        receiptImage: receiptPreview,
      }

      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('ordersV1')
        const list = raw ? JSON.parse(raw) : []
        list.push(order)
        localStorage.setItem('ordersV1', JSON.stringify(list))
        window.dispatchEvent(new Event('orderPlaced'))
      }

      setConfirmedReceiptData(receiptPreview)
      setActiveTab('receipt')
    } catch {}
  }

  const handleRemoveFile = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneChange = (rawValue: string) => {
    // Keep only digits; always store with +977 prefix
    const digitsOnly = rawValue.replace(/\D/g, '')
    let localPart = digitsOnly
    if (localPart.startsWith('977')) {
      localPart = localPart.slice(3)
    }
    // Limit to at most 10 digits for Nepal numbers
    localPart = localPart.slice(0, 10)
    const fullNumber = `+977${localPart}`
    handleCustomerInfoChange('phone', fullNumber)
  }

  const isCustomerInfoValid = () => {
    if (deliveryOption === 'pickup') {
      return (
        customerInfo.fullName.trim().length > 0 &&
        NEPAL_PHONE_REGEX.test(customerInfo.phone)
      )
    }
    return (
      customerInfo.fullName.trim().length > 0 &&
      customerInfo.email.trim().length > 0 &&
      NEPAL_PHONE_REGEX.test(customerInfo.phone) &&
      customerInfo.fullAddress.trim().length > 0 &&
      termsAccepted
    )
  }

  const shippingCost = deliveryOption === 'delivery' ? 5 : 0
  const discountAmount = discountCode ? 10 : 0
  const finalTotal = total + shippingCost - discountAmount
  const depositAmount = Math.max(1, Math.round(finalTotal * 0.10))

  useEffect(() => {
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768)
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!isMobile) return
    // Mobile behavior: collapse when form is NOT valid; expand when valid
    setSummaryCollapsed(!isCustomerInfoValid())
  }, [isMobile, customerInfo, termsAccepted, deliveryOption])

  // Ensure modal content scrolls to top when changing to payment step
  useEffect(() => {
    if (activeTab === 'payment' && typeof window !== 'undefined') {
      try {
        document.querySelectorAll('.overflow-y-auto').forEach((el) => {
          (el as HTMLElement).scrollTop = 0
        })
        contentRef.current?.scrollTo?.({ top: 0 })
      } catch {}
    }
  }, [activeTab])

  if (!shouldRender) return null

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "backdrop-blur-sm transition-opacity duration-200",
        isClosing ? "opacity-0" : "opacity-100",
        "bg-black/50",
      ].join(" ")}
    >
      <div
        className={[
          "bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-8xl max-h-[98vh] overflow-hidden border border-white/20 gradient-bg",
          "transform-gpu transition-all duration-200",
          isClosing ? "opacity-0 translate-y-2 scale-[0.98]" : "opacity-100 translate-y-0 scale-100",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/20 bg-white/10 backdrop-blur-sm animate-slide-in-down">
          <div className="flex items-center space-x-3 md:space-x-4">
                            <img src={logoLoading ? "/logo/dopelogo.svg" : logoUrl} alt="DopeTech" className="h-6 md:h-8 w-auto" />
            <span className="text-base md:text-lg font-semibold text-[#F7DD0F]">
              {activeTab === 'payment-selection' ? 'Payment Options' : 
               activeTab === 'payment' ? 'Payment' : 
               activeTab === 'receipt' ? 'Order confirmed' : 
               'Checkout'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white active:scale-95 premium-transition"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        {activeTab !== 'payment' && (
        <div ref={contentRef} className="flex flex-col lg:flex-row h-[calc(98vh-80px)]">
          {/* Left Column - Customer Information */}
          <div className="flex-1 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/20 overflow-y-auto animate-fade-in-up">
            
            <div className="space-y-6 md:space-y-8">
              {/* Delivery Options */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Shipping Information</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 md:mb-8">
                  <button
                    onClick={() => setDeliveryOption('delivery')}
                    className={`flex items-center justify-center sm:justify-start space-x-3 px-6 py-4 rounded-lg border-2 transition-colors transform-gpu active:scale-95 premium-transition backdrop-blur-sm ${
                      deliveryOption === 'delivery'
                        ? 'border-[#F7DD0F] bg-[#F7DD0F]/20 text-[#F7DD0F]'
                        : 'border-white/30 bg-white/5 text-gray-300 hover:border-white/50 hover:text-white'
                    }`}
                  >
                    <Truck className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="font-medium text-base md:text-lg">Delivery</span>
                  </button>
                  <button
                    onClick={() => setDeliveryOption('pickup')}
                    className={`flex items-center justify-center sm:justify-start space-x-3 px-6 py-4 rounded-lg border-2 transition-colors transform-gpu active:scale-95 premium-transition backdrop-blur-sm ${
                      deliveryOption === 'pickup'
                        ? 'border-[#F7DD0F] bg-[#F7DD0F]/20 text-[#F7DD0F]'
                        : 'border-white/30 bg-white/5 text-gray-300 hover:border-white/50 hover:text-white'
                    }`}
                  >
                    <Package className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="font-medium text-base md:text-lg">Pick up</span>
                  </button>
                </div>

                {/* Form Fields */}
                {deliveryOption === 'pickup' ? (
                  <div className="space-y-6">
                    <div className="animate-fade-in-up stagger-2">
                      <label htmlFor="fullName" className="block text-base font-medium text-gray-300 mb-2">
                        Full name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={customerInfo.fullName}
                        onChange={(e) => handleCustomerInfoChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 text-base md:text-lg"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="animate-fade-in-up stagger-3">
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

                    {/* Pickup location map */}
                    <div className="animate-fade-in-up stagger-2">
                      <label className="block text-base font-medium text-gray-300 mb-2">Pickup Location</label>
                      <div className="rounded-lg overflow-hidden border border-white/20 bg-white/5">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.4446636169555!2d85.32491979999999!3d27.6726484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19c56e004b3f%3A0xdc3ef252c2febe01!2sMangal%20Bazar!5e0!3m2!1sen!2snp!4v1754813035988!5m2!1sen!2snp"
                          width="100%"
                          height="320"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-400">Pickup at Patan Mangalbazar. Please call upon arrival.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in-up">
                      <div className="md:col-span-2">
                        <label htmlFor="fullName" className="block text-base font-medium text-gray-300 mb-2">
                          Full name *
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

                      {/* Country field removed: Nepal-only checkout */}

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
                    <div className="mt-6 md:mt-8 animate-fade-in-up stagger-3">
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
                    <div className="mt-6 md:mt-8 animate-fade-in-up stagger-4">
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-96 p-4 md:p-6 bg-white/5 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-white/20 overflow-y-auto animate-slide-in-down">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-white">Review your cart</h2>
              {isMobile && (
                <button
                  className="inline-flex items-center text-sm text-[#F7DD0F] premium-transition active:scale-95"
                  onClick={() => setSummaryCollapsed(!summaryCollapsed)}
                >
                  {summaryCollapsed ? (
                    <><span className="mr-1">Expand</span><ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <><span className="mr-1">Collapse</span><ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>

            {/* Discount CTA (collapsed state) */}
            {!discountExpanded && (
              <div className="mb-3 md:mb-4">
                <button
                  type="button"
                  className="text-left w-full text-[#F7DD0F] hover:underline premium-transition active:scale-95"
                  aria-expanded={discountExpanded}
                  onClick={() => {
                    setDiscountExpanded(true)
                    if (isMobile) setSummaryCollapsed(false)
                    setTimeout(() => discountInputRef.current?.focus(), 10)
                  }}
                >
                  Have a dope discount code?
                </button>
              </div>
            )}

            {/* Condensed mobile summary */}
            {isMobile && summaryCollapsed ? (
              <div className="space-y-3 mb-4 md:mb-6 p-3 md:p-4 bg-white/5 rounded-lg border border-white/10 animate-fade-in-up">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Subtotal</span>
                  <span className="font-medium text-white text-sm">Rs {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Shipping</span>
                  <span className="font-medium text-white text-sm">Rs {shippingCost.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm">Discount</span>
                    <span className="font-medium text-red-400 text-sm">-Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                 <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-white">Total</span>
                    <span className="text-base font-bold text-[#F7DD0F]">Rs {finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Products */}
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm md:text-base truncate">{item.name}</h3>
                        <p className="text-sm text-gray-300">{item.quantity}x</p>
                      </div>
                      <span className="font-semibold text-[#F7DD0F] text-sm md:text-base">Rs {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Discount Code (expanded) */}
                {discountExpanded && (
                  <div className="mb-4 md:mb-6 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex-1 relative">
                        <input
                          ref={discountInputRef}
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#F7DD0F] focus:border-transparent bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm text-sm md:text-base transition-all duration-200"
                          placeholder="Discount code"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏷️</span>
                      </div>
                      <Button className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black px-4 py-2 rounded-lg font-medium text-sm md:text-base premium-transition active:scale-95">
                        Apply
                      </Button>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="space-y-3 mb-4 md:mb-6 p-3 md:p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm animate-fade-in-up">
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm md:text-base">Subtotal</span>
                    <span className="font-medium text-white text-sm md:text-base">Rs {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 text-sm md:text-base">Shipping</span>
                    <span className="font-medium text-white text-sm md:text-base">Rs {shippingCost.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300 text-sm md:text-base">Discount</span>
                      <span className="font-medium text-red-400 text-sm md:text-base">-Rs {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base md:text-lg font-semibold text-white">Total</span>
                      <span className="text-base md:text-lg font-bold text-[#F7DD0F]">Rs {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Pay Now Button */}
            <Button 
              className="w-full bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black py-3 rounded-lg font-semibold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed animate-scale-in premium-transition active:scale-95"
              disabled={!isCustomerInfoValid()}
              onClick={() => setActiveTab('payment-selection')}
            >
              Continue to Payment
            </Button>

            {/* Security Message */}
            <div className="mt-4 text-center p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm animate-fade-in-up">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-[#F7DD0F]" />
                <span className="text-sm font-medium text-white">Secure Checkout - SSL Encrypted</span>
              </div>
              <p className="text-xs text-gray-300">
                Ensuring your financial and personal details are secure during every transaction.
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Payment Selection Step */}
        {activeTab === 'payment-selection' && (
          <div className="p-6 md:p-8 border-t border-white/10 bg-white/5 animate-fade-in-up h-[calc(98vh-80px)] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-white">Choose Payment Option</h2>
                <p className="text-gray-300">Select how you'd like to pay for your order.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <button
                  className={`p-5 rounded-xl border-2 backdrop-blur-sm premium-transition active:scale-95 text-left ${selectedPaymentOption === 'deposit' ? 'border-[#F7DD0F] bg-[#F7DD0F]/10' : 'border-white/20 bg-white/5 hover:border-white/40'}`}
                  onClick={() => setSelectedPaymentOption('deposit')}
                >
                  <div className="text-white font-semibold text-lg md:text-xl">Pay 10% now</div>
                  <div className="text-[#F7DD0F] font-bold text-xl md:text-2xl mt-2">Rs {Math.max(1, Math.round(finalTotal*0.10)).toLocaleString()}</div>
                  <div className="text-gray-400 text-sm mt-1">Pay the rest on delivery</div>
                </button>

                <button
                  className={`p-5 rounded-xl border-2 backdrop-blur-sm premium-transition active:scale-95 text-left ${selectedPaymentOption === 'full' ? 'border-[#F7DD0F] bg-[#F7DD0F]/10' : 'border-white/20 bg-white/5 hover:border-white/40'}`}
                  onClick={() => setSelectedPaymentOption('full')}
                >
                  <div className="text-white font-semibold text-lg md:text-xl">Pay in full</div>
                  <div className="text-[#F7DD0F] font-bold text-xl md:text-2xl mt-2">Rs {finalTotal.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm mt-1">Complete your order now</div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="text-gray-300 hover:text-white premium-transition"
                  onClick={() => setActiveTab('customer-info')}
                >
                  ← Back to checkout
                </button>
                <Button
                  className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black px-5 py-2.5 rounded-lg font-semibold premium-transition active:scale-95"
                  disabled={!selectedPaymentOption}
                  onClick={() => setActiveTab('payment')}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {activeTab === 'payment' && (
          <div className="p-6 md:p-8 border-t border-white/10 bg-white/5 animate-fade-in-up h-[calc(98vh-80px)] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-white">Complete Payment</h2>
                <p className="text-gray-300">Scan the QR code to pay for your order.</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6">
                <h3 className="text-white font-semibold text-lg md:text-xl mb-3">Scan to pay</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
                  <div className="bg-black/40 rounded-xl p-2 md:p-3 border border-white/10 flex items-center justify-center">
                    <img 
                      src="/payment/paymentQR.svg" 
                      alt="Payment QR" 
                      className="w-full h-auto max-w-[200px] md:max-w-[280px] max-h-[400px] md:max-h-[500px]"
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
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback text
                        const fallback = target.parentElement?.querySelector('.qr-fallback');
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="qr-fallback hidden w-full h-full bg-gray-200 rounded flex flex-col items-center justify-center">
                      <span className="text-gray-500 text-sm mb-2">Payment QR Code</span>
                      <span className="text-gray-400 text-xs">Contact: dopetechnp@gmail.com</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm mb-2">Amount</div>
                    <div className="text-2xl font-bold text-white">Rs {(selectedPaymentOption === 'deposit' ? Math.max(1, Math.round(finalTotal*0.10)) : finalTotal).toLocaleString()}</div>
                    <p className="text-gray-400 mt-3 text-sm">After paying, please upload your receipt in the next step to confirm your order.</p>
                    
                  </div>
                </div>
              </div>

              {/* Upload receipt */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6 animate-fade-in-up">
                <h3 className="text-white font-semibold text-lg md:text-xl mb-3">Upload payment receipt (Required)</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {!receiptPreview ? (
                  <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-gray-300 text-sm">Attach a screenshot or photo of your payment (Required)</div>
                    <button
                      type="button"
                      className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black px-4 py-2 rounded-lg font-semibold premium-transition active:scale-95"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-xl p-3 border border-white/10 flex items-center justify-center">
                      <img src={receiptPreview} alt="Receipt preview" className="max-h-48 md:max-h-56 w-auto rounded-md" />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="text-gray-300 hover:text-white premium-transition"
                        onClick={handleRemoveFile}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm button always visible */}
                <div className="flex items-center justify-end mt-4">
                  <Button
                    className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black px-5 py-2.5 rounded-lg font-semibold premium-transition active:scale-95"
                    onClick={handleUploadReceipt}
                    disabled={!receiptPreview || !selectedPaymentOption || isUploading}
                  >
                    {isUploading ? 'Confirming…' : 'Confirm'}
                  </Button>
                </div>

                {!selectedPaymentOption && (
                  <div className="text-gray-400 text-xs mt-2">Select a payment option above to enable Confirm.</div>
                )}

                {!receiptPreview && selectedPaymentOption && (
                  <div className="text-red-400 text-xs mt-2">Payment receipt is required to complete your order.</div>
                )}

                {isUploading && (
                  <div className="flex items-center text-gray-300 text-sm mt-2">
                    <div className="w-4 h-4 border-2 border-[#F7DD0F] border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading receipt…
                  </div>
                )}
                {uploadStatus === 'success' && (
                  <div className="flex items-center text-green-400 text-sm mt-2">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    Receipt received. Thank you!
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="flex items-center text-red-400 text-sm mt-2">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
                    Upload failed. Please try again.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    className="text-gray-300 hover:text-white premium-transition"
                    onClick={() => setActiveTab('payment-selection')}
                  >
                    ← Back to payment options
                  </button>
                  <button
                    className="text-[#F7DD0F] hover:text-[#F7DD0F]/80 premium-transition underline"
                    onClick={() => setActiveTab('customer-info')}
                  >
                    Edit order details
                  </button>
                </div>
                {uploadStatus === 'success' && (
                  <Button
                    className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black px-5 py-2.5 rounded-lg font-semibold premium-transition active:scale-95"
                    onClick={handleConfirmOrder}
                  >
                    Confirm Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'receipt' && (
          <div className="p-6 md:p-8 border-t border-white/10 bg-white/5 animate-fade-in-up h-[calc(98vh-80px)] overflow-y-auto">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-400/40">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Order confirmed</h2>
              <p className="text-gray-300">Thank you! We’ve received your payment receipt. Your order is being processed.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="text-gray-400 text-sm">Order ID</div>
                  <div className="text-white font-semibold">{orderId || 'Generating...'}</div>
                </div>
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-[#F7DD0F] font-bold">Rs {(selectedPaymentOption === 'deposit' ? Math.max(1, Math.round(finalTotal*0.10)) : finalTotal).toLocaleString()}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <p>We’ll contact you shortly via phone to confirm delivery or pickup details.</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg" onClick={onClose}>Back to shop</Button>
                <Button className="bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black px-5 py-2.5 rounded-lg" onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

