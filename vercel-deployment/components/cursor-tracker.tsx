"use client"

import { useEffect } from "react"

// Note: CursorTracker is now opt-in and not used by default
export default function CursorTracker() {
  useEffect(() => {
    // Enhanced mobile detection
    const isTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      )
    }
    
    // Don't create custom cursor on touch devices
    if (isTouchDevice()) {
      // Hide cursor on mobile devices
      document.body.style.cursor = 'none'
      return
    }

    let cleanup: (() => void) | null = null

    const setup = () => {
      const cursor = document.createElement("div")
      cursor.className = "custom-cursor"
      cursor.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: #F7DD0F;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease-out, scale 0.2s ease;
        box-shadow: 0 0 15px rgba(247, 221, 15, 0.6), 0 0 30px rgba(247, 221, 15, 0.3);
      `
      document.body.appendChild(cursor)

      const moveCursor = (e: MouseEvent) => {
        cursor.style.left = e.clientX + "px"
        cursor.style.top = e.clientY + "px"
      }

      const handleMouseEnter = () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1.5)"
        cursor.style.boxShadow = "0 0 25px rgba(247, 221, 15, 0.8), 0 0 50px rgba(247, 221, 15, 0.4)"
      }

      const handleMouseLeave = () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)"
        cursor.style.boxShadow = "0 0 15px rgba(247, 221, 15, 0.6), 0 0 30px rgba(247, 221, 15, 0.3)"
      }

      document.addEventListener("mousemove", moveCursor, { passive: true })

      // Add hover effects to interactive elements
      const interactiveElements = document.querySelectorAll("button, a, .cursor-hover")
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter)
        el.addEventListener("mouseleave", handleMouseLeave)
      })

      cleanup = () => {
        document.removeEventListener("mousemove", moveCursor)
        interactiveElements.forEach((el) => {
          el.removeEventListener("mouseenter", handleMouseEnter)
          el.removeEventListener("mouseleave", handleMouseLeave)
        })
        // Safe removal of cursor element
        if (cursor && cursor.parentNode && cursor.parentNode.contains(cursor)) {
          try {
            cursor.parentNode.removeChild(cursor)
          } catch (error) {
            console.warn('Cursor element already removed:', error)
          }
        }
        // Restore cursor on cleanup
        document.body.style.cursor = ''
      }
    }

    // Defer to browser idle time when possible
    const idle = (window as any).requestIdleCallback as undefined | ((cb: () => void) => number)
    let idleId: number | null = null
    if (typeof idle === 'function') {
      idleId = idle(setup)
    } else {
      // Fallback after first paint
      setTimeout(setup, 0)
    }

    return () => {
      if (idleId && (window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(idleId)
      }
      if (cleanup) cleanup()
    }
  }, [])

  return null
}
