"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import {
  readLoaderPresentation,
  type LoaderPresentation,
} from "@/lib/portfolio-loader-state"

type PortfolioBootLoaderProps = {
  phase: "boot" | "exit"
}

/** Branded boot sequence for the portfolio shell. */
export function PortfolioBootLoader({ phase }: PortfolioBootLoaderProps) {
  const t = useTranslations("loader")
  const [presentation] = useState<LoaderPresentation>(readLoaderPresentation)
  const { appearance, copy, elapsedMs: initialElapsedMs, startedAt } = presentation
  const [elapsedMs, setElapsedMs] = useState(initialElapsedMs)
  const syncedNodeRef = useRef<HTMLElement | null>(null)
  const syncAnimationClock = useCallback(
    (node: HTMLElement | null) => {
      if (!node || node === syncedNodeRef.current || startedAt <= 0) return
      syncedNodeRef.current = node
      const committedElapsedMs = Math.max(0, Date.now() - startedAt)
      node.style.setProperty(
        "--loader-elapsed",
        `${committedElapsedMs}ms`
      )
      setElapsedMs(committedElapsedMs)
    },
    [startedAt]
  )
  const steps = copy?.steps ?? [
    t("steps.initialize"),
    t("steps.work"),
    t("steps.github"),
    t("steps.ready"),
  ]

  return (
    <section
      ref={syncAnimationClock}
      className="portfolio-loader"
      data-phase={phase}
      style={
        {
          ...appearance,
          "--loader-elapsed": `${elapsedMs}ms`,
        } as React.CSSProperties
      }
      suppressHydrationWarning
      role="status"
      aria-live="polite"
      aria-label={copy?.label ?? t("label")}
    >
      <div className="portfolio-loader-panel">
        <p className="portfolio-loader-eyebrow">
          {copy?.eyebrow ?? t("eyebrow")}
        </p>
        <ol className="portfolio-loader-steps">
          {steps.map((step, index) => (
            <li
              key={step}
              style={{ "--loader-delay": index } as React.CSSProperties}
            >
              <span aria-hidden>{index === steps.length - 1 ? "✓" : ">"}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="portfolio-loader-progress" aria-hidden>
          <span />
        </div>
      </div>
    </section>
  )
}
