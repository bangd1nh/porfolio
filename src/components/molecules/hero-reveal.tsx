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

/**
 * Hero entrance, coordinated with the one-time session boot: masked headline
 * lines rise, the accent block sweeps in, then supporting blocks stagger up.
 */
export function HeroReveal({ children, className }: HeroRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { introReady } = useGlobalLoader()
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]")
      const headline = rootRef.current?.querySelector<HTMLElement>(
        "[data-hero-headline]"
      )
      const mark = rootRef.current?.querySelector<HTMLElement>("[data-hero-mark]")

      if (reducedMotion) {
        gsap.set([...items, headline, mark], { clearProps: "all" })
        return
      }

      if (!introReady) {
        gsap.set([...items, headline], { autoAlpha: 0 })
        return
      }

      rootRef.current?.setAttribute("data-hero-ready", "")
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

      if (headline) {
        gsap.set(headline, { autoAlpha: 1 })
        tl.from(headline.querySelectorAll("[data-word]"), {
          yPercent: 115,
          rotate: 5,
          duration: 1.1,
          stagger: 0.05,
          clearProps: "transform",
        })
      }

      if (mark) {
        tl.from(
          mark,
          { scaleX: 0, duration: 0.8, ease: "expo.inOut" },
          headline ? 0.45 : 0
        )
      }

      tl.fromTo(
        items,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "transform,opacity,visibility",
        },
        headline ? 0.35 : 0
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
