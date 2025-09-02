"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface DVDBouncerProps {
  children: ReactNode
  speed?: number
  className?: string
  trailColor?: string
  repelDistance?: number
  repelForce?: number
}

export default function DVDBouncer({
  children,
  speed = 0.8,
  className = "",
  trailColor = "rgba(247, 221, 15, 0.3)",
  repelDistance = 120,
  repelForce = 2,
}: DVDBouncerProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: speed, y: speed })
  const animationRef = useRef<number | undefined>(undefined)
  const trailPositions = useRef<Array<{ x: number; y: number; opacity: number }>>([])
  const mousePositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const element = elementRef.current
    const trail = trailRef.current
    if (!element || !trail) return

    const container = element.parentElement
    if (!container) return

    // Initialize random starting position
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    positionRef.current = {
      x: Math.random() * (containerRect.width - elementRect.width),
      y: Math.random() * (containerRect.height - elementRect.height),
    }

    // Random initial direction
    velocityRef.current = {
      x: (Math.random() > 0.5 ? 1 : -1) * speed,
      y: (Math.random() > 0.5 ? 1 : -1) * speed,
    }

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect()
      mousePositionRef.current = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      }
    }

    document.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      if (!element || !container || !trail) return

      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      const maxX = containerRect.width - elementRect.width
      const maxY = containerRect.height - elementRect.height

      // Calculate distance to mouse
      const elementCenterX = positionRef.current.x + elementRect.width / 2
      const elementCenterY = positionRef.current.y + elementRect.height / 2

      const mouseX = mousePositionRef.current.x
      const mouseY = mousePositionRef.current.y

      const distanceToMouse = Math.sqrt(Math.pow(elementCenterX - mouseX, 2) + Math.pow(elementCenterY - mouseY, 2))

      // Apply repulsion force if mouse is close
      if (distanceToMouse < repelDistance && distanceToMouse > 0) {
        const repelStrength = (repelDistance - distanceToMouse) / repelDistance
        const repelX = ((elementCenterX - mouseX) / distanceToMouse) * repelForce * repelStrength
        const repelY = ((elementCenterY - mouseY) / distanceToMouse) * repelForce * repelStrength

        velocityRef.current.x += repelX
        velocityRef.current.y += repelY

        // Limit maximum velocity
        const maxVelocity = speed * 3
        const currentSpeed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.y ** 2)
        if (currentSpeed > maxVelocity) {
          velocityRef.current.x = (velocityRef.current.x / currentSpeed) * maxVelocity
          velocityRef.current.y = (velocityRef.current.y / currentSpeed) * maxVelocity
        }
      } else {
        // Gradually return to normal speed when mouse is far
        const normalSpeed = speed
        const currentSpeed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.y ** 2)
        if (currentSpeed > normalSpeed) {
          const dampening = 0.98
          velocityRef.current.x *= dampening
          velocityRef.current.y *= dampening
        }
      }

      // Add current position to trail
      trailPositions.current.unshift({
        x: positionRef.current.x,
        y: positionRef.current.y,
        opacity: 1,
      })

      // Keep only last 8 positions and fade them
      if (trailPositions.current.length > 8) {
        trailPositions.current = trailPositions.current.slice(0, 8)
      }

      // Update trail opacities
      trailPositions.current = trailPositions.current.map((pos, index) => ({
        ...pos,
        opacity: Math.max(0, 1 - index * 0.15),
      }))

      // Update position
      positionRef.current.x += velocityRef.current.x
      positionRef.current.y += velocityRef.current.y

      // Bounce off walls
      if (positionRef.current.x <= 0 || positionRef.current.x >= maxX) {
        velocityRef.current.x *= -1
        positionRef.current.x = Math.max(0, Math.min(maxX, positionRef.current.x))
      }

      if (positionRef.current.y <= 0 || positionRef.current.y >= maxY) {
        velocityRef.current.y *= -1
        positionRef.current.y = Math.max(0, Math.min(maxY, positionRef.current.y))
      }

      // Apply position to main element
      element.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`

      // Create trail effect
      const trailElements = trailPositions.current
        .map(
          (pos, index) =>
            `<div style="position: absolute; left: ${pos.x}px; top: ${pos.y}px; opacity: ${pos.opacity}; transform: scale(${1 - index * 0.1}); transition: opacity 0.1s ease-out; pointer-events: none;">${element.innerHTML}</div>`,
        )
        .join("")

      trail.innerHTML = trailElements

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [speed, trailColor, repelDistance, repelForce])

  return (
    <>
      <div
        ref={trailRef}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: `drop-shadow(0 0 8px ${trailColor})` }}
      />
      <div ref={elementRef} className={`dvd-bouncer ${className}`}>
        {children}
      </div>
    </>
  )
}
