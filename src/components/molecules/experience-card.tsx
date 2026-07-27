import { Briefcase } from "lucide-react"

import { cn } from "@/lib/utils"

type ExperienceCardProps = {
  company: string
  role: string
  period: string
  summary: string
  bullets: readonly string[]
  className?: string
}

/**
 * Work experience block — company, role, period, and achievement bullets.
 */
export function ExperienceCard({
  company,
  role,
  period,
  summary,
  bullets,
  className,
}: ExperienceCardProps) {
  return (
    <article
      className={cn(
        "col-span-10 grid gap-4 border border-border bg-card p-5 md:p-6",
        className
      )}
    >
      <header className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-3">
        <span className="grid size-9 place-items-center border border-border bg-muted text-foreground">
          <Briefcase className="size-4" aria-hidden />
        </span>
        <div className="grid gap-1">
          <div className="grid gap-0.5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4">
            <h3 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
              {company}
            </h3>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {period}
            </p>
          </div>
          <p className="text-sm font-medium text-foreground">
            <span className="mr-2 inline-block size-1.5 bg-primary align-middle" aria-hidden />
            {role}
          </p>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </header>

      <ul className="grid gap-2 border-t border-border pt-4">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground"
          >
            {bullet}
          </li>
        ))}
      </ul>
    </article>
  )
}
