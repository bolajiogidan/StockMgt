import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95',
      secondary: 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-95',
      outline: 'bg-transparent border border-outline-variant/30 text-primary hover:bg-surface-container-low active:scale-95',
      ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low active:scale-95',
      error: 'bg-error text-white shadow-lg shadow-error/20 hover:opacity-90 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-bold',
      md: 'px-4 py-2 text-sm font-bold',
      lg: 'px-6 py-3 text-base font-bold',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
