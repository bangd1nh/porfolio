import { cn } from "@/lib/utils"

const cardSurfaceClass = {
  sm: "glass-card-surface-sm glass-elevated",
  default: "glass-card-surface glass-elevated",
  lg: "glass-card-surface-lg glass-elevated",
} as const

type GlassCardProps = React.ComponentProps<"div"> & {
  variant?: keyof typeof cardSurfaceClass
}

function GlassCard({
  className,
  variant = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        cardSurfaceClass[variant],
        "relative z-0 grid gap-4 rounded-none p-6",
        className
      )}
      {...props}
    />
  )
}

function GlassCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-header"
      className={cn("relative z-[2] grid gap-1.5", className)}
      {...props}
    />
  )
}

function GlassCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="glass-card-title"
      className={cn(
        "font-heading relative z-[2] text-lg leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function GlassCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="glass-card-description"
      className={cn(
        "relative z-[2] text-sm leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function GlassCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-content"
      className={cn("relative z-[2]", className)}
      {...props}
    />
  )
}

function GlassCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-footer"
      className={cn("relative z-[2] grid grid-flow-col items-center justify-start gap-2 pt-2", className)}
      {...props}
    />
  )
}

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
}
