import { supabase, supabaseAdmin } from './supabase';

// Product Image type definition
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  file_name?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Product type definition
export interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image_url: string; // Keep for backward compatibility - will be the primary image
  images?: ProductImage[]; // New field for multiple images
  category: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  color?: string; // Product color - optional field
  in_stock: boolean;
  discount: number;
  hidden_on_home?: boolean;
  created_at?: string; // Optional field for database products
}

// Sample fallback products data
const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Gaming Keyboard Pro",
    price: 129.99,
    original_price: 159.99,
    image_url: "/products/keyboard.png",
    category: "keyboard",
    rating: 4.8,
    reviews: 245,
    description: "Premium mechanical gaming keyboard with RGB lighting and programmable keys",
    features: ["Mechanical switches", "RGB lighting", "Programmable keys", "Wrist rest"],
    in_stock: true,
    discount: 19,
    hidden_on_home: false
  },
  {
    id: 2,
    name: "Wireless Gaming Mouse",
    price: 89.99,
    original_price: 119.99,
    image_url: "/products/key.png",
    category: "mouse",
    rating: 4.7,
    reviews: 189,
    description: "High-precision wireless gaming mouse with customizable DPI",
    features: ["Wireless", "Customizable DPI", "RGB lighting", "Ergonomic design"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  },
  {
    id: 3,
    name: "Premium Headphones",
    price: 199.99,
    original_price: 249.99,
    image_url: "/products/Screenshot 2025-08-02 215007.png",
    category: "audio",
    rating: 4.9,
    reviews: 312,
    description: "Studio-quality headphones with noise cancellation",
    features: ["Noise cancellation", "Bluetooth", "40-hour battery", "Premium audio"],
    in_stock: true,
    discount: 20,
    hidden_on_home: false
  },
  {
    id: 4,
    name: "Gaming Monitor",
    price: 299.99,
    original_price: 399.99,
    image_url: "/products/Screenshot 2025-08-02 215024.png",
    category: "monitor",
    rating: 4.6,
    reviews: 156,
    description: "27-inch 144Hz gaming monitor with 1ms response time",
    features: ["144Hz refresh rate", "1ms response", "FreeSync", "HDR support"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  },
  {
    id: 5,
    name: "Gaming Speaker System",
    price: 149.99,
    original_price: 199.99,
    image_url: "/products/Screenshot 2025-08-02 215110.png",
    category: "speaker",
    rating: 4.5,
    reviews: 98,
    description: "Immersive gaming speaker system with subwoofer",
    features: ["2.1 Channel", "Subwoofer", "RGB lighting", "Gaming optimized"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  }
];

// Cache for product data to avoid repeated database calls
const productCache = new Map<number, { product: Product; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch products from Supabase with local fallback
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('🔗 Connecting to Supabase...')
    
    // Add a timeout to prevent hanging - increased to 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Supabase connection took too long')), 15000) // 15 second timeout
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error; // Throw error to trigger fallback
    }

    console.log('✅ Supabase query successful')
    console.log('📦 Data received:', data?.length || 0, 'products')
    
    // If no data or empty array, use fallback
    if (!data || data.length === 0) {
      console.log('⚠️ No products in database, using fallback')
      return fallbackProducts;
    }
    
    return (data as unknown as Product[]) || [];
  } catch (error) {
    console.error('❌ Error fetching products from Supabase:', error);
    console.log('🔄 Falling back to local products data...')
    
    // Return fallback products instead of trying to import JSON
    console.log('✅ Using fallback products')
    console.log('📦 Fallback data:', fallbackProducts.length, 'products')
    return fallbackProducts;
  }
}

// Fetch a single product by ID
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Optimized function to fetch product with images in a single query
export async function getProductByIdWithImagesOptimized(id: number): Promise<Product | null> {
  try {
    // Check cache first
    const cached = productCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Using cached product data for ID:', id);
      return cached.product;
    }

    // Single optimized query to get product with images
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          product_id,
          image_url,
          file_name,
          display_order,
          is_primary,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product with images:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to match our Product interface
    const product: Product = {
      ...data,
      images: data.product_images?.map((img: any) => ({
        id: img.id,
        product_id: img.product_id,
        image_url: img.image_url,
        file_name: img.file_name,
        display_order: img.display_order || 0,
        is_primary: img.is_primary,
        created_at: img.created_at,
        updated_at: img.updated_at
      })) || []
    };

    // Cache the result
    productCache.set(id, { product, timestamp: Date.now() });
    
    return product;
  } catch (error) {
    console.error('Error fetching product with images:', error);
    return null;
  }
}

