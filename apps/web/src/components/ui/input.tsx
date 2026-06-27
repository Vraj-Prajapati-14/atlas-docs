import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md px-3 py-2 text-sm',
        'bg-background-card border',
        'placeholder:text-muted-foreground',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-danger/70 text-danger focus-visible:ring-danger/30'
          : 'border-border focus-visible:border-primary-500 focus-visible:ring-primary-500/20',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
