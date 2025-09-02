// SEO utility functions for DopeTech Nepal

/**
 * Generate a SEO-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a product URL with slug
 */
export function generateProductUrl(product: { id: number; name: string; category: string }): string {
  const slug = generateSlug(product.name)
  return `/product/${product.id}-${slug}`
}

/**
 * Generate structured data for products
 */
export function generateProductStructuredData(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image_url || product.images?.[0]?.image_url,
    "brand": {
      "@type": "Brand",
      "name": "DopeTech Nepal"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "NPR",
      "availability": product.in_stock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "DopeTech Nepal"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.5,
      "reviewCount": product.reviews || 0
    }
  }
}

/**
 * Generate structured data for the organization
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DopeTech Nepal",
    "url": "https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app",
    "logo": "https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/logo/dopelogo.svg",
    "description": "Premium tech gear and gaming peripherals in Nepal",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NP",
      "addressLocality": "Kathmandu",
      "addressRegion": "Bagmati"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "dopetechnp@gmail.com"
    },
    "sameAs": [
      "https://instagram.com/dopetech_np"
    ]
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app${crumb.url}`
    }))
  }
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generate local business structured data
 */
export function generateLocalBusinessStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DopeTech Nepal",
    "description": "Premium tech gear and gaming peripherals store in Nepal",
    "url": "https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app",
    "telephone": "+977-XXXXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kathmandu",
      "addressLocality": "Kathmandu",
      "addressRegion": "Bagmati",
      "postalCode": "44600",
      "addressCountry": "NP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 27.7172,
      "longitude": 85.3240
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$",
    "currenciesAccepted": "NPR",
    "paymentAccepted": "Cash, Credit Card, Digital Payment"
  }
}

/**
 * Generate sitemap data for products
 */
export function generateSitemapData(products: any[]) {
  const baseUrl = 'https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app'
  
  const urls = [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/support`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/terms`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.5
    },
    ...products.map(product => ({
      loc: `${baseUrl}${generateProductUrl(product)}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9
    }))
  ]
  
  return urls
}
