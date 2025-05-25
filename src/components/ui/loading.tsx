'use client';

import { type VariantProps, cva } from 'class-variance-authority';
import { Clock, Loader2, Zap } from 'lucide-react';
import * as React from 'react';

const loadingVariants = cva('flex items-center justify-center', {
  variants: {
    variant: {
      default: 'text-blue-500',
      destructive: 'text-red-500',
      secondary: 'text-gray-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
    },
    size: {
      sm: 'gap-2 text-sm',
      default: 'gap-3 text-base',
      lg: 'gap-4 text-lg',
    },
    animation: {
      spin: '',
      pulse: '',
      bounce: '',
      ping: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    animation: 'spin',
  },
});

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
    animation: {
      spin: 'animate-spin',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      ping: 'animate-ping',
    },
  },
  defaultVariants: {
    size: 'default',
    animation: 'spin',
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  icon?: 'loader' | 'clock' | 'zap';
  showText?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      text,
      icon = 'loader',
      showText = true,
      ...props
    },
    ref
  ) => {
    const getIcon = () => {
      const iconClass = iconVariants({ size, animation });

      switch (icon) {
        case 'clock':
          return <Clock className={iconClass} />;
        case 'zap':
          return <Zap className={iconClass} />;
        default:
          return <Loader2 className={iconClass} />;
      }
    };

    const getDefaultText = () => {
      switch (icon) {
        case 'clock':
          return '処理中...';
        case 'zap':
          return '生成中...';
        default:
          return '読み込み中...';
      }
    };

    return (
      <div
        ref={ref}
        className={`${loadingVariants({ variant, size })} ${className || ''}`}
        {...props}
      >
        {getIcon()}
        {showText && (
          <span className="font-medium">
            {text || getDefaultText()}
          </span>
        )}
      </div>
    );
  }
);
Loading.displayName = 'Loading';

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'default' | 'lg' }
>(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      ref={ref}
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${className || ''}`}
      {...props}
    />
  );
});
LoadingSpinner.displayName = 'LoadingSpinner';

const LoadingDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'default' | 'lg' }
>(({ className, size = 'default', ...props }, ref) => {
  const dotSizes = {
    sm: 'h-1 w-1',
    default: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  const gapSizes = {
    sm: 'gap-1',
    default: 'gap-1.5',
    lg: 'gap-2',
  };

  return (
    <div
      ref={ref}
      className={`flex items-center ${gapSizes[size]} ${className || ''}`}
      {...props}
    >
      <div
        className={`${dotSizes[size]} animate-pulse rounded-full bg-blue-500 [animation-delay:0ms]`}
      />
      <div
        className={`${dotSizes[size]} animate-pulse rounded-full bg-blue-500 [animation-delay:150ms]`}
      />
      <div
        className={`${dotSizes[size]} animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]`}
      />
    </div>
  );
});
LoadingDots.displayName = 'LoadingDots';

const LoadingPulse = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'default' | 'lg' }
>(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div ref={ref} className={`relative ${className || ''}`} {...props}>
      <div
        className={`${sizeClasses[size]} animate-ping rounded-full bg-blue-400 opacity-75`}
      />
      <div
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-blue-500`}
      />
    </div>
  );
});
LoadingPulse.displayName = 'LoadingPulse';

export { Loading, LoadingSpinner, LoadingDots, LoadingPulse, loadingVariants };