import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant block ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2 bg-surface-container-low border-2 border-transparent rounded-xl text-sm transition-all duration-200 outline-none",
            "placeholder:text-on-surface-variant/40",
            "focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5",
            error && "border-error/50 focus:border-error focus:ring-error/5",
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] font-bold text-error mt-0.5 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
