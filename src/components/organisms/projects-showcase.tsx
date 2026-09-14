"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"

import { WebsitePreview } from "@/components/molecules/website-preview"
import { ProjectDetailsPanel } from "@/components/molecules/project-details-panel"
import { PROJECT_SELECTION_EVENT, FEATURED_PROJECT_ID } from "@/data/projects"
import type { ProjectPreviewType } from "@/data/projects"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

export type ProjectShowcaseItem = {
  id: string
  title: string
  descriptor: string
  role: string
  period: string
  bullets: readonly string[]
  caseStudies: readonly { label: string; text: string }[]
  stack: readonly string[]
  proof: readonly string[]
  liveLinks: readonly { url: string; label: string }[]
  githubLinks: readonly { url: string; label: string }[]
  previewType: ProjectPreviewType
  previewUrl: string
  previewImage: string
  previewImageFallback?: string | undefined
  embedAllowed: boolean
}

type ProjectTabButtonProps = {
  project: ProjectShowcaseItem
  liveUrl: string
  prefetchEmbed: boolean
  isFeatured: boolean
  featuredBadgeLabel: string
  index: number
  selected: boolean
  tablistId: string
  tabIndex: number
  onSelect: (index: number) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  tabRef: (node: HTMLButtonElement | null) => void
  className?: string
}

function prefetchLivePreview(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return
    const existing = document.querySelector(
      `link[rel="prefetch"][href="${parsed.href}"]`
    )
    if (existing) return
    const link = document.createElement("link")
    link.rel = "prefetch"
    link.href = parsed.href
    document.head.append(link)
  } catch {
    // ignore invalid URLs
  }
}

function ProjectTabButton({
  project,
  liveUrl,
  prefetchEmbed,
  isFeatured,
  featuredBadgeLabel,
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
        "relative min-h-12 w-full min-w-[10.5rem] flex-1 cursor-pointer overflow-hidden border px-2.5 py-2 text-left sm:min-h-14 sm:px-3 sm:py-2.5 lg:min-w-0",
        "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
        "group/tab after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-150 after:content-[''] motion-reduce:after:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        selected
          ? "border-primary bg-primary/10 dark:bg-background text-foreground shadow-[3px_3px_0_0_var(--primary)] after:scale-x-100"
          : isFeatured
            ? "border-primary/70 bg-primary/5 text-foreground shadow-[2px_2px_0_0_var(--primary)] hover:border-primary hover:bg-primary/10"
            : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/40 hover:bg-muted hover:text-foreground",
        className
      )}
      onClick={() => onSelect(index)}
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        if (prefetchEmbed) prefetchLivePreview(liveUrl)
      }}
      onFocus={() => {
        if (prefetchEmbed) prefetchLivePreview(liveUrl)
      }}
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
      <span className="mt-0.5 flex min-w-0 items-center gap-2">
        <span className="truncate text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase group-data-[state=active]/tab:text-foreground">
          {project.descriptor}
        </span>
        {isFeatured ? (
          <span className="shrink-0 border border-primary bg-primary px-1.5 py-px font-mono text-[8px] font-semibold leading-none text-primary-foreground uppercase">
            {featuredBadgeLabel}
          </span>
        ) : null}
      </span>
    </button>
  )
}

type ProjectsShowcaseProps = {
  projects: readonly ProjectShowcaseItem[]
  sectionLabel: string
  sectionTitle: string
  sectionDescription: string
  tabsLabel: string
  keyHighlightsLabel: string
  caseStudySectionLabel: string
  featuredProjectBadge: string
  stackLabel: string
  detailsCardLabel: string
}

/**
 * Tabbed projects — preview + HR details panel (split on desktop).
 */
export function ProjectsShowcase({
  projects,
  sectionLabel,
  sectionTitle,
  sectionDescription,
  tabsLabel,
  keyHighlightsLabel,
  caseStudySectionLabel,
  featuredProjectBadge,
  stackLabel,
  detailsCardLabel,
}: ProjectsShowcaseProps) {
  const featuredIndex = projects.findIndex((p) => p.id === FEATURED_PROJECT_ID)
  const [activeIndex, setActiveIndex] = useState(
    featuredIndex >= 0 ? featuredIndex : 0
  )
  const tablistId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const active = projects[activeIndex]

  const selectProject = useCallback((index: number, focus = false) => {
    const scrollY = window.scrollY
    setActiveIndex(index)

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
    const links: HTMLLinkElement[] = []

    for (const project of projects) {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = project.previewImage
      document.head.append(link)
      links.push(link)
    }

    return () => {
      for (const link of links) {
        link.remove()
      }
    }
  }, [projects])

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
    <div
      data-projects-showcase
      className="col-span-10 grid min-h-0 h-full w-full grid-cols-subgrid gap-y-3 lg:grid-rows-[auto_minmax(0,1fr)]"
    >
      <header className="col-span-10 grid shrink-0 grid-cols-subgrid gap-y-3">
        <div className="col-span-10 grid min-w-0 gap-y-2 lg:gap-y-1.5">
          <p className="system-label text-foreground">{sectionLabel}</p>
          <div className="grid gap-1 lg:gap-0.5">
            <h2 className="section-title lg:text-4xl [@media(min-width:1024px)_and_(max-height:50rem)]:text-3xl">
              {sectionTitle}
            </h2>
            <p className="section-description lg:text-sm [@media(min-width:1024px)_and_(max-height:50rem)]:line-clamp-2">
              {sectionDescription}
            </p>
          </div>
        </div>

        <div
          id={`${tablistId}-tabs`}
          role="tablist"
          aria-label={tabsLabel}
          className="col-span-10 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin] lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
        >
          {projects.map((project, index) => (
            <ProjectTabButton
              key={project.id}
              project={project}
              liveUrl={project.previewUrl}
              prefetchEmbed={
                project.previewType !== "image" && project.embedAllowed
              }
              isFeatured={project.id === FEATURED_PROJECT_ID}
              featuredBadgeLabel={featuredProjectBadge}
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
      </header>

      <div
        ref={panelRef}
        data-projects-panel
        role="tabpanel"
        id={`${tablistId}-panel`}
        aria-labelledby={`${tablistId}-tab-${active.id}`}
        tabIndex={0}
        className="col-span-10 grid min-h-0 h-full gap-4 outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-10 lg:grid-rows-1 lg:items-stretch lg:gap-x-[var(--page-col-gap)] lg:gap-y-0"
      >
        <div className="min-h-0 flex-1 lg:col-span-6 lg:h-full lg:min-h-0">
          <WebsitePreview
            key={active.id}
            url={active.previewUrl}
            title={active.title}
            fallbackImage={active.previewImage}
            fallbackImageRemote={active.previewImageFallback}
            previewType={active.previewType}
            embedAllowed={active.embedAllowed}
            eager
            className="size-full min-h-[16rem] lg:min-h-0 lg:h-full"
          />
        </div>

        <ProjectDetailsPanel
          key={`${active.id}-details`}
          period={active.period}
          title={active.title}
          role={active.role}
          bullets={active.bullets}
          caseStudies={active.caseStudies}
          caseStudySectionLabel={caseStudySectionLabel}
          proofChips={active.proof}
          stack={active.stack}
          liveLinks={active.liveLinks}
          githubLinks={active.githubLinks}
          keyHighlightsLabel={keyHighlightsLabel}
          stackLabel={stackLabel}
          className="min-h-0 flex-1 lg:col-span-4 lg:h-full lg:min-h-0"
          aria-label={detailsCardLabel}
        />
      </div>
    </div>
  )
}
