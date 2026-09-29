"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Briefcase, GitBranch, GraduationCap } from "lucide-react"
import { useId, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

export type JourneyEntry = {
  id: string
  kind: "work" | "education"
  title: string
  subtitle: string
  period: string
  current?: boolean
  summary?: string
  bullets?: readonly string[]
  linkHref?: string
  linkLabel?: string
}

type JourneyTabsProps = {
  /** Chronological, oldest first. */
  entries: readonly JourneyEntry[]
  label: string
  currentLabel: string
  className?: string
}

/** Bullets beyond this are dropped on short desktop screens. */
const COMPACT_BULLETS = 3
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Horizontal career rail — each stop is a tab; the yellow track fills up to
 * the selected stop and its story opens below.
 */
export function JourneyTabs({ entries, label, currentLabel, className }: JourneyTabsProps) {
  const baseId = useId()
  const [active, setActive] = useState(entries.length - 1)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const entry = entries[active]
  const fill = entries.length > 1 ? active / (entries.length - 1) : 1

  if (!entry) return null

  const Icon = entry.kind === "education" ? GraduationCap : Briefcase
  const bullets = entry.bullets ?? []

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const step = event.key === "ArrowRight" ? 1 : -1
    const next = (active + step + entries.length) % entries.length
    setActive(next)
    document.getElementById(`${baseId}-tab-${next}`)?.focus()
  }

  return (
    <div className={cn("grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 short:gap-3", className)}>
      <div
        role="tablist"
        aria-label={label}
        className="journey-rail relative grid"
        style={
          {
            gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))`,
            "--journey-fill": fill,
            "--journey-count": entries.length,
          } as React.CSSProperties
        }
        onKeyDown={onKeyDown}
      >
        <span className="journey-track" aria-hidden />
        {entries.map((item, index) => {
          const selected = index === active
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              data-active={selected}
              data-passed={index <= active}
              onClick={() => setActive(index)}
              className="journey-stop group/stop grid min-w-0 cursor-pointer justify-items-start gap-2 pr-3 text-left outline-none"
            >
              <span className="max-w-full truncate font-mono text-[9px] leading-4 tracking-[0.06em] whitespace-nowrap text-muted-foreground sm:text-[10px] sm:tracking-[0.12em]">
                {item.period}
              </span>
              <span className="journey-node" aria-hidden />
              <span className="grid min-w-0 gap-0.5">
                <span className="journey-stop-title truncate font-heading text-base font-semibold tracking-tight sm:text-lg">
                  {item.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="relative max-h-full min-h-0 self-start overflow-hidden border-3 border-border-brutal bg-card shadow-brutal"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={entry.id}
            className="grid content-start gap-3 p-5 short:gap-2 short:p-4"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center bg-primary text-primary-foreground shadow-brutal-sm">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="grid min-w-0 gap-0.5">
                  <h3 className="font-heading text-xl leading-tight font-semibold tracking-tight">
                    {entry.title}
                  </h3>
                  <p className="text-sm font-medium text-foreground/80">{entry.subtitle}</p>
                </div>
              </div>
              <p className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {entry.current ? (
                  <span className="inline-flex items-center gap-1.5 border border-primary px-1.5 py-0.5 text-foreground">
                    <span className="pulse-dot size-1.5 bg-primary" aria-hidden />
                    {currentLabel}
                  </span>
                ) : null}
                {entry.period}
              </p>
            </header>

            {entry.summary ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {entry.summary}
              </p>
            ) : null}

            {bullets.length > 0 ? (
              <ul className="grid gap-2 border-t border-border pt-3">
                {bullets.map((bullet, index) => (
                  <motion.li
                    key={bullet}
                    className={cn(
                      "grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-sm leading-relaxed",
                      index >= COMPACT_BULLETS && "short:hidden"
                    )}
                    initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.06, duration: 0.4, ease: EASE }}
                  >
                    <span className="pt-0.5 font-mono text-[10px] font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{bullet}</span>
                  </motion.li>
                ))}
              </ul>
            ) : null}

            {entry.linkHref && entry.linkLabel ? (
              <a
                href={entry.linkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="system-link inline-flex min-h-11 w-fit items-center gap-1.5 sm:min-h-0"
              >
                <GitBranch className="size-3.5" aria-hidden />
                {entry.linkLabel}
              </a>
            ) : null}
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  )
}
