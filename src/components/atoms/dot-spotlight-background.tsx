"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type DotSpotlightBackgroundProps = {
  className?: string
}

/**
 * Full-viewport dotted grid; a circular region brightens around the cursor.
 */
export function DotSpotlightBackground({ className }: DotSpotlightBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const pointerQuery = window.matchMedia("(pointer: fine)")

    const syncSpot = (x: number, y: number) => {
      root.style.setProperty("--spot-x", `${x}px`)
      root.style.setProperty("--spot-y", `${y}px`)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (motionQuery.matches || !pointerQuery.matches) return
      syncSpot(event.clientX, event.clientY)
    }

    syncSpot(window.innerWidth * 0.5, window.innerHeight * 0.35)
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn("dot-spotlight pointer-events-none fixed inset-0 z-0", className)}
    />
  )
}
