import { cn } from "@/lib/utils"

type NavLinkProps = {
  href: string
  label: string
  isActive?: boolean
}

/** In-page hash anchors use plain `<a>` — App Router Link can break scroll targets. */
export function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "cursor-pointer rounded-none px-2.5 py-2 text-sm font-medium tracking-wide xl:px-4",
        "transition-colors duration-200",
        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </a>
  )
}