// Fetch a single product by ID with its images
export async function getProductByIdWithImages(id: number): Promise<Product | null> {
  // Use the optimized version
  return getProductByIdWithImagesOptimized(id);
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return (data as unknown as Product[]) || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

// Get random dope picks (maximum 6 products)
export async function getDopePicks(maxCount: number = 6): Promise<Product[]> {
  try {
    // Add timeout protection - increased to 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Supabase connection took too long')), 15000) // 15 second timeout
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No products in database for dope picks, using fallback')
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(maxCount, shuffled.length));
    }

    // Randomly shuffle the products and take up to maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  } catch (error) {
    console.error('❌ Error fetching dope picks:', error);
    // Use fallback products for dope picks
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  }
}

// Get random weekly picks (can duplicate to fill grid)
export async function getWeeklyPicks(maxCount: number = 4): Promise<Product[]> {
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No products in database for weekly picks, using fallback')
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      if (shuffled.length === 0) {
        return [];
      }
      
      // If we need more products than available, duplicate them
      if (maxCount > shuffled.length) {
        const result = [];
        for (let i = 0; i < maxCount; i++) {
          const product = shuffled[i % shuffled.length];
          // Create a unique copy with a modified ID to avoid conflicts
          result.push({
            ...product,
            id: product.id * 1000 + i // Make each copy unique
          });
        }
        return result;
      }
      
      return shuffled.slice(0, maxCount);
    }

    // Randomly shuffle the products and duplicate if needed to fill maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    if (shuffled.length === 0) {
      return [];
    }
    
    // If we need more products than available, duplicate them
    if (maxCount > shuffled.length) {
      const result = [];
      for (let i = 0; i < maxCount; i++) {
        const product = shuffled[i % shuffled.length];
        // Create a unique copy with a modified ID to avoid conflicts
        result.push({
          ...product,
          id: product.id * 1000 + i // Make each copy unique
        });
      }
      return result;
    }
    
    return shuffled.slice(0, maxCount);
  } catch (error) {
    console.error('❌ Error fetching weekly picks:', error);
    // Use fallback products for weekly picks
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    if (shuffled.length === 0) {
      return [];
    }
    
    // If we need more products than available, duplicate them
    if (maxCount > shuffled.length) {
      const result = [];
      for (let i = 0; i < maxCount; i++) {
        const product = shuffled[i % shuffled.length];
        // Create a unique copy with a modified ID to avoid conflicts
        result.push({
          ...product,
          id: product.id * 1000 + i // Make each copy unique
        });
      }
      return result;
    }
    
    return shuffled.slice(0, maxCount);
  }
}

// Product Images Functions
export async function getProductImages(productId: number): Promise<ProductImage[]> {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      return [];
    }

    // Normalize the data to handle column name inconsistencies
    const normalizedData = (data as any[] || []).map(img => ({
      id: img.id,
      product_id: img.product_id,
      image_url: img.image_url,
      file_name: img.file_name,
      display_order: img.display_order || img.image_order || img.sort_order || 0,
      is_primary: img.is_primary,
      created_at: img.created_at,
      updated_at: img.updated_at
    }));

    return normalizedData as ProductImage[];
  } catch (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
}

export async function addProductImage(productId: number, imageUrl: string, fileName?: string, isPrimary: boolean = false): Promise<ProductImage | null> {
  try {
    // Get the current max display_order for this product
    const { data: maxOrderData, error: maxOrderError } = await supabaseAdmin
      .from('product_images')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData.length > 0 
      ? (maxOrderData[0].display_order || 0) + 1 
      : 1;

    const { data, error } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        file_name: fileName,
        display_order: nextOrder,
        is_primary: isPrimary
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product image:', error);
      return null;
    }

    // Normalize the response data
    const normalizedData = {
      id: data.id,
      product_id: data.product_id,
      image_url: data.image_url,
      file_name: data.file_name,
      display_order: data.display_order || data.image_order || data.sort_order || nextOrder,
      is_primary: data.is_primary,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return normalizedData as ProductImage;
  } catch (error) {
    console.error('Error adding product image:', error);
    return null;
  }
}

