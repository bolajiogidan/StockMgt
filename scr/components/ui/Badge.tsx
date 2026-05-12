import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'error' | 'warning' | 'success';
  className?: string;
}

const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-container/20 text-on-primary-container',
    secondary: 'bg-secondary-container/20 text-on-secondary-container',
    outline: 'border border-outline-variant/30 text-on-surface-variant',
    error: 'bg-error-container text-on-error-container',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    success: 'bg-secondary-container text-on-secondary-container',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center justify-center',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
