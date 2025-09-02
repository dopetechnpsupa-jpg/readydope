import { supabase } from './supabase'

export interface Category {
  id: string
  name: string
  icon: string
  order_index?: number
  created_at?: string
  updated_at?: string
}

// Get all categories from database
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Add a new category
export async function addCategory(category: Omit<Category, 'created_at' | 'updated_at'>): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()

    if (error) {
      console.error('Error adding category:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error adding category:', error)
    return null
  }
}

// Update an existing category
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating category:', error)
    return null
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting category:', error)
    return false
  }
}

// Sync localStorage with database
export async function syncCategoriesWithDatabase(): Promise<void> {
  try {
    // Get categories from database
    const dbCategories = await getCategories()
    
    // Update localStorage with database data
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminCategories', JSON.stringify(dbCategories))
      // Dispatch event to notify components
      window.dispatchEvent(new Event('categoriesUpdated'))
    }
  } catch (error) {
    console.error('Error syncing categories:', error)
  }
}

// Initialize categories (create default ones if table is empty)
export async function initializeCategories(): Promise<void> {
  try {
    const existingCategories = await getCategories()
    
    if (existingCategories.length === 0) {
      // Insert default categories
      const defaultCategories = [
        { id: 'all', name: 'All Products', icon: 'Grid', order_index: 0 },
        { id: 'keyboard', name: 'Keyboards', icon: 'Keyboard', order_index: 1 },
        { id: 'mouse', name: 'Mouse', icon: 'Mouse', order_index: 2 },
        { id: 'audio', name: 'Audio', icon: 'Headphones', order_index: 3 },
        { id: 'speaker', name: 'Speakers', icon: 'Speaker', order_index: 4 },
        { id: 'monitor', name: 'Monitors', icon: 'Monitor', order_index: 5 },
        { id: 'accessory', name: 'Accessories', icon: 'Cable', order_index: 6 },
      ]

      for (const category of defaultCategories) {
        await addCategory(category)
      }
    }
  } catch (error) {
    console.error('Error initializing categories:', error)
  }
}
