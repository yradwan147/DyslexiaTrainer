'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'lg', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-2xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
    
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-300 shadow-lg hover:shadow-xl',
      secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-300 shadow-md hover:shadow-lg',
      success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-300 shadow-lg hover:shadow-xl',
      danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-300 shadow-lg hover:shadow-xl',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-xl',
      xl: 'px-10 py-5 text-2xl',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