export async function deleteProductImage(imageId: number): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting product image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    return false;
  }
}

export async function setPrimaryImage(imageId: number): Promise<boolean> {
  try {
    // First, get the product_id for this image
    const { data: imageData, error: fetchError } = await supabaseAdmin
      .from('product_images')
      .select('product_id')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      console.error('Error fetching image:', fetchError);
      return false;
    }

    // Set all images for this product to not primary
    const { error: updateError } = await supabaseAdmin
      .from('product_images')
      .update({ 
        is_primary: false,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', (imageData as any).product_id);

    if (updateError) {
      console.error('Error updating images:', updateError);
      return false;
    }

    // Set the specified image as primary
    const { error: setError } = await supabaseAdmin
      .from('product_images')
      .update({ 
        is_primary: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId);

    if (setError) {
      console.error('Error setting primary image:', setError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting primary image:', error);
    return false;
  }
}

export async function reorderProductImages(productId: number, imageIds: number[]): Promise<boolean> {
  try {
    // Update the order of images
    for (let i = 0; i < imageIds.length; i++) {
      const { error } = await supabaseAdmin
        .from('product_images')
        .update({ 
          display_order: i + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageIds[i]);

      if (error) {
        console.error('Error reordering images:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error reordering images:', error);
    return false;
  }
}

// Enhanced getProducts function that includes images
export async function getProductsWithImages(): Promise<Product[]> {
  try {
    const products = await getProducts();
    
    // Fetch images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images: images
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('Error fetching products with images:', error);
    return [];
  }
}

// Get products by categories for Dope Arrivals (4 products per category)
export async function getDopeArrivalsByCategories(): Promise<{ [category: string]: Product[] }> {
  try {
    console.log('🔗 Fetching Dope Arrivals from Supabase...')
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: false }); // Order by ID descending to get newest first

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Dope Arrivals query successful')
    console.log('📦 Products received:', data?.length || 0)
    
    // If no data, use fallback
    const products = data || fallbackProducts;
    
    // Group products by category and limit to 4 per category
    const groupedProducts: { [category: string]: Product[] } = {};
    
    products.forEach((product: Product) => {
      const category = product.category;
      if (!groupedProducts[category]) {
        groupedProducts[category] = [];
      }
      
      // Only add if we haven't reached the limit of 4 per category
      if (groupedProducts[category].length < 4) {
        groupedProducts[category].push(product);
      }
    });
    
    console.log('📋 Categories found:', Object.keys(groupedProducts));
    
    return groupedProducts;
  } catch (error) {
    console.error('❌ Error fetching Dope Arrivals:', error);
    
    // Fallback: Group fallback products by category
    const groupedFallback: { [category: string]: Product[] } = {};
    fallbackProducts.forEach((product: Product) => {
      const category = product.category;
      if (!groupedFallback[category]) {
        groupedFallback[category] = [];
      }
      if (groupedFallback[category].length < 4) {
        groupedFallback[category].push(product);
      }
    });
    
    return groupedFallback;
  }
}

// Get random product for daily advertisement (same product for entire day)
export async function getDailyAdProduct(): Promise<Product | null> {
  try {
    console.log('🔗 Fetching daily ad product from Supabase...')
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Daily ad products query successful')
    
    // If no data, use fallback
    const products = data || fallbackProducts;
    
    if (products.length === 0) {
      return null;
    }
    
    // Use current date as seed for consistent daily selection
    const today = new Date();
    const dateString = today.getFullYear().toString() + 
                      (today.getMonth() + 1).toString().padStart(2, '0') + 
                      today.getDate().toString().padStart(2, '0');
    
    // Simple hash function using date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Get random index based on hash
    const randomIndex = Math.abs(hash) % products.length;
    
    console.log(`📅 Daily ad product selected: ${products[randomIndex].name} (index: ${randomIndex})`);
    
    return products[randomIndex] as Product;
  } catch (error) {
    console.error('❌ Error fetching daily ad product:', error);
    
    // Fallback: return a random product from fallback data
    if (fallbackProducts.length > 0) {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      const randomIndex = dayOfYear % fallbackProducts.length;
      return fallbackProducts[randomIndex];
    }
    
    return null;
  }
}

// Get the latest 5 added products (ordered by ID descending) - keeping for backward compatibility
export async function getLatestProducts(maxCount: number = 5): Promise<Product[]> {
  try {
    console.log('🔗 Fetching latest products from Supabase...')
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    })
    
    const supabasePromise = supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: false }) // Order by ID descending to get newest first
      .limit(maxCount);

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Latest products query successful')
    console.log('📦 Latest products received:', data?.length || 0)
    
    // If no data, return empty array
    if (!data || data.length === 0) {
      console.log('⚠️ No latest products found')
      return [];
    }
    
    return (data as unknown as Product[]) || [];
  } catch (error) {
    console.error('❌ Error fetching latest products:', error);
    // Return latest from fallback products (last 5 by ID)
    return fallbackProducts.slice(-maxCount).reverse();
  }
}

// Utility function to get the primary image URL from a product
export function getPrimaryImageUrl(product: Product): string {
  // If product has images array and it's not empty, use the primary image
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.is_primary)
    if (primaryImage && primaryImage.image_url) {
      return primaryImage.image_url
    }
    // If no primary image is set, use the first image
    if (product.images[0].image_url) {
      return product.images[0].image_url
    }
  }
  
  // Fallback to the original image_url field
  if (product.image_url) {
    return product.image_url
  }
  
  // Final fallback to a placeholder image
  return '/placeholder-product.svg'
}

