"use client"

import { useEffect } from "react"
import Head from "next/head"
import { useLogoUrl } from "@/hooks/use-assets"

interface SEOOptimizerProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: "website" | "product" | "article"
  structuredData?: object
}

export default function SEOOptimizer({
  title = "DopeTech Nepal - Premium Tech Gear",
  description = "Premium tech gear from DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, and more. Your setup, perfected.",
  keywords = "tech gear, mechanical keyboard, gaming mouse, wireless headphones, Nepal, DopeTech, gaming peripherals, RGB keyboard, wireless mouse",
  url = "https://dopetech-nepal.com",
  type = "website",
  structuredData
}: SEOOptimizerProps) {
  const { logoUrl, loading: logoLoading } = useLogoUrl()
  const image = logoLoading ? "/logo/dopelogo.svg" : logoUrl
  useEffect(() => {
    // Update page title dynamically
    if (title) {
      document.title = title
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description)
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords)
    }

    // Add structured data
    if (structuredData) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)

      return () => {
        if (script && script.parentNode && script.parentNode.contains(script)) {
          try {
            document.head.removeChild(script)
          } catch (error) {
            console.warn('Script element already removed:', error)
          }
        }
      }
    }
  }, [title, description, keywords, structuredData])

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="DopeTech Nepal" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@dopetech_np" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="DopeTech Nepal" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical resources */}
      <link rel="preload" href={image} as="image" />
      
      {/* Favicon */}
              <link rel="icon" href={image} />
        <link rel="apple-touch-icon" href={image} />
    </Head>
  )
}

// Default structured data for the homepage
export const defaultStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DopeTech Nepal",
  "url": "https://dopetech-nepal.com",
        "logo": "https://dopetech-nepal.com/logo/dopelogo.svg",
  "description": "Premium tech gear from DopeTech Nepal. Mechanical keyboards, gaming mice, wireless headphones, and more.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "NP",
    "addressLocality": "Nepal"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "English"
  },
  "sameAs": [
    "https://instagram.com/dopetech_np"
  ]
}

// Product structured data
export function getProductStructuredData(product: {
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "NPR",
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    }
  }
} 