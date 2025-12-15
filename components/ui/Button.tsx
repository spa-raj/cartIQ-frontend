'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'buy';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg';

    const variants = {
      // Amazon-style yellow "Buy" button
      primary:
        'bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] text-[#111111] hover:from-[#f5d78e] hover:to-[#eeb933] focus:ring-[#f0c14b] shadow-amazon hover:shadow-amazon-hover border border-[#a88734]',
      // Orange accent button
      secondary:
        'bg-[#ff9900] text-[#111111] hover:bg-[#ffad33] focus:ring-[#ff9900] shadow-sm hover:shadow-md font-bold',
      // Teal/link style
      accent:
        'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 shadow-sm hover:shadow-md',
      // Outline button
      outline:
        'border-2 border-surface-300 text-surface-700 hover:bg-surface-50 hover:border-surface-400 focus:ring-surface-400',
      // Ghost button
      ghost:
        'text-surface-700 hover:bg-surface-100 focus:ring-surface-400',
      // Danger button
      danger:
        'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-sm hover:shadow-md',
      // Amazon "Add to Cart" style
      buy:
        'bg-gradient-to-b from-[#ffad33] to-[#ff9900] text-[#111111] hover:from-[#ff9900] hover:to-[#e68a00] focus:ring-[#ff9900] shadow-amazon hover:shadow-amazon-hover border border-[#c77600] font-bold',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
