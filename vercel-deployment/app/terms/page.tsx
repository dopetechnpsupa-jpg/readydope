import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions - DopeTech Nepal',
  description: 'Terms and conditions for using DopeTech Nepal services and products.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7DD0F]/20 to-[#F7DD0F]/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#F7DD0F] mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              DopeTech Nepal
            </p>
            <div className="mt-6 text-sm text-gray-300">
              <p>Effective Date: August 19, 2025</p>
              <p>Last Updated: August 8, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 border-2 border-[#F7DD0F]/30">
            
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-white leading-relaxed">
                Welcome to DopeTech Nepal. By accessing or using our website and services, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before placing an order.
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              
              {/* Section 1: General */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">1. General</h2>
                <ul className="text-white space-y-3">
                  <li>• These Terms & Conditions govern the use of our website, products, and services.</li>
                  <li>• By purchasing from DopeTech Nepal, you acknowledge that you have read, understood, and agreed to these terms.</li>
                  <li>• DopeTech Nepal reserves the right to update these terms at any time without prior notice.</li>
                </ul>
              </section>

              {/* Section 2: Ownership */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">2. Ownership</h2>
                <ul className="text-white space-y-3">
                  <li>• All content, source code, images, designs, logos, and other assets displayed on this website are the property of DopeTech Nepal.</li>
                  <li>• Unauthorized copying, redistribution, or commercial use of our intellectual property is strictly prohibited.</li>
                </ul>
              </section>

              {/* Section 3: Orders & Acceptance */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">3. Orders & Acceptance</h2>
                <ul className="text-white space-y-3">
                  <li>• An order is considered confirmed only after payment has been successfully processed (if prepaid) or order confirmation is provided.</li>
                  <li>• DopeTech Nepal reserves the right to cancel or refuse any order at its sole discretion (e.g., due to incorrect pricing, unavailability, or suspicious activity).</li>
                </ul>
              </section>

              {/* Section 4: Pricing & Payment */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">4. Pricing & Payment</h2>
                <ul className="text-white space-y-3">
                  <li>• All prices are displayed in Nepali Rupees (NPR) unless otherwise stated.</li>
                  <li>• Delivery charges are calculated after the order is placed and communicated to the customer before final confirmation.</li>
                  <li>• Payments must be made through approved methods listed at checkout.</li>
                </ul>
              </section>

              {/* Section 5: Delivery */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">5. Delivery</h2>
                <ul className="text-white space-y-3">
                  <li>• Standard delivery time is 1–3 business days within Nepal.</li>
                  <li>• Delivery timelines may vary due to unforeseen circumstances (e.g., strikes, weather, courier delays).</li>
                  <li>• DopeTech Nepal is not liable for delays beyond our control but will make every effort to ensure timely delivery.</li>
                </ul>
              </section>

              {/* Section 6: Refunds & Returns */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">6. Refunds & Returns</h2>
                <ul className="text-white space-y-3">
                  <li>• Refunds are applicable only if the product is defective, damaged, or incorrect.</li>
                  <li>• Customers must notify us within 3 days of delivery to request a return or refund.</li>
                  <li>• Refunds are processed within 7–10 business days once approved.</li>
                  <li>• Certain items such as digital goods, customized products, or consumables may not be eligible for refunds.</li>
                </ul>
              </section>

              {/* Section 7: Customer Responsibilities */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">7. Customer Responsibilities</h2>
                <ul className="text-white space-y-3">
                  <li>• Customers must provide accurate and complete information when placing an order.</li>
                  <li>• Customers are responsible for ensuring availability to receive delivery.</li>
                  <li>• Any false, incomplete, or misleading information may result in cancellation.</li>
                </ul>
              </section>

              {/* Section 8: Limitation of Liability */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">8. Limitation of Liability</h2>
                <ul className="text-white space-y-3">
                  <li>• DopeTech Nepal will not be held liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</li>
                  <li>• Our liability is strictly limited to the value of the product purchased.</li>
                </ul>
              </section>

              {/* Section 9: Trademarks & Intellectual Property */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">9. Trademarks & Intellectual Property</h2>
                <ul className="text-white space-y-3">
                  <li>• The DopeTech Nepal name, logo, and related trademarks are protected and cannot be used without prior written permission.</li>
                  <li>• Any misuse of our brand or assets may lead to legal action.</li>
                </ul>
              </section>

              {/* Section 10: Governing Law */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">10. Governing Law</h2>
                <ul className="text-white space-y-3">
                  <li>• These Terms & Conditions are governed by the laws of Nepal.</li>
                  <li>• Any disputes will be resolved under the jurisdiction of the courts in Kathmandu, Nepal.</li>
                </ul>
              </section>

              {/* Section 11: Contact Us */}
              <section className="border-l-4 border-[#F7DD0F] pl-6">
                <h2 className="text-2xl font-bold text-[#F7DD0F] mb-4">11. Contact Us</h2>
                <p className="text-white mb-4">
                  For any questions or concerns regarding these Terms & Conditions, please reach out to us:
                </p>
                <div className="bg-[#F7DD0F]/10 rounded-lg p-6 border border-[#F7DD0F]/20">
                  <div className="space-y-2 text-white">
                    <p className="font-semibold text-[#F7DD0F]">DopeTech Nepal</p>
                    <p>Email: <a href="mailto:dopetechnepal@gmail.com" className="text-[#F7DD0F] hover:text-[#F7DD0F]/80 transition-colors">dopetechnepal@gmail.com</a></p>
                    <p>Phone: +977-9808640750</p>
                    <p>Address: Lalitpur, Nepal 44700</p>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer Note */}
            <div className="mt-12 pt-8 border-t border-[#F7DD0F]/30">
              <p className="text-center text-gray-300 text-sm">
                By using our services, you acknowledge that you have read and agree to these Terms & Conditions.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
