'use client'

import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'outline' && 'border border-foreground/20 bg-transparent hover:bg-foreground/5 hover:border-foreground',
        size === 'sm' && 'h-8 px-3 text-xs rounded-full',
        size === 'default' && 'h-9 px-4 py-2 text-sm rounded-md',
        size === 'lg' && 'h-11 px-8 text-base rounded-full',
        className,
      )}
      {...props}
    />
  )
}
