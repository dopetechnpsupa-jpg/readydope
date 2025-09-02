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
      {/* Features Section */}
      <section className="bg-gray-800 py-6 sm:py-8">
        <div className="container-responsive">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center space-y-2 sm:space-y-3"
              >
                <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
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

      {/* Main Footer Content */}
      <div className="container-responsive py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Logo */}
              <div className="flex items-center space-x-2">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="DopeTech Nepal" 
                    className="h-6 w-auto sm:h-8 sm:w-auto"
                  />
                ) : (
                  <div className="h-6 w-24 sm:h-8 sm:w-32 bg-primary rounded-lg animate-pulse" />
                )}
                <span className="text-lg sm:text-xl font-bold">DopeTech</span>
              </div>
              
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Premium tech gear from Nepal. Your setup, perfected with the finest mechanical keyboards, 
                gaming mice, and audio equipment.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-400">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>+977 1234567890</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-400">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>info@dopetech.com</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-400">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>Kathmandu, Nepal</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Products Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 sm:space-y-4"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white">Products</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.products.map((link) => (
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

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 sm:space-y-4"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.support.map((link) => (
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

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 sm:space-y-4"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.company.map((link) => (
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

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-800"
        >
          <div className="text-center space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Stay Updated</h3>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
              Subscribe to our newsletter for the latest products, exclusive offers, and tech tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base"
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

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-1.5 sm:p-2 bg-gray-800 rounded-lg text-gray-400 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
            
            {/* Back to Top Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Back to Top</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-responsive py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span>&copy; {currentYear} DopeTech Nepal. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Made with</span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 hidden sm:inline" />
              <span className="hidden sm:inline">in Nepal</span>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
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

