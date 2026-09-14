"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"

import { WebsitePreview } from "@/components/molecules/website-preview"
import { ProjectPreviewRail } from "@/components/molecules/project-preview-rail"
import { ProjectRevealCard } from "@/components/molecules/project-reveal-card"
import { DraggableHighlightNotes } from "@/components/molecules/draggable-highlight-notes"
import {
  ProjectNotesDeskDecor,
  type ShippingPressLabels,
} from "@/components/molecules/project-notes-desk-decor"
import { Button } from "@/components/ui/button"
import { PROJECT_SELECTION_EVENT } from "@/data/projects"
import type { ProjectPreviewType } from "@/data/projects"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

export type ProjectShowcaseItem = {
  id: string
  title: string
  descriptor: string
  role: string
  summary: string
  period: string
  teamSizeLabel: string
  stack: readonly string[]
  proof: readonly string[]
  highlights: readonly { label: string; text: string }[]
  liveLinks: readonly { url: string; label: string }[]
  previewType: ProjectPreviewType
  previewImage: string
  embedAllowed: boolean
}

type ProjectLiveLinksProps = {
  links: readonly { url: string; label: string }[]
  className?: string
  buttonClassName?: string
  variant?: "default" | "compact"
}

function ProjectLiveLinks({
  links,
  className,
  buttonClassName = "min-h-11 cursor-pointer rounded-none px-3 text-xs lg:min-h-9",
  variant = "default",
}: ProjectLiveLinksProps) {
  if (variant === "compact") {
    return (
      <ul className={cn("flex min-w-0 flex-wrap gap-1", className)}>
        {links.map((link) => (
          <li key={link.url} className="min-w-0 shrink-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-6 max-w-full items-center gap-1 border border-primary/70 bg-primary/10 dark:border-primary dark:bg-background px-2 font-mono text-[9px] font-semibold tracking-wide text-foreground uppercase transition-colors hover:bg-primary/20 dark:hover:bg-primary dark:hover:text-primary-foreground"
            >
              <span className="truncate">{link.label}</span>
              <ArrowUpRight className="size-3 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={className}>
      {links.map((link) => (
        <Button
          key={link.url}
          size="sm"
          className={buttonClassName}
          nativeButton={false}
          render={
            <a href={link.url} target="_blank" rel="noopener noreferrer" />
          }
        >
          {link.label}
          <ArrowUpRight data-icon="inline-end" aria-hidden />
        </Button>
      ))}
    </div>
  )
}

type ProjectTabButtonProps = {
  project: ProjectShowcaseItem
  index: number
  selected: boolean
  tablistId: string
  tabIndex: number
  onSelect: (index: number) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  tabRef: (node: HTMLButtonElement | null) => void
  className?: string
}

function ProjectTabButton({
  project,
  index,
  selected,
  tablistId,
  tabIndex,
  onSelect,
  onKeyDown,
  tabRef,
  className,
}: ProjectTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      ref={tabRef}
      id={`${tablistId}-tab-${project.id}`}
      aria-selected={selected}
      aria-controls={`${tablistId}-panel`}
      tabIndex={tabIndex}
      data-state={selected ? "active" : "inactive"}
      className={cn(
        "relative w-full min-h-14 cursor-pointer overflow-hidden border px-3 py-2.5 text-left",
        "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
        "group/tab after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 after:content-[''] motion-reduce:after:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        selected
          ? "border-primary bg-primary/10 dark:bg-background text-foreground shadow-[3px_3px_0_0_var(--primary)] after:scale-x-100"
          : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/40 hover:bg-muted hover:text-foreground",
        className
      )}
      onClick={() => onSelect(index)}
      onKeyDown={onKeyDown}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-heading block truncate text-sm font-semibold tracking-tight sm:text-base">
          {project.title}
        </span>
        <span
          className="font-mono text-[9px] text-muted-foreground group-data-[state=active]/tab:text-primary"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </span>
      <span className="mt-0.5 block truncate text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {project.descriptor}
      </span>
    </button>
  )
}

type ProjectDetailsBodyProps = {
  active: ProjectShowcaseItem
  roleLabel: string
  contextLabel: string
  stackLabel: string
  proofLabel: string
  notesHint: string
  shippingPressLabels: ShippingPressLabels
  showDecor: boolean
  compact?: boolean
}

function ProjectDetailsBody({
  active,
  roleLabel,
  contextLabel,
  stackLabel,
  proofLabel,
  notesHint,
  shippingPressLabels,
  showDecor,
  compact = false,
}: ProjectDetailsBodyProps) {
  const metaContent = (
    <>
      <header className="grid min-w-0 gap-1.5">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {active.period}
        </p>
        {compact ? (
          <div className="flex min-w-0 items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 font-heading text-base tracking-tight break-words">
              {active.title}
            </h3>
            <ProjectLiveLinks
              links={active.liveLinks}
              variant="compact"
              className="shrink-0 flex-nowrap justify-end"
            />
          </div>
        ) : (
          <>
            <ProjectLiveLinks
              links={active.liveLinks}
              variant="default"
              className="flex flex-wrap gap-1.5"
            />
            <h3 className="font-heading text-lg tracking-tight break-words sm:text-xl">
              {active.title}
            </h3>
          </>
        )}
        <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
          {roleLabel}
        </p>
        <p className="text-xs font-medium break-words text-foreground">
          <span
            className="mr-2 inline-block size-1.5 bg-primary align-middle"
            aria-hidden
          />
          {active.role}
        </p>
        <p className="mt-0.5 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
          {contextLabel}
        </p>
        <p
          className={cn(
            "text-xs leading-snug break-words text-muted-foreground",
            compact && "line-clamp-4"
          )}
        >
          {active.summary}
        </p>
        <div className="mt-1 grid min-w-0 gap-1.5">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
            {proofLabel}
          </p>
          <ul className="flex min-w-0 flex-nowrap gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[active.teamSizeLabel, ...active.proof].map((proof) => (
              <li
                key={proof}
                className="inline-flex h-5 shrink-0 items-center whitespace-nowrap border border-primary/60 bg-primary/10 dark:border-primary dark:bg-background px-1.5 font-mono text-[9px] font-semibold leading-none text-foreground uppercase"
              >
                {proof}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="grid min-w-0 gap-1">
        <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
          {stackLabel}
        </p>
        <ul
          className={cn(
            "flex min-w-0 gap-1",
            compact
              ? "flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              : "flex-wrap"
          )}
        >
          {active.stack.map((tech) => (
            <li
              key={tech}
              className="inline-flex h-5 shrink-0 items-center whitespace-nowrap border border-border bg-muted px-1.5 font-mono text-[9px] font-semibold leading-none text-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </>
  )

  return (
    <div
      className={cn(
        "grid gap-2.5",
        compact &&
          "flex h-full max-h-full min-h-0 flex-col gap-2 overflow-hidden"
      )}
    >
      {compact ? (
        <div className="min-h-0 min-w-0 shrink overflow-x-hidden overflow-y-auto overscroll-y-contain">
          {metaContent}
        </div>
      ) : (
        metaContent
      )}

      {showDecor ? (
        <div
          className={cn(
            "min-h-0 overflow-hidden",
            compact ? "min-h-[3.5rem] flex-1" : "min-h-14 shrink-0"
          )}
        >
          <ProjectNotesDeskDecor
            projectId={active.id}
            projectTitle={active.title}
            hint={notesHint}
            labels={shippingPressLabels}
          />
        </div>
      ) : null}
    </div>
  )
}

type ProjectsShowcaseProps = {
  projects: readonly ProjectShowcaseItem[]
  sectionLabel: string
  sectionTitle: string
  sectionDescription: string
  tabsLabel: string
  shippedLabel: string
  contextLabel: string
  roleLabel: string
  stackLabel: string
  proofLabel: string
  detailsCardLabel: string
  expandHint: string
  notesHint: string
  shippingPressLabels: ShippingPressLabels
}

/**
 * Tabbed projects — live embed left, shipped highlights right; one viewport on desktop.
 */
export function ProjectsShowcase({
  projects,
  sectionLabel,
  sectionTitle,
  sectionDescription,
  tabsLabel,
  shippedLabel,
  contextLabel,
  roleLabel,
  stackLabel,
  proofLabel,
  detailsCardLabel,
  expandHint,
  notesHint,
  shippingPressLabels,
}: ProjectsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const tablistId = useId()
  const pickerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const active = projects[activeIndex]

  const selectProject = useCallback((index: number, focus = false) => {
    const scrollY = window.scrollY
    setActiveIndex(index)
    setPickerOpen(false)

    window.requestAnimationFrame(() => {
      const tab = tabRefs.current[index]
      if (!tab) return

      if (focus) tab.focus()

      if (Math.abs(window.scrollY - scrollY) > 1) {
        window.scrollTo({ top: scrollY, behavior: "auto" })
      }
    })
  }, [])

  useEffect(() => {
    if (!pickerOpen || isDesktop) return

    const onPointerDown = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isDesktop, pickerOpen])

  useEffect(() => {
    if (!pickerOpen) return

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [pickerOpen])

  useEffect(() => {
    const onProjectSelect = (event: Event) => {
      const projectId = (event as CustomEvent<{ projectId?: string }>).detail
        ?.projectId
      const index = projects.findIndex((project) => project.id === projectId)
      if (index >= 0) selectProject(index)
    }

    window.addEventListener(PROJECT_SELECTION_EVENT, onProjectSelect)
    return () =>
      window.removeEventListener(PROJECT_SELECTION_EVENT, onProjectSelect)
  }, [projects, selectProject])

  useGSAP(
    () => {
      const panel = panelRef.current
      if (!panel) return

      const media = gsap.matchMedia()
      media.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        ({ conditions }) => {
          if (conditions?.reduceMotion) {
            gsap.set(panel, { clearProps: "all" })
            return
          }

          gsap.fromTo(
            panel,
            { autoAlpha: 0, y: 8 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.24,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
            }
          )
        }
      )

      return () => media.revert()
    },
    {
      scope: panelRef,
      dependencies: [active?.id],
      revertOnUpdate: true,
    }
  )

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | null = null

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (activeIndex + 1) % projects.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
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
    <>
      <header className="col-span-10 grid grid-cols-10 items-start gap-x-[inherit] gap-y-2 self-start lg:gap-y-0">
        <div className="col-span-10 grid min-w-0 gap-y-2 lg:col-span-7 lg:gap-y-1.5">
          <p className="system-label text-foreground">{sectionLabel}</p>
          <div className="grid gap-1 lg:gap-0.5">
            <h2 className="section-title lg:text-4xl [@media(min-width:1024px)_and_(max-height:50rem)]:text-3xl">
              {sectionTitle}
            </h2>
            <p className="section-description lg:text-sm [@media(min-width:1024px)_and_(max-height:50rem)]:hidden">
              {sectionDescription}
            </p>
          </div>
        </div>

        <div
          ref={pickerRef}
          className="relative z-30 col-span-10 w-full lg:col-span-3 lg:col-start-8 lg:justify-self-end"
          onMouseEnter={() => isDesktop && setPickerOpen(true)}
          onMouseLeave={() => isDesktop && setPickerOpen(false)}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            aria-controls={`${tablistId}-picker`}
            data-state="active"
            className={cn(
              "group/picker relative grid w-full min-h-14 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden border px-3 py-2.5 text-left sm:px-4",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-100 after:bg-primary after:content-['']",
              "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
              "border-primary bg-primary/10 dark:bg-background text-foreground shadow-[3px_3px_0_0_var(--primary)]",
              pickerOpen && "bg-primary/15 dark:bg-primary dark:text-primary-foreground"
            )}
            onClick={() => !isDesktop && setPickerOpen((open) => !open)}
          >
            <span className="min-w-0">
              <span className="flex items-center justify-between gap-3">
                <span className="font-heading block truncate text-sm font-semibold tracking-tight sm:text-base">
                  {active.title}
                </span>
                <span
                  className="font-mono text-[9px] text-primary"
                  aria-hidden
                >
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {active.descriptor}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-primary transition-transform duration-150 motion-reduce:transition-none",
                pickerOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          <div
            id={`${tablistId}-picker`}
            role="tablist"
            aria-label={tabsLabel}
            className={cn(
              "absolute top-full right-0 z-40 mt-0.5 grid w-full min-w-full gap-1.5 border border-border bg-card p-1.5 pt-1.5 shadow-[4px_4px_0_0_var(--border)]",
              "before:absolute before:-top-1 before:right-0 before:left-0 before:h-1 before:content-['']",
              "transition-[opacity,visibility] duration-150 motion-reduce:transition-none",
              pickerOpen
                ? "visible opacity-100"
                : "pointer-events-none invisible opacity-0"
            )}
          >
            {projects.map((project, index) => (
              <ProjectTabButton
                key={project.id}
                project={project}
                index={index}
                selected={index === activeIndex}
                tablistId={tablistId}
                tabIndex={index === activeIndex ? 0 : -1}
                onSelect={selectProject}
                onKeyDown={onTabKeyDown}
                tabRef={(node) => {
                  tabRefs.current[index] = node
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <div
        ref={panelRef}
        role="tabpanel"
        id={`${tablistId}-panel`}
        aria-labelledby={`${tablistId}-tab-${active.id}`}
        tabIndex={0}
        className="col-span-10 grid min-h-0 h-full gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring lg:relative lg:grid-rows-1 lg:gap-y-0"
      >
        <div className="relative min-h-[50vh] lg:h-full lg:min-h-0">
          <WebsitePreview
            key={active.id}
            url={active.liveLinks[0]?.url ?? ""}
            title={active.title}
            fallbackImage={active.previewImage}
            previewType={active.previewType}
            embedAllowed={active.embedAllowed}
            openLabel={active.liveLinks[0]?.label ?? ""}
            className="h-full min-h-[18rem] sm:min-h-[22rem] lg:min-h-0 lg:pe-[calc(var(--project-rail-width)+0.5rem)]"
          />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden h-full overflow-visible p-2 lg:block">
            <ProjectPreviewRail
              key={active.id}
              detailsLabel={detailsCardLabel}
              notesLabel={shippedLabel}
              notesBadge={String(active.highlights.length).padStart(2, "0")}
              className="h-full w-[var(--project-rail-width,3.25rem)]"
              details={
                <ProjectDetailsBody
                  active={active}
                  roleLabel={roleLabel}
                  contextLabel={contextLabel}
                  stackLabel={stackLabel}
                  proofLabel={proofLabel}
                  notesHint={notesHint}
                  shippingPressLabels={shippingPressLabels}
                  showDecor
                  compact
                />
              }
              notes={
                <DraggableHighlightNotes
                  projectId={active.id}
                  highlights={active.highlights}
                  label={shippedLabel}
                  layout="strip"
                  density="rail"
                />
              }
            />
          </div>
        </div>

        <div className="grid gap-2 lg:hidden">
          <ProjectRevealCard
            key={`${active.id}-details-mobile`}
            label={detailsCardLabel}
            expandHint={expandHint}
          >
            {(expanded) => (
              <ProjectDetailsBody
                active={active}
                roleLabel={roleLabel}
                contextLabel={contextLabel}
                stackLabel={stackLabel}
                proofLabel={proofLabel}
                notesHint={notesHint}
                shippingPressLabels={shippingPressLabels}
                showDecor={expanded}
              />
            )}
          </ProjectRevealCard>

          <ProjectRevealCard
            key={`${active.id}-notes-mobile`}
            label={shippedLabel}
            badge={String(active.highlights.length).padStart(2, "0")}
            expandHint={expandHint}
          >
            {() => (
              <DraggableHighlightNotes
                projectId={active.id}
                highlights={active.highlights}
                label={shippedLabel}
                layout="stack"
              />
            )}
          </ProjectRevealCard>
        </div>
      </div>
    </>
  )
}
