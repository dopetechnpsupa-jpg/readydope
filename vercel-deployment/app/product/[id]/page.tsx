import { getProductById, getProducts } from "@/lib/products-data"
import ProductPageClient from "./product-page-client"

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

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const productId = parseInt(resolvedParams.id)
  
  try {
    const product = await getProductById(productId)
    
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

    // Get related products from the same category
    const allProducts = await getProducts()
    const relatedProducts = allProducts
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, 6)

    return <ProductPageClient product={product} relatedProducts={relatedProducts} />
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
