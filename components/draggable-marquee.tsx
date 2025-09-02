import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useMarqueeControl } from '@/hooks/useMarqueeControl';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/lib/products-data';
import { getPrimaryImageUrl } from '@/lib/products-data';
import { generateProductUrl } from '@/lib/seo-utils';

interface DraggableMarqueeProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  className?: string;
  autoScroll?: boolean;
  scrollSpeed?: number;
  pauseOnHover?: boolean;
  showScrollHint?: boolean;
}

export const DraggableMarquee: React.FC<DraggableMarqueeProps> = ({
  products,
  onAddToCart,
  className = '',
  autoScroll = true,
  scrollSpeed = 20,
  pauseOnHover = true,
  showScrollHint = true
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  
  // State to track which products have been clicked once on mobile
  const [clickedProducts, setClickedProducts] = useState<Set<string>>(new Set());
  
  // Function to generate exactly 10 unique items for the marquee
  const generateMarqueeItems = () => {
    if (products.length === 0) return [];
    
    const targetItems = 10;
    const items = [];
    
    // Only use unique products, don't repeat
    for (let i = 0; i < Math.min(targetItems, products.length); i++) {
      const product = products[i];
      items.push({
        ...product,
        uniqueKey: `marquee-item-${i}-${product.id}`
      });
    }
    
    return items;
  };

  const marqueeItems = generateMarqueeItems();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(showScrollHint);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Marquee control hook
  const { 
    isPaused, 
    pauseMarquee, 
    resumeMarquee, 
    handleInteractionStart, 
    handleInteractionEnd,
    setMarqueeRef 
  } = useMarqueeControl();

  // Drag scroll hook
  const { 
    isDragging, 
    isScrolling, 
    setContainerRef 
  } = useDragScroll({
    onDragStart: () => {
      handleInteractionStart();
      setIsUserInteracting(true);
      setShowHint(false);
    },
    onDragEnd: () => {
      handleInteractionEnd(1000);
      setIsUserInteracting(false);
    },
    onScroll: () => {
      setIsUserInteracting(true);
      setShowHint(false);
    },
    sensitivity: 1.5,
    enableMomentum: true,
    momentumDecay: 0.88
  });

  // Handle product click based on mobile/desktop behavior
  const handleProductClick = (product: Product, e: React.MouseEvent) => {
    if (isMobile) {
      const productKey = product.uniqueKey || `product-${product.id}`;
      
      if (clickedProducts.has(productKey)) {
        // Second click - navigate to product details
        router.push(generateProductUrl(product));
        // Reset the clicked state after navigation
        setClickedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productKey);
          return newSet;
        });
      } else {
        // First click - show product info (don't navigate)
        e.preventDefault();
        e.stopPropagation();
        setClickedProducts(prev => new Set(prev).add(productKey));
      }
    } else {
      // Desktop behavior - navigate directly
      router.push(generateProductUrl(product));
    }
  };

  // Reset clicked products when switching between mobile/desktop
  useEffect(() => {
    setClickedProducts(new Set());
  }, [isMobile]);

  // Set up refs
  useEffect(() => {
    if (marqueeRef.current) {
      setMarqueeRef(marqueeRef.current);
    }
    if (containerRef.current) {
      setContainerRef(containerRef.current);
    }
  }, [setMarqueeRef, setContainerRef]);

  // Hide scroll hint after user interaction
  useEffect(() => {
    if (isUserInteracting && showHint) {
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isUserInteracting, showHint]);

  // Auto-hide hint after initial display
  useEffect(() => {
    if (showScrollHint) {
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showScrollHint]);

  // Handle mouse enter/leave for pause on hover
  const handleMouseEnter = () => {
    if (pauseOnHover && autoScroll) {
      pauseMarquee();
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && autoScroll && !isUserInteracting) {
      resumeMarquee();
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = () => {
    if (autoScroll) {
      pauseMarquee();
    }
    setIsUserInteracting(true);
    setShowHint(false);
  };

  const handleTouchEnd = () => {
    if (autoScroll && !isDragging) {
      setTimeout(() => {
        if (!isUserInteracting) {
          resumeMarquee();
        }
      }, 500);
    }
  };

  return (
    <div className={`relative overflow-hidden w-full marquee-full-width ${className}`}>
      {/* Scroll Hint */}
      {showHint && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 text-white text-sm animate-pulse">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs opacity-80">Drag to scroll</span>
        </div>
      )}

      {/* Marquee Container */}
      <div
        ref={containerRef}
        className={`
          relative overflow-x-auto scrollbar-hide cursor-grab fluid-scroll drag-feedback
          ${isDragging ? 'cursor-grabbing' : ''}
          ${autoScroll ? 'overflow-hidden' : 'overflow-x-auto'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          scrollBehavior: isDragging ? 'auto' : 'smooth'
        }}
        role="region"
        aria-label="Product carousel - drag to scroll freely"
        tabIndex={0}
      >
        {/* Marquee Content */}
        <div
          ref={marqueeRef}
          className={`
            flex space-x-2 sm:space-x-6 md:space-x-8 marquee-content-full
            ${autoScroll ? 'animate-marquee' : ''}
            ${isUserInteracting ? 'user-scrolling' : ''}
          `}
          style={{
            animationDuration: `${scrollSpeed}s`,
            animationPlayState: isPaused || isUserInteracting ? 'paused' : 'running'
          }}
        >
          {/* Marquee Items - Exactly 10 items */}
          {marqueeItems.map((product, index) => {
            const productKey = product.uniqueKey || `product-${product.id}`;
            const isClicked = clickedProducts.has(productKey);
            
            return (
              <div 
                key={product.uniqueKey} 
                className="group relative flex-shrink-0"
              >
                <div 
                  className="relative overflow-hidden rounded-2xl w-40 h-32 sm:w-48 sm:h-36 md:w-56 md:h-40 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={(e) => handleProductClick(product, e)}
                >
                  <img
                    src={getPrimaryImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                    draggable={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.svg';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                    isMobile && isClicked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  {/* Product Info Overlay */}
                  <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 transition-transform duration-300 ${
                    isMobile && isClicked ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                  }`}>
                    <h3 className="text-white text-kelpt-a2 text-sm sm:text-base md:text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-[#F7DD0F] price-proxima-nova text-sm sm:text-base md:text-lg mb-3">Rs {product.price}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="bg-[#F7DD0F] text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-semibold hover:bg-[#F7DD0F]/90 transition-all duration-200 hover:scale-105 shadow-lg text-xs sm:text-sm w-full btn-fluid"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Duplicate set for seamless loop (only if auto-scrolling) */}
          {autoScroll && marqueeItems.map((product, index) => {
            const productKey = product.uniqueKey || `product-${product.id}`;
            const isClicked = clickedProducts.has(productKey);
            
            return (
              <div 
                key={`duplicate-${product.uniqueKey}`} 
                className="group relative flex-shrink-0"
              >
                <div 
                  className="relative overflow-hidden rounded-2xl w-40 h-32 sm:w-48 sm:h-36 md:w-56 md:h-40 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={(e) => handleProductClick(product, e)}
                >
                  <img
                    src={getPrimaryImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                    draggable={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.svg';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                    isMobile && isClicked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  {/* Product Info Overlay */}
                  <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 transition-transform duration-300 ${
                    isMobile && isClicked ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                  }`}>
                    <h3 className="text-white text-kelpt-a2 text-sm sm:text-base md:text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-[#F7DD0F] price-proxima-nova text-sm sm:text-base md:text-lg mb-3">Rs {product.price}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="bg-[#F7DD0F] text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-semibold hover:bg-[#F7DD0F]/90 transition-all duration-200 hover:scale-105 shadow-lg text-xs sm:text-sm w-full btn-fluid"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
    </div>
  );
};
