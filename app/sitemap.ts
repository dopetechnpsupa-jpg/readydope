import { getProducts } from '@/lib/products-data'
import { generateSitemapData } from '@/lib/seo-utils'

export default async function sitemap() {
  try {
    const products = await getProducts()
    const sitemapData = generateSitemapData(products)
    
    return sitemapData
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback sitemap
    return [
      {
        url: 'https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: 'https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/support',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: 'https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/terms',
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]
  }
}
