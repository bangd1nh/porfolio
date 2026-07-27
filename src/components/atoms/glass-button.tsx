import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "relative z-0 inline-flex shrink-0 items-center justify-center gap-2 rounded-none border border-border text-sm font-semibold whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:relative [&_svg]:z-[2] [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-card text-foreground hover:bg-muted active:scale-[0.98]",
        primary:
          "border-primary bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]",
        outline:
          "bg-transparent text-foreground hover:bg-muted active:scale-[0.98]",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-muted active:scale-[0.98]",
        destructive:
          "border-destructive bg-destructive text-white hover:brightness-95 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function GlassButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof glassButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="glass-button"
      className={cn(glassButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { GlassButton, glassButtonVariants }
