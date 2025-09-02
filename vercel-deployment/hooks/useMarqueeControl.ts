import { useState, useCallback, useEffect, useRef } from 'react';

export const useMarqueeControl = () => {
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const marqueeRef = useRef<HTMLElement | null>(null);

  const pauseMarquee = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPaused(true);
    
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = 'paused';
    } else {
      const marquee = document.querySelector('.animate-marquee') as HTMLElement;
      if (marquee) {
        marquee.style.animationPlayState = 'paused';
      }
    }
  }, []);

  const resumeMarquee = useCallback((delay: number = 0) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        if (marqueeRef.current) {
          marqueeRef.current.style.animationPlayState = 'running';
        } else {
          const marquee = document.querySelector('.animate-marquee') as HTMLElement;
          if (marquee) {
            marquee.style.animationPlayState = 'running';
          }
        }
      }, delay);
    } else {
      setIsPaused(false);
      if (marqueeRef.current) {
        marqueeRef.current.style.animationPlayState = 'running';
      } else {
        const marquee = document.querySelector('.animate-marquee') as HTMLElement;
        if (marquee) {
          marquee.style.animationPlayState = 'running';
        }
      }
    }
  }, []);

  const handleInteractionStart = useCallback(() => {
    pauseMarquee();
  }, [pauseMarquee]);

  const handleInteractionEnd = useCallback((delay: number = 500) => {
    resumeMarquee(delay);
  }, [resumeMarquee]);

  const setMarqueeRef = useCallback((element: HTMLElement | null) => {
    marqueeRef.current = element;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isPaused,
    pauseMarquee,
    resumeMarquee,
    handleInteractionStart,
    handleInteractionEnd,
    setMarqueeRef
  };
};
