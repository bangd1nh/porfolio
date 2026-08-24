"use client"

import { ArrowUpRight, Users } from "lucide-react"
import { useId, useRef, useState, type KeyboardEvent } from "react"

import { ProjectLiveEmbed } from "@/components/molecules/project-live-embed"
import { DraggableHighlightNotes } from "@/components/molecules/draggable-highlight-notes"
import {
  ProjectNotesDeskDecor,
  type ShippingPressLabels,
} from "@/components/molecules/project-notes-desk-decor"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProjectShowcaseItem = {
  id: string
  title: string
  descriptor: string
  role: string
  summary: string
  period: string
  teamSizeLabel: string
  stack: readonly string[]
  highlights: readonly { label: string; text: string }[]
  liveUrl: string
  liveLabel: string
}

type ProjectsShowcaseProps = {
  projects: readonly ProjectShowcaseItem[]
  tabsLabel: string
  shippedLabel: string
  contextLabel: string
  roleLabel: string
  stackLabel: string
  notesHint: string
  shippingPressLabels: ShippingPressLabels
  embedFallback: string
}

/**
 * Tabbed projects — live embed left, shipped highlights right; one viewport on desktop.
 */
export function ProjectsShowcase({
  projects,
  tabsLabel,
  shippedLabel,
  contextLabel,
  roleLabel,
  stackLabel,
  notesHint,
  shippingPressLabels,
  embedFallback,
}: ProjectsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const tablistId = useId()
  const tablistRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const active = projects[activeIndex]

  const selectProject = (index: number, focus = false) => {
    const scrollY = window.scrollY
    setActiveIndex(index)

    window.requestAnimationFrame(() => {
      const tab = tabRefs.current[index]
      const tablist = tablistRef.current
      if (!tab || !tablist) return

      if (focus) tab.focus()

      const left = tab.offsetLeft - (tablist.clientWidth - tab.offsetWidth) / 2
      tablist.scrollTo({
        left: Math.max(0, left),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      })

      if (Math.abs(window.scrollY - scrollY) > 1) {
        window.scrollTo({ top: scrollY, behavior: "auto" })
      }
    })
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | null = null

    if (event.key === "ArrowRight") {
      nextIndex = (activeIndex + 1) % projects.length
    } else if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + projects.length) % projects.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = projects.length - 1
    }

    if (nextIndex === null) return
    event.preventDefault()
    selectProject(nextIndex, true)
  }

  if (!active) return null

  return (
    <div className="grid h-full min-h-0 gap-3 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label={tabsLabel}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-px-0.5 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={project.id}
              type="button"
              role="tab"
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              id={`${tablistId}-tab-${project.id}`}
              aria-selected={selected}
              aria-controls={`${tablistId}-panel`}
              tabIndex={selected ? 0 : -1}
              data-state={selected ? "active" : "inactive"}
              className={cn(
                "relative min-h-14 min-w-[min(17rem,78vw)] flex-none snap-start cursor-pointer overflow-hidden border px-3 py-2.5 text-left",
                "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
                "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 after:content-[''] motion-reduce:after:transition-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                "sm:min-w-52 lg:min-w-0 lg:flex-1 lg:snap-none",
                "[@media(min-width:1024px)_and_(max-height:50rem)]:py-1.5",
                selected
                  ? "border-foreground bg-card text-foreground shadow-[3px_3px_0_0_oklch(0_0_0_/_0.12)] after:scale-x-100 dark:shadow-[3px_3px_0_0_oklch(0_0_0_/_0.45)]"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/40 hover:bg-muted hover:text-foreground"
              )}
              onClick={() => selectProject(index)}
              onKeyDown={onTabKeyDown}
            >
              <span className="font-heading block truncate text-sm font-semibold tracking-tight sm:text-base">
                {project.title}
              </span>
              <span className="mt-0.5 block truncate text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {project.descriptor}
              </span>
            </button>
          )
        })}
      </div>

      <div
        key={active.id}
        role="tabpanel"
        id={`${tablistId}-panel`}
        aria-labelledby={`${tablistId}-tab-${active.id}`}
        tabIndex={0}
        className="grid min-h-0 gap-4 outline-none animate-in fade-in-0 duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:animate-none lg:h-full lg:min-h-0 lg:grid-cols-10 lg:items-stretch lg:gap-x-[inherit] lg:gap-y-0"
      >
        <ProjectLiveEmbed
          url={active.liveUrl}
          title={active.title}
          openLabel={active.liveLabel}
          fallbackHint={embedFallback}
          className="col-span-10 h-full min-h-[14rem] lg:col-span-6 lg:min-h-0"
        />

        <div className="relative col-span-10 grid h-fit min-h-0 w-full content-start gap-2.5 self-start border border-border bg-card p-3 lg:col-span-4 lg:h-full lg:max-h-full lg:grid-rows-[auto_auto_minmax(0,1fr)_minmax(5.5rem,9.5rem)] lg:gap-2 lg:overflow-hidden lg:p-3.5 [@media(min-width:1024px)_and_(max-height:50rem)]:grid-rows-[auto_auto_minmax(0,1fr)_6.5rem] [@media(min-width:1024px)_and_(max-height:50rem)]:gap-1.5 [@media(min-width:1024px)_and_(max-height:50rem)]:p-3">
          <header className="grid gap-1 lg:pr-28 [@media(min-width:1024px)_and_(max-height:50rem)]:gap-0.5">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {active.period}
            </p>
            <h3 className="font-heading text-lg tracking-tight sm:text-xl [@media(min-width:1024px)_and_(max-height:50rem)]:text-base">
              {active.title}
            </h3>
            <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
              {roleLabel}
            </p>
            <p className="text-xs font-medium text-foreground">
              <span
                className="mr-2 inline-block size-1.5 bg-primary align-middle"
                aria-hidden
              />
              {active.role}
            </p>
            <p className="mt-0.5 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase [@media(min-width:1024px)_and_(max-height:50rem)]:hidden">
              {contextLabel}
            </p>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground [@media(min-width:1024px)_and_(max-height:50rem)]:hidden">
              {active.summary}
            </p>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground [@media(min-width:1024px)_and_(max-height:50rem)]:hidden">
              <Users className="size-3 shrink-0" aria-hidden />
              {active.teamSizeLabel}
            </p>
          </header>

          <div className="grid gap-1">
            <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
              {stackLabel}
            </p>
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
          </div>

          <div className="grid min-h-0 gap-1.5 lg:h-full lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)]">
            <h4 className="font-heading text-xs tracking-tight text-foreground">
              {shippedLabel}
            </h4>
            <DraggableHighlightNotes
              key={active.id}
              projectId={active.id}
              highlights={active.highlights}
              label={shippedLabel}
            />
          </div>

          <ProjectNotesDeskDecor
            key={active.id}
            projectId={active.id}
            projectTitle={active.title}
            hint={notesHint}
            labels={shippingPressLabels}
          />

          <div className="flex flex-wrap gap-1.5 border-t border-border pt-2 lg:absolute lg:top-3.5 lg:right-3.5 lg:z-10 lg:border-0 lg:p-0">
            <Button
              size="sm"
              className="min-h-11 cursor-pointer rounded-none px-3 text-xs lg:min-h-9"
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
              <ArrowUpRight data-icon="inline-end" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