// Utility function to get all images for a product
export function getProductImageUrls(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images.map(img => img.image_url)
  }
  
  // Fallback to the original image_url field
  return product.image_url ? [product.image_url] : []
}

// CRUD functions for products
export async function addProduct(productData: Omit<Product, 'id' | 'rating' | 'reviews'> & { features?: string[], color?: string }): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price || productData.price, // Use provided original_price or fallback to current price
        image_url: productData.image_url,
        category: productData.category,
        rating: 0, // Default rating
        reviews: 0, // Default reviews
        features: productData.features || [], // Use provided features or default empty array
        color: productData.color || null, // Use provided color or null
        in_stock: productData.in_stock,
        discount: productData.discount,
        hidden_on_home: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
}

export async function updateProduct(productId: number, productData: Partial<Omit<Product, 'id' | 'rating' | 'reviews'>> & { features?: string[], color?: string }): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        image_url: productData.image_url,
        category: productData.category,
        features: productData.features,
        color: productData.color,
        in_stock: productData.in_stock,
        discount: productData.discount
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return data as unknown as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(productId: number): Promise<boolean> {
  try {
    console.log(`Starting deletion of product ${productId}...`);

    // Step 1: Check if there are any order items for this product
    const { data: orderItems, error: checkError } = await supabaseAdmin
      .from('order_items')
      .select('id, order_id')
      .eq('product_id', productId);

    if (checkError) {
      console.error('Error checking order items:', checkError);
      return false;
    }

    // Step 2: If there are order items, delete them first
    if (orderItems && orderItems.length > 0) {
      console.log(`Found ${orderItems.length} order items to delete for product ${productId}`);
      
      const { error: orderItemsError } = await supabaseAdmin
        .from('order_items')
        .delete()
        .eq('product_id', productId);

      if (orderItemsError) {
        console.error('Error deleting order items:', orderItemsError);
        return false;
      }
      
      console.log('Successfully deleted order items');
    } else {
      console.log('No order items found for this product');
    }

    // Step 3: Delete all product images
    const { error: imagesError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (imagesError) {
      console.error('Error deleting product images:', imagesError);
      // Continue anyway, might not have images
    } else {
      console.log('Successfully deleted product images');
    }

    // Step 4: Finally delete the product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    console.log(`Successfully deleted product ${productId}`);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}