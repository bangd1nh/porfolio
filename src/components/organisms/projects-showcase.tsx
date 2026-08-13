"use client"

import { ArrowUpRight, GitBranch, Users } from "lucide-react"
import { useId, useState } from "react"

import { ProjectLiveEmbed } from "@/components/molecules/project-live-embed"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProjectShowcaseItem = {
  id: string
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
}

type ProjectsShowcaseProps = {
  projects: readonly ProjectShowcaseItem[]
  tabsLabel: string
  shippedLabel: string
  embedFallback: string
}

/**
 * Tabbed projects — live embed left, shipped highlights right; one viewport on desktop.
 */
export function ProjectsShowcase({
  projects,
  tabsLabel,
  shippedLabel,
  embedFallback,
}: ProjectsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const tablistId = useId()
  const active = projects[activeIndex]

  if (!active) return null

  return (
    <div className="grid h-full min-h-0 gap-3 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4">
      <div
        role="tablist"
        aria-label={tabsLabel}
        className="grid grid-flow-col auto-cols-fr gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={project.id}
              type="button"
              role="tab"
              id={`${tablistId}-tab-${project.id}`}
              aria-selected={selected}
              aria-controls={`${tablistId}-panel-${project.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "cursor-pointer border px-3 py-2.5 text-left transition-[background-color,border-color,color,box-shadow] duration-200",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected
                  ? "border-foreground bg-card text-foreground shadow-[3px_3px_0_0_oklch(0_0_0_/_0.12)] dark:shadow-[3px_3px_0_0_oklch(0_0_0_/_0.45)]"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/25 hover:bg-muted hover:text-foreground"
              )}
              onClick={() => setActiveIndex(index)}
            >
              <span className="block text-[10px] font-semibold tracking-widest uppercase">
                {project.period}
              </span>
              <span className="font-heading mt-0.5 block truncate text-sm font-semibold tracking-tight sm:text-base">
                {project.title}
              </span>
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${tablistId}-panel-${active.id}`}
        aria-labelledby={`${tablistId}-tab-${active.id}`}
        className="grid min-h-0 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-10 lg:items-stretch lg:gap-x-[inherit] lg:gap-y-0"
      >
        <ProjectLiveEmbed
          key={active.id}
          url={active.liveUrl}
          title={active.title}
          openLabel={active.liveLabel}
          fallbackHint={embedFallback}
          className="col-span-10 h-full min-h-[14rem] lg:col-span-6 lg:min-h-0"
        />

        <div className="col-span-10 grid h-fit min-h-0 w-full content-start gap-2.5 self-start overflow-y-auto border border-border bg-card p-3 lg:col-span-4 lg:h-full lg:max-h-full lg:gap-2 lg:p-3.5 lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden">
          <header className="grid gap-1">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {active.period}
            </p>
            <h3 className="font-heading text-lg tracking-tight sm:text-xl">
              {active.title}
            </h3>
            <p className="text-xs font-medium text-foreground">
              <span
                className="mr-2 inline-block size-1.5 bg-primary align-middle"
                aria-hidden
              />
              {active.role}
            </p>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {active.summary}
            </p>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Users className="size-3 shrink-0" aria-hidden />
              {active.teamSizeLabel}
            </p>
          </header>

          <ul className="flex flex-wrap gap-1">
            {active.stack.map((tech) => (
              <li
                key={tech}
                className="border border-border bg-muted px-1.5 py-px text-[10px] font-semibold text-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="grid gap-1.5">
            <h4 className="font-heading text-xs tracking-tight text-foreground">
              {shippedLabel}
            </h4>
            <ul className="grid gap-1.5">
              {active.highlights.map((text) => (
                <li
                  key={text}
                  className="border-l-2 border-primary bg-muted/40 px-2 py-1.5 text-[11px] leading-snug text-foreground"
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
            <Button
              size="sm"
              className="h-8 cursor-pointer rounded-none px-2.5 text-xs"
              nativeButton={false}
              render={
                <a
                  href={active.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {active.liveLabel}
              <ArrowUpRight className="size-4" aria-hidden />
            </Button>
            {active.githubUrl ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer rounded-none px-2.5 text-xs"
                nativeButton={false}
                render={
                  <a
                    href={active.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <GitBranch className="size-4" aria-hidden />
                {active.repoLabel}
              </Button>
            ) : null}
            {active.githubBackendUrl && active.repoBackendLabel ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer rounded-none px-2.5 text-xs"
                nativeButton={false}
                render={
                  <a
                    href={active.githubBackendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <GitBranch className="size-4" aria-hidden />
                {active.repoBackendLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
