import { getProductByIdWithImages, getProductsByCategory, getPrimaryImageUrl, getProducts } from "@/lib/products-data"
import ProductPageClient from "./product-page-client"
import { Metadata } from "next"

// Generate static params for all product IDs
export async function generateStaticParams() {
  try {
    const products = await getProducts()
    return products.map((product) => ({
      id: product.id.toString(),
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Fallback to known product IDs if fetch fails
    return [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ]
  }
}

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate metadata for product pages
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const productId = parseInt(resolvedParams.id)
  
  try {
    const product = await getProductByIdWithImages(productId)
    
    if (!product) {
      return {
        title: 'Product Not Found - DopeTech Nepal',
        description: 'The requested product could not be found. Browse our collection of premium tech gear.',
        robots: {
          index: false,
          follow: true,
        }
      }
    }

    const price = product.price.toLocaleString()
    const originalPrice = product.original_price > product.price ? product.original_price.toLocaleString() : null
    const discount = product.discount > 0 ? `${product.discount}% OFF` : null
    
    const title = `${product.name} - Rs ${price} | DopeTech Nepal`
    const description = `${product.description} ${product.features?.length ? `Features: ${product.features.slice(0, 3).join(', ')}.` : ''} ${discount ? `Special offer: ${discount}` : ''} Free shipping across Nepal.`
    
    const imageUrl = getPrimaryImageUrl(product)
    
    return {
      title,
      description,
      keywords: [
        product.name,
        product.category,
        'tech gear',
        'Nepal',
        'DopeTech',
        ...(product.features || []),
        'free shipping',
        'premium quality'
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/product/${product.id}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        siteName: 'DopeTech Nepal',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@dopetech_np',
      },
      alternates: {
        canonical: `https://dopetechnp-aflazuh1u-dopetechnps-projects.vercel.app/product/${product.id}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'NPR',
        'product:availability': product.in_stock ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:retailer_item_id': product.id.toString(),
        'product:brand': 'DopeTech Nepal',
        'product:category': product.category,
        'og:type': 'website',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Product - DopeTech Nepal',
      description: 'Browse our collection of premium tech gear.',
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const productId = parseInt(resolvedParams.id)
  
  try {
    const product = await getProductByIdWithImages(productId)
    
    if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <a href="/" className="bg-[#F7DD0F] text-black px-4 py-2 rounded-lg hover:bg-[#F7DD0F]/90">
              Go back home
            </a>
          </div>
        </div>
      )
    }

    // Optimized: Get related products from the same category only
    const relatedProducts = await getProductsByCategory(product.category)
    const filteredRelatedProducts = relatedProducts
      .filter(p => p.id !== productId)
      .slice(0, 6)

    return <ProductPageClient product={product} relatedProducts={filteredRelatedProducts} />
  } catch (error) {
    console.error('Error fetching product:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading product</h1>
          <a href="/" className="bg-[#F7DD0F] text-black px-4 py-2 rounded-lg hover:bg-[#F7DD0F]/90">
            Go back home
          </a>
        </div>
      </div>
    )
  }
}
