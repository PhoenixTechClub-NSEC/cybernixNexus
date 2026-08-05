import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato-jam disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variantStyles = {
      default:
        'bg-tomato-jam hover:bg-[#E8890C] text-white shadow-md shadow-tomato-jam/20 active:scale-[0.98]',
      outline:
        'border border-pine-teal/30 bg-white text-onyx shadow-sm hover:bg-golden-sand/10 hover:border-pine-teal/50',
      secondary:
        'bg-golden-sand/20 text-onyx hover:bg-golden-sand/40 border border-pine-teal/30',
      ghost: 'text-pine-teal hover:bg-golden-sand/12 hover:text-onyx',
      destructive: 'bg-tomato-jam text-white hover:bg-red-800 shadow-sm',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-xl px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
