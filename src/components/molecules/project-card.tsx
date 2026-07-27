import { ArrowUpRight, FileText, GitBranch, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type ProjectCardProps = {
  title: string
  role: string
  summary: string
  period: string
  teamSizeLabel: string
  stack: readonly string[]
  highlights: readonly string[]
  liveUrl: string
  liveLabel: string
  githubUrl?: string
  githubBackendUrl?: string
  repoLabel: string
  repoBackendLabel?: string
  caseStudyHref?: string
  caseStudyLabel?: string
  className?: string
}

/**
 * Featured project card — flat surface, stack pills, highlights scroll in-pane on lg.
 */
export function ProjectCard({
  title,
  role,
  summary,
  period,
  teamSizeLabel,
  stack,
  highlights,
  liveUrl,
  liveLabel,
  githubUrl,
  githubBackendUrl,
  repoLabel,
  repoBackendLabel,
  caseStudyHref,
  caseStudyLabel,
  className,
}: ProjectCardProps) {
  return (
    <article
      className={cn(
        "col-span-10 grid gap-4 border border-border bg-card p-4 sm:gap-5 sm:p-5 md:grid-cols-10 md:gap-6 md:p-6",
        "lg:min-h-0 lg:overflow-hidden",
        "transition-[transform,border-color,box-shadow,background-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[4px_5px_0_0_oklch(0_0_0_/_0.12)]",
        "dark:hover:shadow-[4px_5px_0_0_oklch(0_0_0_/_0.45)]",
        "motion-reduce:transform-none motion-reduce:transition-none",
        className
      )}
    >
      <header className="grid content-start gap-2.5 md:col-span-4 md:min-h-0 md:overflow-y-auto md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden">
        <div className="grid gap-1">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {period}
          </p>
          <h3 className="font-heading text-xl tracking-tight sm:text-2xl lg:text-[1.65rem]">
            {caseStudyHref ? (
              <Link
                href={caseStudyHref}
                className="cursor-pointer underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="text-sm font-medium text-foreground">
            <span
              className="mr-2 inline-block size-1.5 bg-primary align-middle"
              aria-hidden
            />
            {role}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>

        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Users className="size-3.5" aria-hidden />
          {teamSizeLabel}
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <li
              key={tech}
              className="border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground transition-[background-color,border-color] duration-200 ease-out hover:border-foreground/30 hover:bg-card"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 pt-0.5">
          <Button
            size="sm"
            className="cursor-pointer rounded-none"
            nativeButton={false}
            render={
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            {liveLabel}
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </Button>
          {githubUrl ? (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-none"
              nativeButton={false}
              render={
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitBranch data-icon="inline-start" aria-hidden />
              {repoLabel}
            </Button>
          ) : null}
          {githubBackendUrl && repoBackendLabel ? (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-none"
              nativeButton={false}
              render={
                <a
                  href={githubBackendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitBranch data-icon="inline-start" aria-hidden />
              {repoBackendLabel}
            </Button>
          ) : null}
          {caseStudyHref && caseStudyLabel ? (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-none"
              nativeButton={false}
              render={<Link href={caseStudyHref} />}
            >
              <FileText data-icon="inline-start" aria-hidden />
              {caseStudyLabel}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-0 content-start md:col-span-6 lg:h-full lg:overflow-hidden">
        <ul className="grid gap-2 lg:min-h-0 lg:content-start lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden">
          {highlights.map((text) => (
            <li
              key={text}
              className="border-l-2 border-primary bg-muted/40 px-3 py-2 text-sm leading-snug text-foreground transition-colors duration-200 hover:bg-muted/70"
            >
              {text}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
