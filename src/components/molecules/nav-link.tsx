"use client"

import { useRef } from "react"

import { prefersReducedMotion, scrollToHashSection } from "@/lib/scroll-to-section"
import { cn } from "@/lib/utils"

type NavLinkProps = {
  href: string
  label: string
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
export function NavLink({ href, label, isActive, className, onNavigate }: NavLinkProps) {
  const activatedRef = useRef(false)

  return (
    <a
      href={href}
      className={cn(
        "cursor-pointer rounded-none px-2.5 py-2 text-sm font-medium tracking-wide xl:px-4",
        "transition-colors duration-200",
        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
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
      {label}
    </a>
  )
}
