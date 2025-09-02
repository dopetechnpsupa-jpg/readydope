"use client"

import { useEffect } from 'react'
import { generateOrganizationStructuredData, generateLocalBusinessStructuredData } from '@/lib/seo-utils'

interface StructuredDataProps {
  type: 'organization' | 'local-business' | 'product' | 'breadcrumb' | 'faq'
  data?: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    let structuredData: any

    switch (type) {
      case 'organization':
        structuredData = generateOrganizationStructuredData()
        break
      case 'local-business':
        structuredData = generateLocalBusinessStructuredData()
        break
      case 'product':
        structuredData = data
        break
      case 'breadcrumb':
        structuredData = data
        break
      case 'faq':
        structuredData = data
        break
      default:
        return
    }

    // Create script element
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    
    // Add to head
    document.head.appendChild(script)

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [type, data])

  return null
}
