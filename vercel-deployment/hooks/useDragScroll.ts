import { useState, useRef, useCallback, useEffect } from 'react';

interface DragScrollOptions {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onScroll?: (scrollLeft: number) => void;
  sensitivity?: number;
  enableMomentum?: boolean;
  momentumDecay?: number;
}

export const useDragScroll = (options: DragScrollOptions = {}) => {
  const {
    onDragStart,
    onDragEnd,
    onScroll,
    sensitivity = 1,
    enableMomentum = true,
    momentumDecay = 0.95
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const momentumAnimationRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    setIsDragging(true);
    setIsScrolling(true);
    
    const container = containerRef.current;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    
    onDragStart?.();
  }, [onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    
    const container = containerRef.current;
    const deltaX = e.clientX - startXRef.current;
    const scrollDistance = deltaX * sensitivity;
    
    container.scrollLeft = startScrollLeftRef.current - scrollDistance;
    
    // Calculate velocity for momentum with improved fluidity
    const currentVelocity = e.clientX - lastXRef.current;
    velocityRef.current = currentVelocity * 0.9 + velocityRef.current * 0.1;
    lastXRef.current = e.clientX;
    
    onScroll?.(container.scrollLeft);
  }, [isDragging, sensitivity, onScroll]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !containerRef.current) return;
    
    setIsDragging(false);
    const container = containerRef.current;
    
    container.style.cursor = 'grab';
    container.style.userSelect = '';
    
    // Apply momentum scrolling if enabled
    if (enableMomentum && Math.abs(velocityRef.current) > 1) {
      applyMomentumScroll();
    } else {
      setIsScrolling(false);
    }
    
    onDragEnd?.();
  }, [isDragging, enableMomentum, onDragEnd]);

  const applyMomentumScroll = useCallback(() => {
    if (!containerRef.current || Math.abs(velocityRef.current) < 0.05) {
      setIsScrolling(false);
      return;
    }
    
    const container = containerRef.current;
    container.scrollLeft -= velocityRef.current;
    velocityRef.current *= momentumDecay;
    
    momentumAnimationRef.current = requestAnimationFrame(applyMomentumScroll);
  }, [momentumDecay]);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!containerRef.current || e.touches.length !== 1) return;
    
    setIsDragging(true);
    setIsScrolling(true);
    
    const container = containerRef.current;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startScrollLeftRef.current = container.scrollLeft;
    lastXRef.current = touch.clientX;
    velocityRef.current = 0;
    
    onDragStart?.();
  }, [onDragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;
    
    e.preventDefault();
    
    const container = containerRef.current;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current;
    const scrollDistance = deltaX * sensitivity;
    
    container.scrollLeft = startScrollLeftRef.current - scrollDistance;
    
    // Calculate velocity for momentum with improved fluidity
    const currentVelocity = touch.clientX - lastXRef.current;
    velocityRef.current = currentVelocity * 0.9 + velocityRef.current * 0.1;
    lastXRef.current = touch.clientX;
    
    onScroll?.(container.scrollLeft);
  }, [isDragging, sensitivity, onScroll]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum scrolling if enabled
    if (enableMomentum && Math.abs(velocityRef.current) > 1) {
      applyMomentumScroll();
    } else {
      setIsScrolling(false);
    }
    
    onDragEnd?.();
  }, [isDragging, enableMomentum, applyMomentumScroll, onDragEnd]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    setIsScrolling(true);
    
    const container = containerRef.current;
    const scrollAmount = e.deltaY * 0.8;
    
    container.scrollLeft += scrollAmount;
    
    // Reset scrolling state after a delay
    setTimeout(() => setIsScrolling(false), 200);
    
    onScroll?.(container.scrollLeft);
  }, [onScroll]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events
    container.addEventListener('mousedown', handleMouseDown as any);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Touch events
    container.addEventListener('touchstart', handleTouchStart as any);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    // Wheel events
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', handleMouseDown as any);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart as any);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      
      if (momentumAnimationRef.current) {
        cancelAnimationFrame(momentumAnimationRef.current);
      }
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return {
    isDragging,
    isScrolling,
    setContainerRef,
    scrollTo: useCallback((scrollLeft: number, smooth = true) => {
      if (!containerRef.current) return;
      containerRef.current.scrollTo({
        left: scrollLeft,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, []),
    scrollBy: useCallback((deltaX: number, smooth = true) => {
      if (!containerRef.current) return;
      containerRef.current.scrollBy({
        left: deltaX,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, [])
  };
};
