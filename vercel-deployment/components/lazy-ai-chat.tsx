"use client"

import dynamic from 'next/dynamic'

// Lazy load the AI chat assistant
const AIChatAssistant = dynamic(() => import('./ai-chat-assistant'), {
  loading: () => <div className="fixed bottom-4 right-4 w-12 h-12 bg-[#F7DD0F] rounded-full animate-pulse" />,
  ssr: false
})

interface LazyAIChatProps {
  products: any[]
  onAddToCart: (product: any) => void
}

export default function LazyAIChat({ products, onAddToCart }: LazyAIChatProps) {
  return <AIChatAssistant products={products} onAddToCart={onAddToCart} />
} 