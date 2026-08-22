"use client"

import { useRef } from "react"

import { prefersReducedMotion, scrollToHashSection } from "@/lib/scroll-to-section"
import { cn } from "@/lib/utils"

type NavLinkProps = {
  href: string
  label: string
  index?: number
  isActive?: boolean
  className?: string
  onNavigate?: () => void
}

function activateHashLink(href: string) {
  if (!href.startsWith("#")) return
  scrollToHashSection(href, !prefersReducedMotion())
}

function releasePointerCapture(event: React.PointerEvent<HTMLAnchorElement>) {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

/**
 * In-page hash anchors use plain `<a>` — App Router Link can break scroll targets.
 * Pointer capture + preventDefault keep smooth scroll running when the cursor leaves
 * the link before mouseup (site-dock uses pointer-events: none on its shell).
 */
export function NavLink({
  href,
  label,
  index,
  isActive,
  className,
  onNavigate,
}: NavLinkProps) {
  const activatedRef = useRef(false)

  return (
    <a
      href={href}
      aria-current={isActive ? "location" : undefined}
      className={cn(
        "group relative flex cursor-pointer items-baseline gap-1.5 rounded-none px-2.5 py-2 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase xl:px-3",
        "transition-colors duration-200 after:absolute after:right-2.5 after:bottom-0.5 after:left-2.5 after:h-px after:origin-left after:bg-primary after:transition-transform after:duration-300",
        "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isActive
          ? "text-foreground after:scale-x-100"
          : "text-muted-foreground after:scale-x-0 hover:after:scale-x-100",
        className
      )}
      onPointerDown={(event) => {
        if (event.button !== 0 || !href.startsWith("#")) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        activatedRef.current = true
        activateHashLink(href)
        // Defer menu close so layout shift does not cancel smooth scroll.
        if (onNavigate) window.setTimeout(onNavigate, 450)
      }}
      onPointerUp={releasePointerCapture}
      onPointerCancel={releasePointerCapture}
      onClick={(event) => {
        if (!href.startsWith("#")) return
        event.preventDefault()
        if (activatedRef.current) {
          activatedRef.current = false
          return
        }
        activateHashLink(href)
        if (onNavigate) window.setTimeout(onNavigate, 450)
      }}
    >
      {index !== undefined ? (
        <span className="text-[9px] text-muted-foreground" aria-hidden>
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
      <span>{label}</span>
    </a>
  )
}
