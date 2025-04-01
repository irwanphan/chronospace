import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

export default function Button({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'outline' && 'border border-gray-300 hover:bg-gray-50',
        variant === 'ghost' && 'hover:bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 