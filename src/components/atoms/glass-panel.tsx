import { cn } from "@/lib/utils"

type GlassPanelProps = React.ComponentProps<"div"> & {
  variant?: "default" | "sm" | "lg"
}

const variantClass = {
  default: "glass",
  sm: "glass-sm",
  lg: "glass-lg",
} as const

export function GlassPanel({
  variant = "default",
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(variantClass[variant], "rounded-none", className)}
      {...props}
    />
  )
}
