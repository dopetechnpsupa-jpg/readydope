'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Product } from '@/lib/products-data'

interface ProductOptionsSelectorProps {
  product: Product
  onOptionsChange: (color: string | undefined, features: string[]) => void
  initialColor?: string
  initialFeatures?: string[]
}

export function ProductOptionsSelector({ 
  product, 
  onOptionsChange, 
  initialColor, 
  initialFeatures = [] 
}: ProductOptionsSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialColor)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialFeatures)

  // Available colors - split by comma if multiple colors are provided
  const availableColors = (() => {
    if (!product.color) return []
    if (typeof product.color === 'string') {
      return product.color.split(',').map(color => color.trim()).filter(color => color.length > 0)
    }
    return []
  })()
  
  // Available features from the product - handle various "empty" cases
  const availableFeatures = (() => {
    if (!product.features) return []
    if (Array.isArray(product.features)) {
      return product.features.filter(feature => feature && feature.trim().length > 0)
    }
    if (typeof product.features === 'string') {
      return product.features.trim().length > 0 ? [product.features] : []
    }
    return []
  })()
  
  // Debug logging
  console.log('🔍 ProductOptionsSelector Debug:', {
    productId: product.id,
    productName: product.name,
    productColor: product.color,
    productFeatures: product.features,
    availableColors,
    availableFeatures,
    shouldShow: availableColors.length > 0 || availableFeatures.length > 0
  })

  useEffect(() => {
    onOptionsChange(selectedColor, selectedFeatures)
  }, [selectedColor, selectedFeatures, onOptionsChange])

  const handleColorSelect = (color: string) => {
    setSelectedColor(selectedColor === color ? undefined : color)
  }

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const clearSelections = () => {
    setSelectedColor(undefined)
    setSelectedFeatures([])
  }

  if (availableColors.length === 0 && availableFeatures.length === 0) {
    return null
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-[#F7DD0F]/20 space-y-4">
      <h3 className="text-sm sm:text-base font-semibold text-white mb-3">Customize Your Product</h3>
      
      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Color</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  selectedColor === color
                    ? 'bg-[#F7DD0F] text-black border-[#F7DD0F] shadow-lg'
                    : 'bg-black/30 text-white border-[#F7DD0F]/30 hover:bg-[#F7DD0F]/10 hover:border-[#F7DD0F]/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{color}</span>
                  {selectedColor === color && <Check className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Features Selection */}
      {availableFeatures.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Features</label>
          <div className="flex flex-wrap gap-2">
            {availableFeatures.map((feature) => (
              <button
                key={feature}
                onClick={() => handleFeatureToggle(feature)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  selectedFeatures.includes(feature)
                    ? 'bg-[#F7DD0F] text-black border-[#F7DD0F] shadow-lg'
                    : 'bg-black/30 text-white border-[#F7DD0F]/30 hover:bg-[#F7DD0F]/10 hover:border-[#F7DD0F]/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{feature}</span>
                  {selectedFeatures.includes(feature) && <Check className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Selections */}
      {(selectedColor || selectedFeatures.length > 0) && (
        <div className="pt-2">
          <Button
            onClick={clearSelections}
            variant="outline"
            size="sm"
            className="text-gray-400 hover:text-white border-[#F7DD0F]/30 hover:border-[#F7DD0F]/50 hover:bg-[#F7DD0F]/10"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Selections
          </Button>
        </div>
      )}

      {/* Summary */}
      {(selectedColor || selectedFeatures.length > 0) && (
        <div className="pt-3 border-t border-[#F7DD0F]/20">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Options:</h4>
          <div className="space-y-1">
            {selectedColor && (
              <p className="text-sm text-[#F7DD0F]">• Color: {selectedColor}</p>
            )}
            {selectedFeatures.length > 0 && (
              <p className="text-sm text-[#F7DD0F]">• Features: {selectedFeatures.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
