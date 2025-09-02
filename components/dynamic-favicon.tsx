'use client'

import { useEffect } from 'react'
import { useLogoUrl } from '@/hooks/use-assets'

export function DynamicFavicon() {
  const { logoUrl, loading } = useLogoUrl()

  useEffect(() => {
    if (!loading && logoUrl) {
      // Create favicon link elements
      const createFaviconLink = (rel: string, href: string, sizes?: string) => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = href
        if (sizes) link.sizes = sizes
        return link
      }

      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]')
      existingFavicons.forEach(link => link.remove())

      // Add new favicon links using the Supabase logo URL
      const faviconLinks = [
        createFaviconLink('icon', logoUrl, 'any'),
        createFaviconLink('icon', logoUrl, '16x16'),
        createFaviconLink('icon', logoUrl, '32x32'),
        createFaviconLink('icon', logoUrl, '48x48'),
        createFaviconLink('icon', logoUrl, '192x192'),
        createFaviconLink('shortcut icon', logoUrl),
        createFaviconLink('apple-touch-icon', logoUrl),
        createFaviconLink('mask-icon', logoUrl),
      ]

      // Add all favicon links to the head
      faviconLinks.forEach(link => {
        document.head.appendChild(link)
      })

      console.log('🎨 Dynamic favicon updated with:', logoUrl)
    }
  }, [logoUrl, loading])

  return null // This component doesn't render anything
}
