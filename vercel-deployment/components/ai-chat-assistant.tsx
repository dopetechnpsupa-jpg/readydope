"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, Bot, User, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type: "text" | "product" | "recommendation"
  product?: Product
}

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  category: string
  rating: number
  reviews: number
  description: string
  features: string[]
  inStock: boolean
  discount: number
}

interface AIChatAssistantProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export default function AIChatAssistant({ products, onAddToCart }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Howdy! I'm your DopeTech AI assistant, ready to hook you up with the sickest tech gear! I can help you find the perfect products, answer questions, and give you personalized recommendations. What's on your mind today?",
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Witty sign-offs for personality
  const wittySignOffs = [
    "Have a dope day!",
    "Catch you on the flip side!",
    "Stay awesome!",
    "Keep it crispy!",
    "Don't forget to high-five yourself today."
  ]

  const getRandomSignOff = () => {
    return wittySignOffs[Math.floor(Math.random() * wittySignOffs.length)]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Keyboard detection for mobile
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const currentHeight = window.innerHeight
      const currentWidth = window.innerWidth
      
      // Only detect keyboard on mobile devices
      if (currentWidth <= 768) {
        if (viewportHeight === 0) {
          // Initial viewport height
          setViewportHeight(currentHeight)
        } else if (currentHeight < viewportHeight - 150) {
          // Keyboard is visible (viewport height reduced by more than 150px)
          setKeyboardVisible(true)
        } else if (currentHeight > viewportHeight - 100) {
          // Keyboard is hidden (viewport height restored)
          setKeyboardVisible(false)
        }
      }
    }

    // Set initial viewport height
    setViewportHeight(window.innerHeight)
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [viewportHeight])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Delay focus to prevent immediate viewport shift on mobile
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      
      // Add body class to prevent scrolling on mobile
      if (window.innerWidth <= 768) {
        document.body.classList.add('chat-open')
      }
    } else {
      // Remove body class when chat closes
      document.body.classList.remove('chat-open')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('chat-open')
    }
  }, [isOpen])

  // AI Response Generator
  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Product search
    if (lowerMessage.includes("keyboard") || lowerMessage.includes("mechanical")) {
      const keyboard = products.find(p => p.category === "keyboard")
      if (keyboard) {
        return {
          id: Date.now().toString(),
          content: `Yo! I found the perfect keyboard for you! The ${keyboard.name} is our premium mechanical keyboard with Cherry MX switches and RGB backlighting. Check it out in our Dope Picks section! ${getRandomSignOff()}`,
          sender: "ai",
          timestamp: new Date(),
          type: "product",
          product: keyboard
        }
      }
    }

    if (lowerMessage.includes("mouse") || lowerMessage.includes("gaming")) {
      const mouse = products.find(p => p.category === "mouse")
      if (mouse) {
        return {
          id: Date.now().toString(),
          content: `Hey there! Check out our ${mouse.name}! It features 25,600 DPI precision and programmable buttons perfect for gaming. You can find it in our marquee section above! ${getRandomSignOff()}`,
          sender: "ai",
          timestamp: new Date(),
          type: "product",
          product: mouse
        }
      }
    }

    if (lowerMessage.includes("headphone") || lowerMessage.includes("audio")) {
      const headphones = products.find(p => p.category === "audio")
      if (headphones) {
        return {
          id: Date.now().toString(),
          content: `Howdy! For audio, I recommend our ${headphones.name} with active noise cancellation and 40-hour battery life. It's featured in our Dope Recommendations section! ${getRandomSignOff()}`,
          sender: "ai",
          timestamp: new Date(),
          type: "product",
          product: headphones
        }
      }
    }

    // General recommendations
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggestion")) {
      const recommendations = products.slice(0, 3)
      return {
        id: Date.now().toString(),
        content: `Yo! Here are my top picks for you:\n\n${recommendations.map(p => `• ${p.name} - Rs ${p.price}`).join('\n')}\n\nThese are our most popular items with great reviews! Check out our Dope Picks marquee section for more! ${getRandomSignOff()}`,
        sender: "ai",
        timestamp: new Date(),
        type: "recommendation"
      }
    }

    // Price questions
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return {
        id: Date.now().toString(),
        content: `Hey there! Our prices range from Rs 2,999 for accessories to Rs 39,999 for premium keyboards. All products come with free shipping and a 30-day return policy. Check out our category filters to browse by price range! ${getRandomSignOff()}`,
        sender: "ai",
        timestamp: new Date(),
        type: "text"
      }
    }

    // Support questions
    if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
      return {
        id: Date.now().toString(),
        content: `Howdy! I'm here to help! I can assist with:\n• Product recommendations (check out our Dope Picks marquee!)\n• Pricing information\n• Technical specifications\n• Order status\n• Return policies\n\nWhat do you need help with? ${getRandomSignOff()}`,
        sender: "ai",
        timestamp: new Date(),
        type: "text"
      }
    }

    // Default response
    const responses = [
      `Yo! That's interesting! I'd be happy to help you find the perfect tech gear. Check out our Dope Picks marquee section for some inspiration! ${getRandomSignOff()}`,
      `Hey there! I'm here to help you discover amazing tech products! What specific features are you interested in? You can browse our category filters above too! ${getRandomSignOff()}`,
      `Howdy! Great question! Let me help you find exactly what you need. Are you looking for gaming gear, productivity tools, or audio equipment? Our Dope Recommendations section has some great picks! ${getRandomSignOff()}`,
      `Yo! I'd love to help you find the perfect product! What's your main use case - gaming, work, or entertainment? Check out our marquee for the latest drops! ${getRandomSignOff()}`
    ]
    
    return {
      id: Date.now().toString(),
      content: responses[Math.floor(Math.random() * responses.length)],
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const aiResponse = await generateAIResponse(inputValue)
    setMessages(prev => [...prev, aiResponse])
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleProductAddToCart = (product: Product) => {
    onAddToCart(product)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: `Yo! Added ${product.name} to your cart! Check out the shopping cart icon in the top right to see your items. ${getRandomSignOff()}`,
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    }])
  }

  return (
    <>
      {/* Mobile Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-4 md:bottom-8 md:left-6 z-50 frosted-glass-yellow frosted-glass-yellow-hover text-black p-4 rounded-full touch-manipulation flex items-center justify-center shadow-lg"
        style={{ minHeight: '56px', minWidth: '56px', maxWidth: '56px', maxHeight: '56px' }}
        aria-label="Open AI Chat Assistant"
      >
        {isOpen ? <X className="w-5 h-5 block text-[#F7DD0F]" /> : <MessageCircle className="w-5 h-5 block text-[#F7DD0F]" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden ${
            // Mobile: Full width with proper spacing
            'left-2 right-2 bottom-20 sm:bottom-24 ' +
            // Desktop: Fixed width, positioned on left side
            'md:left-6 md:right-auto md:bottom-24 md:w-96 lg:w-[28rem] xl:w-[32rem] ' +
            // Height adjustments
            (keyboardVisible ? 'bottom-4 sm:bottom-6' : '') +
            (keyboardVisible ? 'keyboard-visible' : '')
          }`}
          style={{ 
            // Mobile: Responsive height
            height: keyboardVisible 
              ? (window.innerWidth <= 640 ? '40vh' : '35vh')  // Smaller on mobile when keyboard is visible
              : (window.innerWidth <= 640 ? '50vh' : '60vh'), // Larger on mobile when keyboard is hidden
            // Desktop: Fixed height
            ...(window.innerWidth > 768 && {
              height: keyboardVisible ? '400px' : '500px',
              maxHeight: keyboardVisible ? '400px' : '500px',
              minHeight: keyboardVisible ? '350px' : '450px'
            }),
            // Mobile: Dynamic height constraints
            ...(window.innerWidth <= 768 && {
              maxHeight: keyboardVisible ? '300px' : '400px',
              minHeight: keyboardVisible ? '250px' : '300px'
            })
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 border-b border-white/20 bg-gradient-to-r from-[#F7DD0F] to-yellow-400 rounded-2xl flex-shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 min-w-0 flex-1">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#F7DD0F]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-black text-xs sm:text-sm md:text-base truncate">DopeTech AI</h3>
                <p className="text-xs text-black/70 truncate">
                  {keyboardVisible ? 'Typing...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-black/10 rounded-full transition-colors touch-manipulation"
                style={{ minHeight: '36px', minWidth: '36px' }}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 space-y-1 sm:space-y-1.5 md:space-y-2 lg:space-y-3 xl:space-y-4 scrollbar-hide min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[80%] md:max-w-[85%] lg:max-w-[90%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user" 
                      ? "bg-[#F7DD0F] text-black" 
                      : "bg-black/30 backdrop-blur-sm text-white"
                  }`}>
                    {message.sender === "user" ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  
                  <div className={`rounded-2xl px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 ${
                    message.sender === "user"
                      ? "bg-[#F7DD0F] text-black"
                      : "bg-black/30 backdrop-blur-md text-white border border-white/20"
                  }`}>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
                    
                    {/* Product Card */}
                    {message.type === "product" && message.product && (
                      <Card className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 bg-black/20 backdrop-blur-md border border-white/20">
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                          <img
                            src={message.product.image}
                            alt={message.product.name}
                            className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs sm:text-sm md:text-base lg:text-lg truncate text-white">{message.product.name}</h4>
                            <p className="text-[#F7DD0F] font-bold text-xs sm:text-sm md:text-base lg:text-lg">Rs {message.product.price.toLocaleString()}</p>
                          </div>
                          <Button
                            onClick={() => handleProductAddToCart(message.product!)}
                            className="bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 h-8 sm:h-10 md:h-12 touch-manipulation flex-shrink-0"
                            style={{ minHeight: '32px' }}
                          >
                            Add
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-black/30 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 border-t border-white/20 flex-shrink-0">
            <div className="flex space-x-1.5 sm:space-x-2 md:space-x-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={keyboardVisible ? "Type here..." : "Ask me anything..."}
                className="flex-1 bg-black/20 backdrop-blur-md border border-white/20 focus:ring-2 focus:ring-[#F7DD0F] text-white placeholder-white/60 text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 rounded-xl touch-manipulation"
                style={{ minHeight: '32px' }}
                onFocus={() => {
                  // Prevent viewport shift on mobile
                  if (window.innerWidth <= 768) {
                    setTimeout(() => {
                      window.scrollTo(0, window.scrollY)
                    }, 100)
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#F7DD0F] text-black hover:bg-[#F7DD0F]/90 disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12 p-0 rounded-xl touch-manipulation"
                style={{ minHeight: '32px', minWidth: '32px' }}
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 