'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-lg font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-6 py-4 text-xl rounded-2xl border-2
            transition-all duration-200
            focus:outline-none focus:ring-4
            ${error 
              ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-200' 
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-danger-500 text-base">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

