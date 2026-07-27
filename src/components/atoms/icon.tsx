import type { LucideIcon, LucideProps } from "lucide-react"

import { cn } from "@/lib/utils"

type IconProps = LucideProps & {
  icon: LucideIcon
}

/**
 * Thin Lucide wrapper for consistent default sizing.
 * Prefer importing icons from `lucide-react` directly when no shared sizing is needed.
 */
export function Icon({
  icon: IconComponent,
  className,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
  ...props
}: IconProps) {
  return (
    <IconComponent
      className={cn("size-4 shrink-0", className)}
      aria-hidden={ariaLabel ? undefined : (ariaHidden ?? true)}
      aria-label={ariaLabel}
      {...props}
    />
  )
}
