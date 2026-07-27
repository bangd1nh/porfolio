import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type BentoStatCardProps = {
  title?: string
  value?: string
  description?: string
  icon?: LucideIcon
  className?: string
  children?: React.ReactNode
  variant?: "primary" | "surface"
}

/**
 * Reusable bento cell — position/size via className or style from parent layout.
 */
export function BentoStatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  children,
  variant = "surface",
}: BentoStatCardProps) {
  return (
    <article
      className={cn(
        "group grid size-full min-w-0 content-center gap-2 overflow-hidden rounded-none border border-border p-4",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "surface" && "bg-card text-card-foreground",
        className
      )}
    >
      {(Icon || title) && (
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon className="size-4 shrink-0 opacity-80" aria-hidden /> : null}
          {title ? (
            <h3 className="truncate text-xs font-semibold tracking-wide uppercase opacity-80">
              {title}
            </h3>
          ) : null}
        </div>
      )}

      {value ? (
        <p className="font-heading truncate text-3xl font-bold tracking-tight md:text-4xl">
          {value}
        </p>
      ) : null}

      {description ? (
        <p className="truncate text-xs leading-snug opacity-75">{description}</p>
      ) : null}

      {children}
    </article>
  )
}
