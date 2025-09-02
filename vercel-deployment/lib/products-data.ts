import { supabase } from './supabase';

// Product type definition
export interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image_url: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  in_stock: boolean;
  discount: number;
  hidden_on_home?: boolean;
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

// Get random weekly picks (maximum 4 products)
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
      return shuffled.slice(0, Math.min(maxCount, shuffled.length));
    }

    // Randomly shuffle the products and take up to maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  } catch (error) {
    console.error('❌ Error fetching weekly picks:', error);
    // Use fallback products for weekly picks
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(maxCount, shuffled.length));
  }
}

 