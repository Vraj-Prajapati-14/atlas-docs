import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'text-sm font-semibold transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-white shadow-[0_4px_16px_rgba(255,107,53,0.28)] hover:bg-primary-400 hover:shadow-[0_4px_20px_rgba(255,107,53,0.4)]',
        secondary:
          'bg-transparent text-foreground border border-border hover:border-primary-500 hover:text-primary-500',
        ghost:
          'text-muted-foreground hover:bg-white/5 hover:text-foreground',
        danger:
          'bg-transparent text-danger border border-danger/30 hover:bg-danger/10 hover:border-danger/60',
        outline:
          'border border-border bg-transparent hover:bg-white/5 text-foreground',
        success:
          'bg-success/10 text-success border border-success/30 hover:bg-success/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-5',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { buttonVariants }
