import { cn } from "@/lib/utils"

type PageGridProps = React.ComponentProps<"div">

/**
 * Root 10-column page grid. Place PageSection (or col-span-full + subgrid) as children.
 */
export function PageGrid({ className, ...props }: PageGridProps) {
  return (
    <div
      data-slot="page-grid"
      className={cn(
        "page-grid pt-[var(--site-header-clearance)]",
        className
      )}
      {...props}
    />
  )
}

type PageSectionProps = React.ComponentProps<"section">

/**
 * Full-width section that participates in the parent 10-column tracks via subgrid.
 */
export function PageSection({ className, ...props }: PageSectionProps) {
  return (
    <section
      data-slot="page-section"
      className={cn("page-section", className)}
      {...props}
    />
  )
}
