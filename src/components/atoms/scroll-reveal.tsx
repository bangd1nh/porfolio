"use client"

import { useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

type ScrollRevealProps = {
  children: React.ReactNode
  className?: string
  /** Delay before transition starts once revealed (ms). */
  delayMs?: number
}

/**
 * Scroll reveal that replays every time the block enters the viewport.
 * SSR-safe: starts visible, then arms hide only for below-fold content.
 * prefers-reduced-motion → always shown, no transform.
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // Default shown — matches SSR; never start at opacity-0 on first paint.
  const [shown, setShown] = useState(true)

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    const node = ref.current
    if (!node) return

    const inView = () => {
      const rect = node.getBoundingClientRect()
      const vh = window.innerHeight
      return rect.top < vh * 0.94 && rect.bottom > vh * 0.06
    }

    if (!inView()) {
      setShown(false)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setShown(entry.isIntersecting)
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[550ms] ease-out motion-reduce:transition-none",
        shown || reducedMotion
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0",
        className
      )}
      style={
        delayMs > 0 && shown && !reducedMotion
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  )
}
