import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support - DopeTech Nepal',
  description: 'Get support and assistance from DopeTech Nepal. Contact us for any questions or concerns.',
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7DD0F]/20 to-[#F7DD0F]/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#F7DD0F] mb-4">
              Support
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              We're here to help you
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 border-2 border-[#F7DD0F]/30">
            
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-white leading-relaxed text-lg">
                At Dopetech Nepal, we are committed to providing quick and reliable support for all your inquiries. If you have any questions, concerns, or need assistance with your order, feel free to reach out to us through the following channels:
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              
              {/* Email */}
              <div className="flex items-center space-x-4 p-6 bg-[#F7DD0F]/10 rounded-lg border border-[#F7DD0F]/20">
                <div className="text-3xl">📧</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F7DD0F] mb-1">Email</h3>
                  <a 
                    href="mailto:dopetechnepal@gmail.com" 
                    className="text-white hover:text-[#F7DD0F] transition-colors text-lg"
                  >
                    dopetechnepal@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4 p-6 bg-[#F7DD0F]/10 rounded-lg border border-[#F7DD0F]/20">
                <div className="text-3xl">📞</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F7DD0F] mb-1">Phone</h3>
                  <a 
                    href="tel:+9779808640750" 
                    className="text-white hover:text-[#F7DD0F] transition-colors text-lg"
                  >
                    +977 9808640750
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4 p-6 bg-[#F7DD0F]/10 rounded-lg border border-[#F7DD0F]/20">
                <div className="text-3xl">📍</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F7DD0F] mb-1">Address</h3>
                  <p className="text-white text-lg">
                    Lalitpur, Nepal 44700
                  </p>
                </div>
              </div>

            </div>

            {/* Closing Message */}
            <div className="mt-12 pt-8 border-t border-[#F7DD0F]/30">
              <div className="text-center space-y-4">
                <p className="text-white text-lg">
                  Our support team will get back to you as soon as possible.
                </p>
                <p className="text-[#F7DD0F] font-semibold text-lg">
                  Thank you for choosing Dopetech Nepal.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
