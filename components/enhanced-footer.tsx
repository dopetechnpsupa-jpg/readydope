"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube,
  Linkedin,
  ArrowUp,
  Heart,
  Shield,
  Truck,
  Clock,
  CreditCard
} from 'lucide-react'
import { useLogoUrl } from '@/hooks/use-assets'

export function EnhancedFooter() {
  const { logoUrl } = useLogoUrl()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  const footerLinks = {
    products: [
      { name: 'Keyboards', href: '#keyboards' },
      { name: 'Mice', href: '#mice' },
      { name: 'Headphones', href: '#headphones' },
      { name: 'Speakers', href: '#speakers' },
      { name: 'Cameras', href: '#cameras' },
      { name: 'Cables', href: '#cables' },
    ],
    support: [
      { name: 'Support', href: '/support' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Shipping Info', href: '#shipping' },
      { name: 'Returns', href: '#returns' },
      { name: 'Size Guide', href: '#size-guide' },
      { name: 'Track Order', href: '#track' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Story', href: '#story' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Blog', href: '#blog' },
      { name: 'Privacy Policy', href: '#privacy' },
    ],
  }

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-600' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
  ]

  const features = [
    { icon: Shield, title: 'Secure Payment', description: '100% secure payment' },
    { icon: Truck, title: 'Fast Delivery', description: 'Free shipping on orders' },
    { icon: Clock, title: '24/7 Support', description: 'Round the clock support' },
    { icon: CreditCard, title: 'Easy Returns', description: '30 day return policy' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section - Hidden on mobile */}
      <section className="hidden sm:block bg-gray-800 py-3 sm:py-6 md:py-8">
        <div className="container-responsive">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center space-y-1 sm:space-y-2 md:space-y-3"
              >
                <div className="p-1.5 sm:p-2 md:p-3 bg-primary/10 rounded-full">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Footer Content - Ultra minimal on mobile */}
      <div className="container-responsive py-0 sm:py-0.5 md:py-1 lg:py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3">
          
          {/* Company Info - Ultra minimal on mobile */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-0 sm:space-y-0.5 md:space-y-1"
            >
              {/* Logo - Ultra small on mobile */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 -mt-1 sm:mt-0">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="DopeTech Nepal" 
                    className="h-2.5 w-auto sm:h-3 md:h-4 lg:h-5 sm:w-auto"
                  />
                ) : (
                  <div className="h-2.5 w-10 sm:h-3 sm:w-12 md:h-4 md:w-16 lg:h-5 lg:w-20 bg-primary rounded-lg animate-pulse" />
                )}
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold">DopeTech</span>
              </div>
              
              {/* Description - Hidden on mobile */}
              <p className="hidden sm:block text-gray-400 text-xs sm:text-sm leading-relaxed -mt-1 sm:mt-0">
                Premium tech gear from Nepal. Your setup, perfected with the finest mechanical keyboards, 
                gaming mice, and audio equipment.
              </p>
              
              {/* Contact Info - Ultra minimal on mobile */}
              <div className="space-y-0 sm:space-y-0.5 md:space-y-1 -mt-1 sm:mt-0">
                <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5 text-xs sm:text-sm text-gray-400">
                  <Phone className="w-1.5 h-1.5 sm:w-2 md:w-2.5 sm:h-2 md:h-2.5 text-primary" />
                  <span className="text-xs sm:text-sm">+977 1234567890</span>
                </div>
                <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5 text-xs sm:text-sm text-gray-400">
                  <Mail className="w-1.5 h-1.5 sm:w-2 md:w-2.5 sm:h-2 md:h-2.5 text-primary" />
                  <span className="text-xs sm:text-sm">info@dopetech.com</span>
                </div>
                <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5 text-xs sm:text-sm text-gray-400">
                  <MapPin className="w-1.5 h-1.5 sm:w-2 md:w-2.5 sm:h-2 md:h-2.5 text-primary" />
                  <span className="text-xs sm:text-sm">Kathmandu, Nepal</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Products Links - Ultra minimal on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-0 sm:space-y-0.5 md:space-y-1"
          >
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white -mt-1 sm:mt-0">Products</h3>
            <ul className="space-y-0 sm:space-y-0.5 md:space-y-1 -mt-1 sm:mt-0">
              {footerLinks.products.slice(0, 2).map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links - Ultra minimal on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-0 sm:space-y-0.5 md:space-y-1"
          >
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white -mt-1 sm:mt-0">Support</h3>
            <ul className="space-y-0 sm:space-y-0.5 md:space-y-1 -mt-1 sm:mt-0">
              {footerLinks.support.slice(0, 2).map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links - Ultra minimal on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-0 sm:space-y-0.5 md:space-y-1"
          >
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white -mt-1 sm:mt-0">Company</h3>
            <ul className="space-y-0 sm:space-y-0.5 md:space-y-1 -mt-1 sm:mt-0">
              {footerLinks.company.slice(0, 2).map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden sm:block mt-0.5 sm:mt-1 md:mt-2 lg:mt-3 pt-0.5 sm:pt-1 md:pt-2 lg:pt-3 border-t border-gray-800"
        >
          <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Stay Updated</h3>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
              Subscribe to our newsletter for the latest products, exclusive offers, and tech tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary whitespace-nowrap text-sm sm:text-base"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Social Links - Ultra minimal on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-0 sm:mt-0.5 md:mt-1 lg:mt-2 pt-0 sm:pt-0.5 md:pt-1 lg:pt-2 border-t border-gray-800"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
            <div className="flex space-x-0.5 sm:space-x-1 md:space-x-1.5 lg:space-x-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-0 sm:p-0.5 sm:p-1 md:p-1.5 lg:p-2 bg-gray-800 rounded-lg text-gray-400 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3" />
                </motion.a>
              ))}
            </div>
            
            {/* Back to Top Button - Ultra minimal on mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="flex items-center space-x-0 sm:space-x-0.5 md:space-x-1 lg:space-x-1.5 px-0.5 sm:px-1 md:px-1.5 lg:px-2 py-0 sm:py-0.5 md:py-1 lg:py-1.5 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              <ArrowUp className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3" />
              <span className="text-xs sm:text-sm font-medium">Back to Top</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar - Ultra minimal on mobile */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-responsive py-0 sm:py-0.5 md:py-1 lg:py-1.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-0 sm:gap-0.5 md:gap-1 lg:gap-1.5 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center space-x-0 sm:space-x-0.5 md:space-x-1 lg:space-x-1.5">
              <span className="text-xs sm:text-sm">&copy; {currentYear} DopeTech Nepal. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Made with</span>
              <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 text-red-500 hidden sm:inline" />
              <span className="hidden sm:inline">in Nepal</span>
            </div>
            
            <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5 lg:space-x-2 text-xs">
              <a href="/terms" className="hover:text-primary transition-colors duration-200">
                Terms & Conditions
              </a>
              <span>•</span>
              <a href="#cookies" className="hover:text-primary transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

