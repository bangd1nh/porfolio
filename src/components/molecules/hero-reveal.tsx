"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

import { useGlobalLoader } from "@/components/providers/global-loader"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

type HeroRevealProps = {
  children: React.ReactNode
  className?: string
}

/** Coordinates the first hero reveal with the one-time session boot. */
export function HeroReveal({ children, className }: HeroRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { introReady } = useGlobalLoader()
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]")
      const previousSession =
        document.documentElement.dataset.portfolioBoot === "seen"

      if (reducedMotion || previousSession) {
        gsap.set(items, { clearProps: "all" })
        return
      }

      if (!introReady) {
        gsap.set(items, { autoAlpha: 0, y: 16 })
        return
      }

      gsap
        .timeline({ defaults: { duration: 0.55, ease: "power3.out" } })
        .fromTo(
          items,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.065,
            clearProps: "transform,opacity,visibility",
          }
        )
    },
    {
      scope: rootRef,
      dependencies: [introReady, reducedMotion],
      revertOnUpdate: true,
    }
  )

  return (
    <div ref={rootRef} className={cn("hero-motion", className)}>
      {children}
    </div>
  )
}
