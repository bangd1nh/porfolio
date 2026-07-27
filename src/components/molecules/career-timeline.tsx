import { Briefcase, GitBranch, GraduationCap } from "lucide-react"

import { cn } from "@/lib/utils"

type TimelineEntry = {
  id: string
  kind: "work" | "education"
  title: string
  subtitle: string
  period: string
  summary?: string
  bullets?: readonly string[]
  linkHref?: string
  linkLabel?: string
}

type CareerTimelineProps = {
  entries: readonly TimelineEntry[]
  className?: string
}

/**
 * Vertical career rail — marker icons sit on a continuous line beside cards.
 */
export function CareerTimeline({ entries, className }: CareerTimelineProps) {
  return (
    <ol className={cn("relative grid gap-0", className)}>
      {/* Center of the 1.5rem marker track (0.75rem) */}
      <span
        className="absolute top-3 bottom-3 left-3 w-px -translate-x-1/2 bg-border"
        aria-hidden
      />
      {entries.map((entry) => {
        const Icon = entry.kind === "education" ? GraduationCap : Briefcase
        return (
          <li
            key={entry.id}
            className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4 pb-8 last:pb-0"
          >
            <div className="relative z-1 flex justify-center pt-1.5">
              <span className="grid size-6 shrink-0 place-items-center border border-border bg-card text-foreground">
                <Icon className="size-3" aria-hidden />
              </span>
            </div>
            <article className="min-w-0 grid gap-3 border border-border bg-card p-4 md:p-5">
              <header className="grid gap-1">
                <div className="grid gap-0.5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-3">
                  <h4 className="font-heading text-lg font-semibold tracking-tight">
                    {entry.title}
                  </h4>
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {entry.period}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  <span
                    className="mr-2 inline-block size-1.5 bg-primary align-middle"
                    aria-hidden
                  />
                  {entry.subtitle}
                </p>
                {entry.summary ? (
                  <p className="text-sm text-muted-foreground">{entry.summary}</p>
                ) : null}
              </header>
              {entry.bullets && entry.bullets.length > 0 ? (
                <ul className="grid gap-2 border-t border-border pt-3">
                  {entry.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.linkHref && entry.linkLabel ? (
                <a
                  href={entry.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit cursor-pointer items-center gap-1.5 border border-border bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <GitBranch className="size-3.5" aria-hidden />
                  {entry.linkLabel}
                </a>
              ) : null}
            </article>
          </li>
        )
      })}
    </ol>
  )
}
