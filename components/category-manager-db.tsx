"use client"

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Grid,
  Keyboard,
  Mouse,
  Headphones,
  Speaker,
  Monitor,
  Cable,
  Gamepad2,
  Laptop,
  Smartphone,
  Camera,
  Mic,
  Webcam,
  Package,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  Category, 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  syncCategoriesWithDatabase,
  initializeCategories
} from '@/lib/categories-data'

interface CategoryManagerProps {
  onCategoriesChange?: (categories: Category[]) => void
}

// Available icons mapping
const AVAILABLE_ICONS = {
  Grid,
  Keyboard,
  Mouse,
  Headphones,
  Speaker,
  Monitor,
  Cable,
  Gamepad2,
  Laptop,
  Smartphone,
  Camera,
  Mic,
  Webcam,
  Package
}

export function CategoryManagerDB({ onCategoriesChange }: CategoryManagerProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    id: '',
    name: '',
    icon: 'Grid'
  })

  // Load categories from database on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const dbCategories = await getCategories()
      
      if (dbCategories.length === 0) {
        // Initialize with default categories if database is empty
        await initializeCategories()
        const initializedCategories = await getCategories()
        setCategories(initializedCategories)
      } else {
        setCategories(dbCategories)
      }
      
      // Sync with localStorage for backward compatibility
      await syncCategoriesWithDatabase()
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories from database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.id || !newCategory.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check if ID already exists
    if (categories.find(cat => cat.id === newCategory.id)) {
      toast({
        title: "Error",
        description: "Category ID already exists",
        variant: "destructive",
      })
      return
    }

    try {
      const categoryToAdd = {
        id: newCategory.id,
        name: newCategory.name,
        icon: newCategory.icon || 'Grid',
        order_index: categories.length
      }

      const addedCategory = await addCategory(categoryToAdd)
      
      if (addedCategory) {
        const updatedCategories = [...categories, addedCategory]
        setCategories(updatedCategories)
        await syncCategoriesWithDatabase()
        onCategoriesChange?.(updatedCategories)
        
        toast({
          title: "Success",
          description: "Category added successfully",
        })
        
        // Reset form
        setNewCategory({ id: '', name: '', icon: 'Grid' })
        setIsAdding(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to add category to database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id)
    setNewCategory({
      id: category.id,
      name: category.name,
      icon: category.icon
    })
  }

  const handleSaveEdit = async () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Please fill in the category name",
        variant: "destructive",
      })
      return
    }

    try {
      const updates = {
        name: newCategory.name,
        icon: newCategory.icon || 'Grid'
      }

      const updatedCategory = await updateCategory(editingId!, updates)
      
      if (updatedCategory) {
        const updatedCategories = categories.map(cat => 
          cat.id === editingId ? updatedCategory : cat
        )
        setCategories(updatedCategories)
        await syncCategoriesWithDatabase()
        onCategoriesChange?.(updatedCategories)
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        
        // Reset form
        setNewCategory({ id: '', name: '', icon: 'Grid' })
        setEditingId(null)
      } else {
        toast({
          title: "Error",
          description: "Failed to update category in database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (categoryId === 'all') {
      toast({
        title: "Error",
        description: "Cannot delete 'All Products' category",
        variant: "destructive",
      })
      return
    }

    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const success = await deleteCategory(categoryId)
      
      if (success) {
        const updatedCategories = categories.filter(cat => cat.id !== categoryId)
        setCategories(updatedCategories)
        await syncCategoriesWithDatabase()
        onCategoriesChange?.(updatedCategories)
        
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete category from database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setNewCategory({ id: '', name: '', icon: 'Grid' })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSyncWithDatabase = async () => {
    try {
      setIsSyncing(true)
      await syncCategoriesWithDatabase()
      await loadCategories()
      toast({
        title: "Success",
        description: "Categories synced with database",
      })
    } catch (error) {
      console.error('Error syncing categories:', error)
      toast({
        title: "Error",
        description: "Failed to sync categories",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS] || Grid
    return <IconComponent className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-[#F7DD0F] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading categories from database...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Category Management (Database)</h3>
          <p className="text-sm text-gray-400">Manage product categories with database sync</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSyncWithDatabase}
            disabled={isSyncing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isSyncing 
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
          {!isAdding && editingId === null && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            {isAdding ? 'Add New Category' : 'Edit Category'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category ID {isAdding && '*'}
              </label>
              <input
                type="text"
                value={newCategory.id || ''}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                disabled={!!editingId} // Disable editing ID
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F] disabled:opacity-50"
                placeholder="e.g., gaming, wireless, premium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategory.name || ''}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7DD0F]"
                placeholder="e.g., Gaming Gear, Wireless Devices"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Object.entries(AVAILABLE_ICONS).map(([iconName, IconComponent]) => (
                  <button
                    key={iconName}
                    onClick={() => setNewCategory({ ...newCategory, icon: iconName })}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      newCategory.icon === iconName
                        ? 'bg-[#F7DD0F] text-black border-[#F7DD0F]'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={isAdding ? handleAddCategory : handleSaveEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-[#F7DD0F] hover:bg-[#F7DD0F]/90 text-black rounded-lg transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>{isAdding ? 'Add Category' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Current Categories</h4>
        
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No categories found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#F7DD0F]/20 rounded-lg flex items-center justify-center">
                    {renderIcon(category.icon)}
                  </div>
                  <div>
                    <h5 className="font-medium text-white">{category.name}</h5>
                    <p className="text-sm text-gray-400">ID: {category.id}</p>
                    {category.updated_at && (
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(category.updated_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors duration-200 text-blue-400 hover:text-blue-300"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.id === 'all'}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      category.id === 'all'
                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300'
                    }`}
                    title={category.id === 'all' ? 'Cannot delete default category' : 'Delete category'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">Database Integration</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Categories are stored in the Supabase database</li>
          <li>• Changes are automatically synced with localStorage</li>
          <li>• The "All Products" category cannot be deleted</li>
          <li>• Use the Sync button to refresh from database</li>
        </ul>
      </div>
    </div>
  )
}
