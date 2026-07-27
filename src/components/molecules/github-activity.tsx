"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import type { CSSProperties } from "react"
import { useEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import type {
  GithubContributionWeek,
  GithubOrganization,
} from "@/lib/github-stats"

type GithubActivityProps = {
  contributions: number
  weeks: readonly GithubContributionWeek[]
  organizations: readonly GithubOrganization[]
  contributionsLabel: string
  organizationsLabel: string
  lessLabel: string
  moreLabel: string
  privateHint?: string | null
  locale?: string
  className?: string
  /** Smaller cells — use under hero so intro stays primary. */
  compact?: boolean
}

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-muted",
  1: "bg-primary/35",
  2: "bg-primary/55",
  3: "bg-primary/75",
  4: "bg-primary",
}

function monthLabels(
  weeks: readonly GithubContributionWeek[],
  locale: string
): Array<{
  label: string
  weekIndex: number
}> {
  const labels: Array<{ label: string; weekIndex: number }> = []
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.days[0]
    if (!firstDay) return
    const month = new Date(`${firstDay.date}T00:00:00`).getMonth()
    if (month === lastMonth) return
    const prev = labels[labels.length - 1]
    // Skip labels that would collide with the previous month name.
    if (prev && weekIndex - prev.weekIndex < 3) {
      lastMonth = month
      return
    }
    labels.push({
      label: new Date(`${firstDay.date}T00:00:00`).toLocaleString(locale, {
        month: "short",
      }),
      weekIndex,
    })
    lastMonth = month
  })

  return labels
}

function formatDayLabel(date: string, locale: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * GitHub-style contribution heatmap (6 months) + organization row.
 * Day cells and org chips use tooltips (hover); grid stays non-tabbable.
 */
export function GithubActivity({
  contributions,
  weeks,
  organizations,
  contributionsLabel,
  organizationsLabel,
  lessLabel,
  moreLabel,
  privateHint,
  locale = "en",
  className,
  compact = false,
}: GithubActivityProps) {
  const t = useTranslations("hero")
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // SSR-safe: start inview so above-fold cells animate on first paint.
  const [inView, setInView] = useState(true)
  const labels = monthLabels(weeks, locale)
  const summaryLabel = `${contributions.toLocaleString()} ${contributionsLabel}`
  const cell = compact
    ? "size-2.5 shrink-0 rounded-none"
    : "size-[11px] shrink-0 rounded-none"
  const cellTrack = compact ? "h-3 w-2.5" : "h-3 w-[11px]"
  const weekGap = "gap-[3px]"

  const orgBlurb = (org: GithubOrganization) => {
    const key = `github.orgTooltips.${org.login}` as const
    if (t.has(key)) return t(key)
    if (org.name && org.name !== org.login) return org.name
    return t("github.orgOpen", { login: org.login })
  }

  useEffect(() => {
    if (reducedMotion) {
      setInView(true)
      return
    }

    const node = rootRef.current
    if (!node) return

    const measureInView = () => {
      const rect = node.getBoundingClientRect()
      const vh = window.innerHeight
      return rect.top < vh * 0.94 && rect.bottom > vh * 0.06
    }

    if (!measureInView()) {
      setInView(false)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setInView(entry.isIntersecting)
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div
      ref={rootRef}
      className={cn(
        "grid w-fit max-w-full gap-2 justify-items-start border border-border bg-card",
        compact ? "p-3" : "gap-3 p-4",
        inView || reducedMotion ? "heatmap-inview" : null,
        className
      )}
    >
      <p
        className={cn(
          "font-semibold text-muted-foreground",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        <span
          className={cn(
            "font-heading font-bold text-foreground",
            compact ? "text-sm" : "text-base"
          )}
        >
          {contributions.toLocaleString()}
        </span>{" "}
        {contributionsLabel}
      </p>

      {weeks.length > 0 ? (
        <div className="grid w-max max-w-full gap-1" role="img" aria-label={summaryLabel}>
          <div className={cn("relative flex", weekGap)} aria-hidden>
            {weeks.map((_, weekIndex) => {
              const label = labels.find((item) => item.weekIndex === weekIndex)
              return (
                <span
                  key={`m-${weekIndex}`}
                  className={cn(
                    "relative shrink-0 text-[9px] leading-none text-muted-foreground",
                    cellTrack
                  )}
                >
                  {label ? (
                    <span className="absolute top-0 left-0 whitespace-nowrap">
                      {label.label}
                    </span>
                  ) : null}
                </span>
              )
            })}
          </div>

          <div className={cn("relative flex", weekGap)}>
            {weeks.map((week, weekIndex) => (
              <div
                key={week.days[0]?.date ?? `week-${weekIndex}`}
                className={cn("grid shrink-0 grid-rows-7", weekGap)}
              >
                {week.days.map((day, dayIndex) => {
                  const label = t("github.dayTooltip", {
                    count: day.count,
                    date: formatDayLabel(day.date, locale),
                  })
                  return (
                    <Tooltip key={day.date}>
                      <TooltipTrigger
                        delay={100}
                        render={
                          <span
                            className={cn(
                              cell,
                              LEVEL_CLASS[day.level],
                              "heatmap-cell block cursor-default"
                            )}
                            style={
                              {
                                "--cell-i": weekIndex * 7 + dayIndex,
                              } as CSSProperties
                            }
                          />
                        }
                      />
                      <TooltipContent side="top">{label}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground"
            aria-hidden
          >
            <span>{lessLabel}</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <span key={level} className={cn(cell, LEVEL_CLASS[level])} />
            ))}
            <span>{moreLabel}</span>
          </div>
        </div>
      ) : null}

      {privateHint ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {privateHint}
        </p>
      ) : null}

      {organizations.length > 0 ? (
        <details className="grid gap-2">
          <summary className="cursor-pointer text-[10px] font-semibold tracking-widest text-muted-foreground uppercase transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            {organizationsLabel}
          </summary>
          <ul className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <li key={org.login}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        href={org.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex cursor-pointer items-center gap-2 border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      />
                    }
                  >
                    <Image
                      src={org.avatarUrl}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 rounded-none"
                    />
                    <span>@{org.login}</span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-56 flex-col items-start gap-0.5 text-left"
                  >
                    <span className="font-semibold">@{org.login}</span>
                    <span className="text-background/80">{orgBlurb(org)}</span>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
