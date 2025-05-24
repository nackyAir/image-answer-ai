'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    value, 
    max = 100, 
    className, 
    showPercentage = true, 
    size = 'md', 
    variant = 'default',
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    }
    
    const variantClasses = {
      default: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      success: 'bg-gradient-to-r from-emerald-500 to-green-600',
      warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
      error: 'bg-gradient-to-r from-red-500 to-red-600'
    }

    return (
      <div className="w-full space-y-2">
        {showPercentage && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">アップロード中...</span>
            <span className="text-gray-800 font-semibold">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "w-full bg-gray-200 rounded-full overflow-hidden shadow-inner",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden",
              variantClasses[variant],
              animated && "shadow-lg"
            )}
            style={{ width: `${percentage}%` }}
          >
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
            {animated && percentage > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right" />
            )}
          </div>
        </div>
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress } 