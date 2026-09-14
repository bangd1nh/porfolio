import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HR_STACK_PRIORITY = [
  "TypeScript",
  "Next.js",
  "React",
  "NestJS",
] as const

export function sortStackForHr(stack: readonly string[]): string[] {
  const priority = new Map(
    HR_STACK_PRIORITY.map((tech, index) => [tech, index] as const)
  )
  return [...stack].sort((a, b) => {
    const pa = priority.get(a as (typeof HR_STACK_PRIORITY)[number]) ?? 999
    const pb = priority.get(b as (typeof HR_STACK_PRIORITY)[number]) ?? 999
    if (pa !== pb) return pa - pb
    return a.localeCompare(b)
  })
}

export type ProjectDetailsPanelProps = {
  period: string
  title: string
  role: string
  bullets: readonly string[]
  caseStudies: readonly { label: string; text: string }[]
  caseStudySectionLabel: string
  proofChips: readonly string[]
  stack: readonly string[]
  liveLinks: readonly { url: string; label: string }[]
  githubLinks: readonly { url: string; label: string }[]
  keyHighlightsLabel: string
  stackLabel: string
  className?: string
  "aria-label"?: string
}

/** HR scan panel — title, role, bullets, proof, stack, outbound links. */
export function ProjectDetailsPanel({
  period,
  title,
  role,
  bullets,
  caseStudies,
  caseStudySectionLabel,
  proofChips,
  stack,
  liveLinks,
  githubLinks,
  keyHighlightsLabel,
  stackLabel,
  className,
  "aria-label": ariaLabel,
}: ProjectDetailsPanelProps) {
  const sortedStack = sortStackForHr(stack)

  return (
    <article
      aria-label={ariaLabel}
      className={cn(
        "flex h-full min-h-0 flex-col gap-4 border-3 border-border-brutal bg-card p-4 shadow-brutal sm:p-5",
        className
      )}
    >
      <header className="grid shrink-0 min-w-0 gap-2">
        <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {period}
        </p>
        <h3 className="font-heading text-xl font-semibold tracking-tight break-words sm:text-2xl">
          {title}
        </h3>
        <p className="text-base font-semibold leading-snug text-foreground">
          {role}
        </p>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-y-auto content-start">
        <section className="grid min-w-0 gap-2">
        <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {keyHighlightsLabel}
        </h4>
        <ul className="grid list-disc gap-2 pl-4 text-sm leading-snug text-foreground marker:text-primary">
          {bullets.map((line) => (
            <li key={line} className="break-words">
              {line}
            </li>
          ))}
        </ul>
      </section>

      {caseStudies.length > 0 ? (
        <section className="grid min-w-0 gap-2">
          <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {caseStudySectionLabel}
          </h4>
          <ul className="grid gap-3">
            {caseStudies.map(({ label, text }) => (
              <li key={label} className="grid gap-1 border-l-2 border-primary pl-3">
                <p className="text-[11px] font-semibold tracking-wide text-foreground uppercase">
                  {label}
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {proofChips.length > 0 ? (
        <ul className="flex min-w-0 flex-wrap gap-1.5">
          {proofChips.map((proof) => (
            <li
              key={proof}
              className="inline-flex h-6 shrink-0 items-center whitespace-nowrap border border-primary bg-background px-2 font-mono text-[9px] font-semibold leading-none text-foreground uppercase dark:border-primary dark:bg-background"
            >
              {proof}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="grid min-w-0 gap-2">
        <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {stackLabel}
        </h4>
        <ul className="flex min-w-0 flex-wrap gap-1.5">
          {sortedStack.map((tech) => (
            <li
              key={tech}
              className="inline-flex h-6 shrink-0 items-center whitespace-nowrap border border-border bg-muted px-2 font-mono text-[10px] font-semibold leading-none text-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>
      </div>

      <footer className="flex shrink-0 min-w-0 flex-wrap gap-2 border-t border-border pt-3">
        {liveLinks.map((link) => (
          <Button
            key={link.url}
            size="sm"
            className="min-h-10 cursor-pointer rounded-none px-4 text-xs lg:min-h-9"
            nativeButton={false}
            render={
              <a href={link.url} target="_blank" rel="noopener noreferrer" />
            }
          >
            {link.label}
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </Button>
        ))}
        {githubLinks.map((link) => (
          <Button
            key={link.url}
            variant="outline"
            size="sm"
            className="min-h-10 cursor-pointer rounded-none px-4 text-xs lg:min-h-9"
            nativeButton={false}
            render={
              <a href={link.url} target="_blank" rel="noopener noreferrer" />
            }
          >
            {link.label}
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </Button>
        ))}
      </footer>
    </article>
  )
}
