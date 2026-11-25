"use client"

import { ArrowRight, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { useHasChanged } from "@/hooks/use-has-changed"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

export type WorkIndexProject = {
  id: string
  icon: string
  title: string
  period: string
  outcome: string
  descriptor: string
  role: string
  stack: readonly string[]
  proof: readonly string[]
  liveUrl: string
  featured: boolean
}

type WorkIndexProps = {
  projects: readonly WorkIndexProject[]
  labels: {
    viewDetails: string
    live: string
    featured: string
    role: string
    stack: string
    cursorView: string
    cursorLive: string
  }
}

/** Seconds each project stays on stage before autoplay advances. */
const AUTOPLAY_SECONDS = 6
const STACK_PREVIEW = 6

const pad = (value: number) => String(value).padStart(2, "0")
const hostOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

/**
 * Selected work — an editorial index on the left drives a live "stage" on the
 * right. Hover or focus previews; click opens the case study. The stage
 * autoplays while the screen is in view and nobody is interacting.
 */
export function WorkIndex({ projects, labels }: WorkIndexProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [inView, setInView] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // Stage swaps animate in (CSS, keyed remount) — not on first paint.
  const stageChanged = useHasChanged(active)
  const autoplay = isDesktop && !reducedMotion && inView
  const project = projects[active] ?? projects[0]

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.5 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!project) return null

  return (
    <div
      ref={rootRef}
      className="col-span-10 grid min-h-0 grid-cols-subgrid gap-y-6 lg:grid-rows-[minmax(0,1fr)]"
      onPointerEnter={() => setInteracting(true)}
      onPointerLeave={() => setInteracting(false)}
    >
      <ol
        data-reveal-group
        data-reveal-stagger="0.08"
        className="col-span-10 grid content-start border-t border-border lg:col-span-5 lg:grid-rows-4 lg:content-stretch"
      >
        {projects.map((item, index) => {
          const isActive = index === active
          return (
            <li key={item.id} className="min-h-0">
              <TransitionLink
                href={`/projects/${item.id}`}
                prefetch={false}
                data-active={isActive}
                data-cursor-label={labels.cursorView}
                aria-current={isActive ? "true" : undefined}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="work-row group/row relative grid h-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-border py-5 outline-none focus-visible:bg-foreground/[0.04] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-4 lg:py-3"
              >
                <span className="work-row-index self-start pt-1.5 font-mono text-xs font-bold tracking-[0.12em] lg:self-center lg:pt-0">
                  {pad(index + 1)}
                </span>

                <span className="grid min-w-0 gap-1.5">
                  <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="work-row-title font-heading text-2xl leading-[1.08] font-bold tracking-tight break-words sm:text-3xl xl:text-[2.35rem] short:text-2xl">
                      {item.title}
                    </span>
                    {item.featured ? (
                      <span className="inline-flex h-5 items-center bg-primary px-1.5 font-mono text-[9px] font-bold tracking-wider text-primary-foreground uppercase">
                        {labels.featured}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:text-[11px]">
                    {item.descriptor}
                    <span className="mx-2 text-primary" aria-hidden>
                      /
                    </span>
                    {item.period}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/80 lg:hidden">
                    {item.outcome}
                  </span>
                </span>

                <span
                  className="work-row-arrow grid size-10 shrink-0 place-items-center border-2 border-border-brutal"
                  aria-hidden
                >
                  <ArrowRight className="size-4" />
                </span>

                {isActive && autoplay ? (
                  <span
                    key={`${item.id}-${active}`}
                    className="work-row-progress"
                    style={
                      {
                        "--work-autoplay": `${AUTOPLAY_SECONDS}s`,
                        animationPlayState: interacting ? "paused" : "running",
                      } as React.CSSProperties
                    }
                    onAnimationEnd={() =>
                      setActive((current) => (current + 1) % projects.length)
                    }
                    aria-hidden
                  />
                ) : null}
              </TransitionLink>
            </li>
          )
        })}
      </ol>

      <div data-reveal-group="clip" className="hidden min-h-0 lg:col-span-5 lg:grid">
        <WorkStage
          project={project}
          index={active}
          total={projects.length}
          labels={labels}
          animate={stageChanged}
        />
      </div>
    </div>
  )
}

function WorkStage({
  project,
  index,
  total,
  labels,
  animate,
}: {
  project: WorkIndexProject
  index: number
  total: number
  labels: WorkIndexProps["labels"]
  animate: boolean
}) {
  const extraStack = project.stack.length - STACK_PREVIEW

  return (
    <article
      data-spotlight
      className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] border-3 border-border-brutal bg-card shadow-brutal"
    >
      <header className="flex items-center gap-3 border-b-2 border-border-brutal px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 bg-primary" />
          <span className="size-2.5 border border-foreground/40" />
          <span className="size-2.5 border border-foreground/40" />
        </span>
        <span className="min-w-0 flex-1 truncate border border-foreground/15 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground/40">https://</span>
          <span
            key={project.id}
            className={cn("inline-block text-foreground", animate && "motion-enter-host")}
          >
            {hostOf(project.liveUrl)}
          </span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.12em]">
          <span className="pulse-dot size-1.5 bg-primary" aria-hidden />
          <span className="text-primary">{pad(index + 1)}</span>
          <span className="text-muted-foreground">/ {pad(total)}</span>
        </span>
      </header>

      <a
        href={project.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-label={labels.cursorLive}
        aria-label={`${labels.live}: ${project.title}`}
        className="work-stage-media relative grid min-h-0 place-items-center overflow-hidden border-b-2 border-border-brutal"
      >
        <span
          key={`n-${project.id}`}
          className={cn("work-stage-number", animate && "motion-enter-rise")}
          aria-hidden
        >
          {pad(index + 1)}
        </span>
        <span
          key={project.id}
          className={cn(
            "work-stage-sticker relative grid place-items-center",
            animate && "motion-enter-pop"
          )}
        >
            <Image
              src={project.icon}
              alt={`${project.title} logo`}
              width={320}
              height={200}
              unoptimized
            className="h-auto max-h-24 w-auto max-w-[11rem] object-contain short:max-h-16"
          />
        </span>
      </a>

        <div
          key={project.id}
          className={cn(
            "grid content-start gap-3 px-5 py-4 short:gap-2 short:py-3",
            animate && "motion-enter"
          )}
          style={{ "--enter-y": "18px" } as React.CSSProperties}
        >
          <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            {labels.role}
            <span className="mx-2 text-primary" aria-hidden>
              /
            </span>
            <span className="text-foreground">{project.role}</span>
          </p>
          <p className="font-heading text-xl leading-snug font-semibold tracking-tight text-balance short:text-lg">
            {project.outcome}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {project.proof.map((item) => (
              <li
                key={item}
                className="border border-primary/60 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-foreground uppercase"
              >
                {item}
              </li>
            ))}
          </ul>
          <ul
            className="flex flex-wrap gap-1.5 short:hidden"
            aria-label={labels.stack}
          >
            {project.stack.slice(0, STACK_PREVIEW).map((item) => (
              <li
                key={item}
                className="border border-foreground/15 px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </li>
            ))}
            {extraStack > 0 ? (
              <li className="px-1 py-0.5 font-mono text-xs text-muted-foreground">
                +{extraStack}
              </li>
            ) : null}
          </ul>
        </div>

      <footer className="flex flex-wrap gap-2 border-t border-border px-5 py-4 short:py-3">
        <Button
          className="group min-h-11 flex-1 rounded-none"
          nativeButton={false}
          render={<TransitionLink href={`/projects/${project.id}`} prefetch={false} />}
        >
          {labels.viewDetails}
          <ArrowRight
            data-icon="inline-end"
            className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden
          />
        </Button>
        <Button
          variant="outline"
          className="min-h-11 rounded-none"
          nativeButton={false}
          render={<a href={project.liveUrl} target="_blank" rel="noopener noreferrer" />}
        >
          {labels.live}
          <ArrowUpRight data-icon="inline-end" aria-hidden />
        </Button>
      </footer>
    </article>
  )
}
