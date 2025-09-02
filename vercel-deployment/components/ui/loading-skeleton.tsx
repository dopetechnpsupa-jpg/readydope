import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: "sm" | "md" | "lg" | "xl" | "full"
  animated?: boolean
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = "md", 
  animated = true 
}: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full"
  }

  return (
    <div
      className={cn(
        "skeleton",
        roundedClasses[rounded],
        animated && "animate-pulse",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

interface ProductCardSkeletonProps {
  className?: string
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg", className)}>
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category and rating */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>
        
        {/* Title */}
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        
        {/* Price */}
        <Skeleton className="w-24 h-6" />
        
        {/* Features */}
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-20 h-6" />
        </div>
        
        {/* Button */}
        <Skeleton className="w-full h-12" />
      </div>
    </div>
  )
}

interface GridSkeletonProps {
  count?: number
  className?: string
}

export function GridSkeleton({ count = 6, className }: GridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
} 